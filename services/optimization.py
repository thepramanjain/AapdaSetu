"""
AapdaSetu - Reusable Optimization Modules
=========================================
Provides classes for token estimation, prompt compression, state sanitization,
response formatting, and report formatting to ensure token efficiency and professional output.
"""
import json
from typing import Any, Dict, List
from backend.config import app_logger

# ---------------------------------------------------------
# PromptTokenEstimator
# ---------------------------------------------------------
class PromptTokenEstimator:
    """Estimates tokens for a given string. Uses tiktoken if available, else fallback heuristic."""
    def __init__(self):
        try:
            import tiktoken
            self.encoder = tiktoken.get_encoding("cl100k_base")
            self.has_tiktoken = True
        except ImportError:
            self.encoder = None
            self.has_tiktoken = False

    def estimate(self, text: str) -> int:
        if not text:
            return 0
        if self.has_tiktoken:
            return len(self.encoder.encode(text))
        return len(text) // 4  # Heuristic

    def log_estimation(self, estimated_tokens: int, compressed_tokens: int, model: str, provider: str):
        app_logger.info(
            f"[LLM Budget] Provider: {provider} | Model: {model} | "
            f"Estimated Tokens: {estimated_tokens} | Compressed Tokens: {compressed_tokens}"
        )


# ---------------------------------------------------------
# PromptCompressor
# ---------------------------------------------------------
class PromptCompressor:
    """Aggressively truncates or summarizes strings if they exceed token limits."""
    def __init__(self, estimator: PromptTokenEstimator):
        self.estimator = estimator

    def compress(self, text: str, max_tokens: int = 8000) -> str:
        est = self.estimator.estimate(text)
        if est <= max_tokens:
            return text
            
        app_logger.warning(f"[PromptCompressor] Over budget ({est} > {max_tokens}). Hard truncating.")
        # Very rough truncation: take the first N chars that fit.
        max_chars = max_tokens * 4
        return text[:max_chars]


# ---------------------------------------------------------
# StateSanitizer
# ---------------------------------------------------------
class StateSanitizer:
    """Cleans up the LangGraph state dict so it doesn't carry heavy JSON arrays unnecessarily."""
    @staticmethod
    def sanitize(state: dict) -> dict:
        """Transforms list of dictionaries into scalar counts."""
        sanitized = dict(state)
        
        if "nearby_hospitals" in sanitized and isinstance(sanitized["nearby_hospitals"], list):
            sanitized["hospital_count"] = len(sanitized["nearby_hospitals"])
            del sanitized["nearby_hospitals"]
            
        if "nearby_shelters" in sanitized and isinstance(sanitized["nearby_shelters"], list):
            sanitized["shelter_count"] = len(sanitized["nearby_shelters"])
            del sanitized["nearby_shelters"]
            
        if "missions" in sanitized and isinstance(sanitized["missions"], list):
            sanitized["mission_count"] = len(sanitized["missions"])
            
        if "safe_route" in sanitized and isinstance(sanitized["safe_route"], str):
            sanitized["safe_route_available"] = bool(sanitized["safe_route"])
            
        return sanitized


# ---------------------------------------------------------
# ResponseFormatter
# ---------------------------------------------------------
class ResponseFormatter:
    """Converts machine-readable metrics into professional human-readable strings."""
    @staticmethod
    def format_availability(count: int, entity: str) -> str:
        if count <= 0:
            return f"No verified {entity}s are currently available."
        return f"Estimated {count} {entity}s available."

    @staticmethod
    def format_confidence(conf: float) -> str:
        return f"AI Confidence: {int(conf * 100)}%"

    @staticmethod
    def format_status(status: str) -> str:
        if not status or status.lower() == "unavailable" or status.lower() == "error":
            return "No verified route/status is currently available."
        return status.title()
