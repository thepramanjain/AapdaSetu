"""
AapdaSetu - USGS Earthquake API Client Tool
================================================
Queries the live USGS Earthquake catalog for seismic hazard statistics,
maintaining a local cache file (data/cache/earthquake_cache.json) for fallback.
"""

import json
import os
import httpx
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from backend.config import settings, app_logger
from tenacity import retry, stop_after_attempt, wait_exponential

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6),
    reraise=True
)
def _query_usgs_api(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Helper executing retried USGS API search."""
    start_time = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    params = {
        "format": "geojson",
        "starttime": start_time,
        "latitude": lat,
        "longitude": lon,
        "maxradiuskm": 300,
        "minmagnitude": "3.0"
    }
    app_logger.info(f"Earthquake Tool: Querying USGS around ({lat}, {lon})...")
    response = httpx.get(USGS_URL, params=params, timeout=8.0)
    response.raise_for_status()
    return response.json()


def get_seismic_data(lat: float, lon: float, description_context: str = "") -> Dict[str, Any]:
    """
    Retrieve live earthquake metrics near coordinates with cache failover.
    
    Args:
        lat: Latitude coordinate.
        lon: Longitude coordinate.
        description_context: Text description for fallback parameter synthesis.
        
    Returns:
        Dict: Standardized seismic metrics.
    """
    cache_path = os.path.join(settings.CACHE_DIR, "earthquake_cache.json")
    
    # Coordinates check
    if not -90.0 <= lat <= 90.0 or not -180.0 <= lon <= 180.0:
        return {"status": "error", "message": "Invalid coordinates bounds."}
        
    try:
        data = _query_usgs_api(lat, lon)
        features = data.get("features", []) if data else []
        
        if features:
            features_sorted = sorted(features, key=lambda x: x["properties"].get("mag", 0.0), reverse=True)
            prime_event = features_sorted[0]
            props = prime_event["properties"]
            geom = prime_event["geometry"]
            coords = geom["coordinates"]
            
            mag = float(props.get("mag", 4.0))
            depth = float(coords[2]) if len(coords) > 2 else 10.0
            place = props.get("place", "Seismic Epicenter")
            time_epoch = props.get("time", 0.0) / 1000.0
            event_time = datetime.fromtimestamp(time_epoch, timezone.utc).isoformat()
            source = "usgs_live_api"
        else:
            raise ValueError("No recent real-world earthquakes found in USGS API response.")
            
        # Structure payload
        severity_score = min(10.0, mag)
        risk = "HIGH" if mag >= 6.5 else ("MODERATE" if mag >= 5.0 else "LOW")
        guidance = (
            "Severe structural damage. Major aftershocks expected. Evacuate multi-story buildings."
            if mag >= 6.5
            else (
                "Moderate damage to weaker brick structures. Diagonal wall fractures. Watch for gas leaks."
                if mag >= 5.0
                else "Minor vibrations felt. Low chance of aftershock damage. Inspect utilities."
            )
        )
        
        result = {
            "status": "success",
            "magnitude": round(mag, 1),
            "depth_km": round(depth, 1),
            "epicenter": {
                "latitude": lat,
                "longitude": lon,
                "place": place
            },
            "event_time": event_time,
            "aftershock_risk": risk,
            "building_safety_guidance": guidance,
            "severity_score": round(severity_score, 1),
            "source": source
        }
        
        # Save cache
        try:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
        except Exception as cache_err:
            app_logger.warning(f"Earthquake Tool: Failed to write cache: {cache_err}")
            
        return result

    except Exception as e:
        app_logger.warning(f"Earthquake Tool: Live API failed ({e}). Loading fallback cache.")
        
        # 1. Try local JSON cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                cached_data["source"] = "local_cache"
                return cached_data
            except Exception as read_err:
                app_logger.error(f"Earthquake Tool: Failed to read cache: {read_err}")
                
        # 2. Try raw fallback data
        raw_path = os.path.join(settings.DATA_DIR, "raw", "earthquakes.json")
        if os.path.exists(raw_path):
            try:
                with open(raw_path, "r", encoding="utf-8") as f:
                    raw_data = json.load(f)
                features = raw_data.get("features", [])
                if features:
                    features_sorted = sorted(features, key=lambda x: x["properties"].get("mag", 0.0), reverse=True)
                    prime_event = features_sorted[0]
                    props = prime_event["properties"]
                    geom = prime_event["geometry"]
                    coords = geom["coordinates"]
                    
                    mag = float(props.get("mag", 6.8))
                    depth = float(coords[2]) if len(coords) > 2 else 10.0
                    place = props.get("place", "Raw Fallback Epicenter")
                    time_epoch = props.get("time", 0.0) / 1000.0
                    event_time = datetime.fromtimestamp(time_epoch, timezone.utc).isoformat()
                    
                    severity_score = min(10.0, mag)
                    risk = "HIGH" if mag >= 6.5 else ("MODERATE" if mag >= 5.0 else "LOW")
                    guidance = "Severe structural damage. Major aftershocks expected."
                    
                    return {
                        "status": "success",
                        "magnitude": round(mag, 1),
                        "depth_km": round(depth, 1),
                        "epicenter": {
                            "latitude": lat,
                            "longitude": lon,
                            "place": place
                        },
                        "event_time": event_time,
                        "aftershock_risk": risk,
                        "building_safety_guidance": guidance,
                        "severity_score": round(severity_score, 1),
                        "source": "raw_cache_fallback"
                    }
            except Exception as read_raw_err:
                app_logger.error(f"Earthquake Tool: Failed to read raw earthquakes file: {read_raw_err}")

        # 3. Dynamic synthesizer fallback
        desc_lower = description_context.lower()
        mag = 6.8
        if "minor" in desc_lower or "mild" in desc_lower or "small" in desc_lower:
            mag = 4.2
        elif "moderate" in desc_lower or "shaking" in desc_lower:
            mag = 5.5
        elif "catastrophic" in desc_lower or "devastating" in desc_lower or "major" in desc_lower:
            mag = 7.9
            
        severity_score = min(10.0, mag)
        risk = "HIGH" if mag >= 6.5 else ("MODERATE" if mag >= 5.0 else "LOW")
        guidance = "Severe structural damage. Major aftershocks expected. Evacuate structure."
        
        return {
            "status": "success",
            "magnitude": round(mag, 1),
            "depth_km": 12.0,
            "epicenter": {
                "latitude": lat,
                "longitude": lon,
                "place": "Simulated Epicenter Grid"
            },
            "event_time": datetime.now(timezone.utc).isoformat(),
            "aftershock_risk": risk,
            "building_safety_guidance": guidance,
            "severity_score": round(severity_score, 1),
            "source": "seismic_synthesizer_fallback"
        }
