import logging
from typing import Protocol, cast
from importlib import import_module

logger = logging.getLogger(__name__)


class PromptsProtocol(Protocol):
    """Protocol defining all required prompts for the survey writing system"""

    # Group related prompts
    GROUP_PROMPT: str

    # Outline related prompts
    INIT_OUTLINE_PROMPT: str
    CONCAT_OUTLINE_PROMPT: str
    MODIFY_OUTLINE_PROMPT: str
    OUTLINE_CONVOLUTION_PROMPT: str
    OUTLINE_ENTROPY_PROMPT: str
    RESIDUAL_MODIFY_OUTLINE_PROMPT: str

    # Digest related prompts
    SINGLE_DIGEST_PROMPT: str
    DIGEST_BASE_PROMPT: str
    DIGEST_FREE_PROMPT: str

    # Orchestra related prompts
    ORCHESTRA_PROMPT: str
    SUMMARY_PROMPT: str
    POLISH_PROMPT: str
    CHART_PROMPT: str

    # Search related prompts
    QUERY_EXPAND_PROMPT_WITH_ABSTRACT: str
    QUERY_EXPAND_PROMPT_WITHOUT_ABSTRACT: str
    LLM_CHECK_PROMPT: str
    SNIPPET_FILTER_PROMPT: str

    # Crawl related prompts
    PAGE_REFINE_PROMPT: str
    SIMILARITY_PROMPT: str


class PromptLoader:
    DEFAULT_LANGUAGE = "en"

    def __init__(self, language: str = DEFAULT_LANGUAGE):
        self.language = language
        self.prompts: PromptsProtocol = self._load_prompts()

    def _load_prompts(self) -> PromptsProtocol:
        """Load prompts based on language setting"""
        try:
            module = import_module(f".prompts_{self.language}", package="src.prompts")
            return cast(PromptsProtocol, module)
        except ImportError:
            logger.warning(
                f"Unsupported language: {self.language}, falling back to {self.DEFAULT_LANGUAGE}"
            )
            self.language = self.DEFAULT_LANGUAGE
            module = import_module(
                f".prompts_{self.DEFAULT_LANGUAGE}", package="src.prompts"
            )
            return cast(PromptsProtocol, module)
