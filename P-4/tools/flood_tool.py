"""
AapdaSetu - Live Flood GloFAS API Client Tool
==================================================
Queries the live Open-Meteo GloFAS River Discharge forecast API, assessment metrics,
saving/loading results to/from the local cache file (data/cache/weather_cache.json).
"""

import json
import os
import httpx
from typing import Dict, Any
from backend.config import settings, app_logger
from tenacity import retry, stop_after_attempt, wait_exponential

FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6),
    reraise=True
)
def _fetch_flood_api(lat: float, lon: float) -> dict:
    """Helper executing retried GloFAS API query."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "river_discharge",
        "forecast_days": 5
    }
    app_logger.info(f"Flood Tool: Querying GloFAS API for ({lat}, {lon})...")
    response = httpx.get(FLOOD_URL, params=params, timeout=10.0)
    response.raise_for_status()
    return response.json()


def get_flood_forecast(lat: float, lon: float, rainfall_mm: float = 0.0) -> Dict[str, Any]:
    """
    Query river discharge forecast with weather cache fallback.
    
    Args:
        lat: Latitude coordinate.
        lon: Longitude coordinate.
        rainfall_mm: Rainfall parameter to augment predictions.
        
    Returns:
        Dict: Standardized flood forecast payload.
    """
    cache_path = os.path.join(settings.CACHE_DIR, "weather_cache.json")
    
    if not -90.0 <= lat <= 90.0 or not -180.0 <= lon <= 180.0:
        return {"status": "error", "message": "Invalid coordinates boundaries."}

    try:
        data = _fetch_flood_api(lat, lon)
        daily = data.get("daily", {})
        discharge = daily.get("river_discharge", [])
        
        discharge_clean = [d for d in discharge if d is not None]
        if not discharge_clean:
            raise ValueError("No major river basin grid found at coordinates in live API response.")
            
        max_discharge = max(discharge_clean)
        avg_discharge = sum(discharge_clean) / len(discharge_clean)
        
        flood_prob = min(0.95, (max_discharge / 600.0)) if max_discharge > 100.0 else 0.1
        if rainfall_mm > 50.0:
            flood_prob = max(flood_prob, 0.85)
            
        severity = 8.5 if flood_prob > 0.8 else (5.5 if flood_prob > 0.5 else (3.0 if flood_prob > 0.2 else 0.0))
        
        result = {
            "status": "success",
            "river_discharge_m3s": discharge_clean,
            "max_discharge_m3s": round(max_discharge, 2),
            "average_discharge_m3s": round(avg_discharge, 2),
            "flood_probability": round(flood_prob, 2),
            "flood_severity_score": round(severity, 1),
            "source": "glofas_flood_api"
        }
        
        # Save cache inside weather_cache.json under flood subkey
        try:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            cache_payload = {}
            if os.path.exists(cache_path):
                try:
                    with open(cache_path, "r", encoding="utf-8") as rf:
                        cache_payload = json.load(rf)
                except Exception:
                    pass
            cache_payload["flood"] = result
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(cache_payload, f, indent=2)
        except Exception as cache_err:
            app_logger.warning(f"Flood Tool: Failed to write cache: {cache_err}")
            
        return result

    except Exception as e:
        app_logger.warning(f"Flood Tool: Live GloFAS failed ({e}). Loading fallback cache.")
        
        # Load from cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                if "flood" in cached_data:
                    res = cached_data["flood"]
                    res["source"] = "local_cache"
                    return res
            except Exception as read_err:
                app_logger.error(f"Flood Tool: Failed to read cache: {read_err}")

        # Runoff fallback calculation
        if rainfall_mm >= 100.0:
            prob = 0.90
            severity = 9.0
            discharge_sim = [720.0, 810.0, 780.0, 650.0, 480.0]
        elif rainfall_mm >= 50.0:
            prob = 0.75
            severity = 6.8
            discharge_sim = [420.0, 480.0, 430.0, 390.0, 310.0]
        elif rainfall_mm >= 20.0:
            prob = 0.35
            severity = 3.5
            discharge_sim = [150.0, 180.0, 160.0, 140.0, 110.0]
        else:
            prob = 0.05
            severity = 0.0
            discharge_sim = [12.4, 11.8, 11.2, 10.9, 10.5]
            
        return {
            "status": "success",
            "river_discharge_m3s": discharge_sim,
            "max_discharge_m3s": max(discharge_sim),
            "average_discharge_m3s": round(sum(discharge_sim)/len(discharge_sim), 2),
            "flood_probability": prob,
            "flood_severity_score": severity,
            "source": "rainfall_runoff_fallback"
        }
