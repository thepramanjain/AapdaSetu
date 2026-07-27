"""
AapdaSetu - Geocoding Tool
==========================
Translates text locations (like "Mumbai") to latitude/longitude coordinates.
Queries OpenStreetMap Nominatim API with structured fallback matching.
"""

import httpx
from typing import Dict, Any, Tuple, Optional
from tenacity import retry, stop_after_attempt, wait_exponential
from backend.config import settings, app_logger


# Predefined local fallback coordinates to ensure offline demo stability
GEODB_FALLBACK: Dict[str, Tuple[float, float]] = {
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "delhi": (28.6139, 77.2090),
    "kolkata": (22.5726, 88.3639),
    "chennai": (13.0827, 80.2707),
    "assam": (26.2006, 92.9376),
    "bihar": (25.0961, 85.3131),
    "sikkim": (27.5330, 88.5122),
    "kashmir": (34.0837, 74.7973),
    "kedarnath": (30.7346, 79.0669),
    "dharavi": (19.0380, 72.8538),
    "kurla": (19.0728, 72.8826),
    "bandra": (19.0596, 72.8295),
    "andheri": (19.1200, 72.8280),
    "ghatkopar": (19.0860, 72.9080),
    "sion": (19.0390, 72.8619)
}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
def _query_nominatim(query: str) -> Optional[Tuple[float, float]]:
    """Helper method to run retried HTTP requests to OSM Nominatim API."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "AapdaSetuDisasterSystem/1.0 (Contact: team@aapdasetu.org)"
    }
    
    app_logger.info(f"Geocoding online query: '{query}' via Nominatim...")
    with httpx.Client(timeout=10.0) as client:
        response = client.get(url, params=params, headers=headers)
        response.raise_for_status()
        results = response.json()
        
        if results:
            lat = float(results[0]["lat"])
            lon = float(results[0]["lon"])
            return lat, lon
    return None


def geocode_location(location: str) -> Dict[str, Any]:
    """
    Geocodes a location query.
    
    Returns:
        Dict: {"status": "success"/"error", "latitude": float, "longitude": float, "source": str}
    """
    if not location or not location.strip():
        return {
            "status": "error",
            "message": "Empty location query provided.",
            "latitude": 0.0,
            "longitude": 0.0,
            "source": "none"
        }
        
    cleaned = location.strip().lower()
    
    # 1. Check local seed database first to prevent API thrashing and ensure fast response
    for key, coords in GEODB_FALLBACK.items():
        if key in cleaned:
            app_logger.info(f"Local geocode match found for '{location}' -> {coords} (Source: DB)")
            return {
                "status": "success",
                "latitude": coords[0],
                "longitude": coords[1],
                "source": "local_database"
            }
            
    # 2. Query OSM Nominatim online API
    try:
        coords = _query_nominatim(location)
        if coords:
            app_logger.info(f"Online geocode success for '{location}' -> {coords}")
            return {
                "status": "success",
                "latitude": coords[0],
                "longitude": coords[1],
                "source": "nominatim_api"
            }
    except Exception as e:
        app_logger.warning(f"OSM Nominatim API request failed for '{location}': {e}. Triggering fallback coordinates.")

    # 3. Fallback: default to Mumbai epicenter if geocoding completely fails
    default_coords = GEODB_FALLBACK["mumbai"]
    app_logger.warning(f"Geocoding failed for '{location}'. Falling back to default center {default_coords}")
    return {
        "status": "success",
        "latitude": default_coords[0],
        "longitude": default_coords[1],
        "source": "default_fallback"
    }
