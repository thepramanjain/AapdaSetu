"""
AapdaSetu - Robust Overpass API Client
======================================
Provides a centralized, reliable client for querying OpenStreetMap's Overpass API.
Implements proper headers, multiple mirror failover, timeouts, and retries.
"""

import httpx
from typing import Optional, Dict, Any
from backend.config import app_logger
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
]

HEADERS = {
    "User-Agent": "AapdaSetuDisasterBot/1.0 (contact@aapdasetu.org)",
    "Content-Type": "application/x-www-form-urlencoded"
}


class OverpassUnavailableError(Exception):
    pass


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6),
    retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
    reraise=True
)
def _call_mirror(url: str, query: str) -> dict:
    """Attempt to call a single Overpass mirror with retry logic."""
    app_logger.debug(f"Overpass Client: Trying mirror {url}")
    response = httpx.post(url, data={"data": query}, headers=HEADERS, timeout=12.0)
    response.raise_for_status()
    return response.json()


def call_overpass_api(query: str) -> Optional[Dict[str, Any]]:
    """
    Execute an Overpass query with automatic mirror fallback and graceful degradation.
    
    Args:
        query: Overpass QL string.
        
    Returns:
        Dict: Parsed JSON response from Overpass API.
        None: If all mirrors fail.
    """
    for mirror in OVERPASS_MIRRORS:
        try:
            return _call_mirror(mirror, query)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            app_logger.warning(f"Overpass Client: Mirror {mirror} failed: {e}")
        except Exception as e:
            app_logger.error(f"Overpass Client: Unexpected error with mirror {mirror}: {e}")
            
    app_logger.error("Overpass Client: All Overpass mirrors failed. API is unavailable.")
    return None
