"""
AapdaSetu - ReliefWeb API Query Tool
====================================
Queries the official ReliefWeb reports API for disaster logs and updates.
Saves successful responses to cache and falls back to cached files if the API is down.
"""

import json
import os
import httpx
from typing import List, Dict, Any, Optional
from backend.config import settings, app_logger
from tenacity import retry, stop_after_attempt, wait_exponential

RELIEFWEB_API_URL = "https://api.reliefweb.int/v2/reports"
HEADERS = {"User-Agent": "AapdaSetuSystem/1.0 (contact: team@aapdasetu.org)"}


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6),
    reraise=True
)
def _call_reliefweb_api(query: str, limit: int) -> dict:
    """Helper method to issue HTTP request with retries."""
    params = {
        "appname": "aapdasetu",
        "query[value]": query,
        "limit": limit,
        "profile": "full"
    }
    app_logger.info(f"ReliefWeb Tool: Issuing GET to {RELIEFWEB_API_URL} for '{query}'...")
    response = httpx.get(RELIEFWEB_API_URL, params=params, headers=HEADERS, timeout=8.0)
    response.raise_for_status()
    return response.json()


def search_relief_reports(query: str, limit: int = 5) -> Dict[str, Any]:
    """
    Search ReliefWeb for reports matching the query (e.g., 'flood', 'earthquake').
    
    Args:
        query: Disaster search keyword.
        limit: Max number of reports to retrieve.
        
    Returns:
        Dict: Standardized JSON envelope containing reports or loaded from cache.
    """
    cache_path = os.path.join(settings.DATA_DIR, "raw", "reliefweb_reports.json")
    
    try:
        data = _call_reliefweb_api(query, limit)
        
        # Structure the reports
        reports = []
        for item in data.get("data", []):
            fields = item.get("fields", {})
            reports.append({
                "id": item.get("id"),
                "title": fields.get("title", "No Title Available"),
                "url": fields.get("url", ""),
                "body": fields.get("body", "")[:500] + "...",  # truncate body for agent token limits
                "primary_country": fields.get("primary_country", {}).get("name", "Unknown"),
                "created_at": fields.get("date", {}).get("created", "")
            })
            
        result = {
            "status": "success",
            "source": "live_api",
            "reports": reports
        }
        
        # Save to cache
        try:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
        except Exception as e:
            app_logger.warning(f"ReliefWeb Tool: Failed to update cache: {e}")
            
        return result

    except Exception as e:
        app_logger.warning(f"ReliefWeb Tool: Live query failed: {e}. Falling back to cached file.")
        
        # Load from cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                cached_data["source"] = "local_cache"
                return cached_data
            except Exception as read_err:
                app_logger.error(f"ReliefWeb Tool: Failed to read cache file: {read_err}")
                
        return {
            "status": "error",
            "source": "empty_fallback",
            "message": "ReliefWeb API is unreachable and no cache exists.",
            "reports": []
        }
