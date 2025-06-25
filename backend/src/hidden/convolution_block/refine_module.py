import logging
from typing import List
from src.base_method.module import Module
from src.base_method.data import Dataset
from src.data_structure import Survey
from src.hidden.convolution_block.neurons import (
    SelfRefineNeuron,
    ModifyOutlineNeuron,
    EvalOutlineNeuron,
)
from src.prompts import PromptsProtocol

logger = logging.getLogger(__name__)

class SelfRefineModule(Module):
    def __init__(self, config, refine_count, best_of, prompts: PromptsProtocol):
        super().__init__()
        self.refine_count = refine_count
        self.best_of = best_of
        self.single_refine_module = SingleRefineModule(config, prompts)

    def forward(self, survey: Survey) -> List[float]:
        title = survey.title
        bibkeys = survey.papers.keys()
        new_outline = survey.skeleton
        self_refine_score = []
        for i in range(self.refine_count):
            old_outline = new_outline.all_skeleton(
                construction=True, analysis=True, with_index=True
            )
            eval_detail = new_outline.eval_detail

            logger.info(
                f"Self-refine module: Survey {survey.title} refine count: {i} start, best of {self.best_of}"
            )
            new_outlines = self.single_refine_module(
                Dataset(
                    [
                        (title, old_outline, eval_detail, bibkeys)
                        for _ in range(self.best_of)
                    ],
                )
            )

            new_outlines = sorted(
                new_outlines, key=lambda x: x.eval_score, reverse=True
            )
            new_outline = new_outlines[0]
            all_score = [x.eval_score for x in new_outlines]
            self_refine_score.append(all_score)
            logger.info(
                f"Self-refine module: Survey {survey.title} refine count: {i} end, best score: {new_outline.eval_score}, all scores: {all_score}"
            )

        survey = survey.update_outline(
            "```markdown\n"
            + new_outline.all_skeleton(construction=True, analysis=True, with_index=True)
            + "\n```"
        )
        survey.self_refine_score.append(self_refine_score)
        survey.best_of = self.best_of
        survey.refine_count = self.refine_count
        return survey


class SingleRefineModule(Module):
    def __init__(self, config, prompts: PromptsProtocol):
        super().__init__()
        self.suggestion_neuron = SelfRefineNeuron(config["refine"], prompts)
        self.modify_outline_neuron = ModifyOutlineNeuron(
            config["modify"], "single_suggestion", prompts
        )
        self.eval_outline_neuron = EvalOutlineNeuron(config["eval"], prompts)

    def forward(self, title, old_outline, eval_detail, bibkeys) -> List[float]:
        new_suggestion = self.suggestion_neuron(title, old_outline, eval_detail)

        new_outline = self.modify_outline_neuron(
            title, [new_suggestion], old_outline, bibkeys
        )
        score_ret = self.eval_outline_neuron(
            title,
            new_outline.all_skeleton(construction=True, analysis=True, with_index=True),
        )

        new_outline.eval_score = score_ret[0]
        new_outline.eval_detail = score_ret[1]
        new_outline.suggestion = new_suggestion.content
        logger.info(f"Single refine module finished: Survey {title}")
        logger.debug(
            f"Survey {title} score: {new_outline.eval_score}\nsuggestion: {new_outline.suggestion}\n\noutline: \n{new_outline.all_skeleton(construction=True, analysis=True, with_index=True)}"
        )
        return new_outline
