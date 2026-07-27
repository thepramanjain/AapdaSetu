"""Central LLM manager providing a unified `invoke()` interface.

Behavior:
- Primary: Groq client
- Fallback: Google Gemini via LangChain wrapper if Groq fails
- Retry Gemini once on transient errors
- On total failure, raises `LLMServiceError` for callers to handle.
"""
from typing import Any, List, Union
import time
import json

from backend.config import settings, app_logger
from services.optimization import PromptTokenEstimator, PromptCompressor


class LLMServiceError(Exception):
    pass


def _messages_to_text(messages: Union[str, List[Any]]) -> str:
    if isinstance(messages, str):
        return messages
    # messages might be sequence of objects with .content or plain dicts
    parts = []
    for m in messages:
        if hasattr(m, "content"):
            parts.append(str(m.content))
        elif isinstance(m, dict) and "content" in m:
            parts.append(str(m["content"]))
        else:
            parts.append(str(m))
    return "\n".join(parts)


def parse_strict_json(text: str) -> dict:
    """
    Parses a string exactly as JSON, strictly forbidding markdown parsing 
    (e.g. no .replace('```json', '')). 
    It is tolerant of leading/trailing accidental whitespace.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        raise ValueError("Strict JSON Parser Error: Markdown code fences detected instead of raw JSON.")
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Strict JSON Parser Error: Invalid JSON syntax. {e}") from e


class LLMManager:
    def __init__(self):
        self.primary_name = "groq"
        self.fallback_name = "gemini"
        self.estimator = PromptTokenEstimator()
        self.compressor = PromptCompressor(self.estimator)

    def invoke(self, messages: Union[str, List[Any]], temperature: float = 0.3, require_json: bool = False, **kwargs) -> str:
        """Invoke LLM with failover. Returns reply text or raises LLMServiceError."""
        prompt_text = _messages_to_text(messages)
        
        # Budget Enforcement
        max_tokens = kwargs.get("max_tokens", 8000)
        
        estimated_tokens = self.estimator.estimate(prompt_text)
        if estimated_tokens > max_tokens:
            prompt_text = self.compressor.compress(prompt_text, max_tokens=max_tokens)
            compressed_tokens = self.estimator.estimate(prompt_text)
        else:
            compressed_tokens = estimated_tokens

        # Try Groq first
        groq_model = getattr(settings, 'GROQ_MODEL', 'default')
        app_logger.info(f"[LLM Routing] Provider: GROQ | Model: {groq_model}")
        self.estimator.log_estimation(estimated_tokens, compressed_tokens, groq_model, "GROQ")
        
        try:
            return self._invoke_groq(prompt_text, temperature=temperature, require_json=require_json, **kwargs)
        except Exception as e:
            app_logger.warning(f"[LLM Fallback] Groq invocation failed: {e}. Switching to GEMINI.")

        # Try Gemini fallback (with one retry)
        gemini_model = getattr(settings, 'GEMINI_MODEL', 'default')
        app_logger.info(f"[LLM Routing] Provider: GEMINI | Model: {gemini_model}")
        self.estimator.log_estimation(estimated_tokens, compressed_tokens, gemini_model, "GEMINI")
        
        try:
            return self._invoke_gemini(prompt_text, temperature=temperature, require_json=require_json, **kwargs)
        except Exception as e:
            app_logger.warning(f"[LLM Fallback] Gemini failed: {e}. Retrying once...")
            try:
                time.sleep(0.5)
                return self._invoke_gemini(prompt_text, temperature=temperature, require_json=require_json, **kwargs)
            except Exception as e2:
                app_logger.error("[LLM Fatal] Both Groq and Gemini failed.", exc_info=True)
                raise LLMServiceError("LLM failure: Both providers failed") from e2

    def _invoke_gemini(self, prompt: str, **kwargs) -> str:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI

            llm_kwargs = {
                "model": settings.GEMINI_MODEL,
                "google_api_key": settings.GEMINI_API_KEY,
                "temperature": kwargs.get("temperature", 0.1)
            }
            if kwargs.get("require_json", False):
                # Using generation_config for strict JSON might depend on exact SDK version, 
                # but LangChain's wrapper doesn't always support it nicely. We'll pass it if possible, 
                # or rely on prompt engineering which we've enforced.
                # However, for Google Gen AI via LangChain we can sometimes pass model_kwargs
                pass

            llm = ChatGoogleGenerativeAI(**llm_kwargs)

            # The ChatGoogleGenerativeAI wrapper supports `invoke(messages)` where
            # messages can be a single string prompt. We call it and normalize.
            response = llm.invoke(prompt)
            # Some SDKs return object with `content` attribute
            if hasattr(response, "content"):
                content = response.content
                if isinstance(content, list):
                    parts = []
                    for part in content:
                        if isinstance(part, dict) and "text" in part:
                            parts.append(part["text"])
                        elif isinstance(part, str):
                            parts.append(part)
                    return "".join(parts).strip()
                return str(content).strip()
            return str(response).strip()
        except Exception as e:
            app_logger.warning(f"Gemini call failed: {e}")
            raise

    def _invoke_groq(self, prompt: str, **kwargs) -> str:
        try:
            # Import Groq client dynamically; add groq SDK to requirements.txt
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            model = getattr(settings, "GROQ_MODEL", None) or kwargs.get("model")
            if not model:
                raise RuntimeError("No GROQ_MODEL configured for Groq fallback")

            req_kwargs = {
                "messages": [{"role": "user", "content": prompt}],
                "model": model,
                "temperature": kwargs.get("temperature", 0.3),
                "max_tokens": kwargs.get("max_tokens", 1024)
            }
            if kwargs.get("require_json", False):
                req_kwargs["response_format"] = {"type": "json_object"}

            # Standard chat completion invocation using modern Groq SDK
            chat_completion = client.chat.completions.create(**req_kwargs)
            
            if not chat_completion.choices or not chat_completion.choices[0].message.content:
                raise RuntimeError("Groq client returned an empty response")
                
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            app_logger.error(f"Groq call failed: {e}")
            raise


# Singleton instance used across the app
llm_manager = LLMManager()
