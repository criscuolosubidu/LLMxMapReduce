from typing import Dict
from .base import PromptLoader, PromptsProtocol


class PromptFactory:
    _loaders: Dict[str, PromptLoader] = {}
    DEFAULT_LANGUAGE = "en"

    @classmethod
    def get_prompts(cls, language: str = DEFAULT_LANGUAGE) -> PromptsProtocol:
        if language not in cls._loaders:
            cls._loaders[language] = PromptLoader(language=language)
        return cls._loaders[language].prompts


def get_prompts(language: str = PromptFactory.DEFAULT_LANGUAGE) -> PromptsProtocol:
    return PromptFactory.get_prompts(language) 