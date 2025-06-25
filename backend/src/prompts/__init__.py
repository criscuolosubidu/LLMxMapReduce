"""
This package provides a factory for creating language-specific prompts.
"""
from .base import PromptsProtocol
from .factory import PromptFactory, get_prompts

__all__ = ["PromptFactory", "get_prompts", "PromptsProtocol"]
