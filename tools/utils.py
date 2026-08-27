"""
AapdaSetu - Utility and API Reliability wrappers
================================================
Provides standard `@retry` wrapping for external APIs with timeout and fallback logic.
"""

from typing import Callable, Any, Dict
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError
from backend.config import app_logger

def reliable_api_call(fallback_value: Any) -> Callable:
    """
    Decorator to wrap API calls with retry logic, exponential backoff, 
    and a graceful fallback value on ultimate failure.
    """
    def decorator(func: Callable) -> Callable:
        # Wrap the original function with Tenacity retry
        retrying_func = retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            reraise=True
        )(func)

        def wrapper(*args, **kwargs):
            try:
                return retrying_func(*args, **kwargs)
            except Exception as e:
                app_logger.error(f"API Call failed after retries in {func.__name__}: {e}. Using fallback.")
                return fallback_value
        return wrapper
    return decorator
