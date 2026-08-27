"""
AapdaSetu - Live Hospital Query Tool
=========================================
Queries the live OpenStreetMap Overpass API for operational hospitals near disaster
coordinates, with local JSON caching and distance sorting via Haversine distance.
"""

import json
import math
import os
from typing import List, Dict, Any
from backend.config import settings, app_logger
from tools.overpass_client import call_overpass_api


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _call_overpass_for_hospitals(lat: float, lon: float, radius_meters: float) -> dict:
    """Query OSM for hospital nodes and ways using robust client."""
    query = f"""[out:json][timeout:10];
    (
      node["amenity"="hospital"](around:{radius_meters},{lat},{lon});
      way["amenity"="hospital"](around:{radius_meters},{lat},{lon});
    );
    out center;"""
    app_logger.info(f"Hospital Tool: Overpass live query around ({lat}, {lon}) with radius {radius_meters}m...")
    response = call_overpass_api(query)
    if response is None:
        raise Exception("Overpass API unavailable.")
    return response


def find_nearby_hospitals(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """
    Search the live Overpass API or fallback cache for operational hospital facilities.
    
    Args:
        lat: Latitude of query anchor.
        lon: Longitude of query anchor.
        radius_km: Distance threshold in kilometers.
        
    Returns:
        List[Dict]: Nearby hospitals sorted by distance.
    """
    cache_path = os.path.join(settings.CACHE_DIR, "hospitals_cache.json")
    
    # Input Validation
    if not -90.0 <= lat <= 90.0 or not -180.0 <= lon <= 180.0:
        app_logger.warning(f"Hospital Tool: Invalid coords ({lat}, {lon}). Returning empty.")
        return []

    try:
        radius_meters = radius_km * 1000
        data = _call_overpass_for_hospitals(lat, lon, radius_meters)
        
        elements = data.get("elements", [])
        hospitals = []
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name", f"General Hospital (OSM {element.get('id')})")
            
            # Determine coordinates
            e_lat = element.get("lat") or (element.get("center", {}).get("lat") if "center" in element else None)
            e_lon = element.get("lon") or (element.get("center", {}).get("lon") if "center" in element else None)
            
            if e_lat is None or e_lon is None:
                continue
                
            dist = haversine_distance(lat, lon, e_lat, e_lon)
            cap_str = tags.get("capacity", "150")
            try:
                capacity = int(cap_str)
            except ValueError:
                capacity = 150
                
            occupied = int(capacity * 0.65)  # estimate occupation
            
            hospitals.append({
                "id": f"OSM_HOSP_{element.get('id')}",
                "name": name,
                "latitude": e_lat,
                "longitude": e_lon,
                "capacity": capacity,
                "occupied_beds": occupied,
                "specialties": ["ICU", "Trauma", "General"],
                "active": True,
                "distance_km": round(dist, 2)
            })
            
        # Sort by distance
        hospitals = sorted(hospitals, key=lambda x: x["distance_km"])
        
        # Save to local cache
        try:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump({"hospitals": hospitals}, f, indent=2)
        except Exception as cache_err:
            app_logger.warning(f"Hospital Tool: Failed to update cache: {cache_err}")
            
        return hospitals

    except Exception as e:
        app_logger.warning(f"Hospital Tool: Live API failed ({e}). Loading fallback cache.")
        
        # Fallback to local JSON cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                
                cached_hospitals = cache_data.get("hospitals", [])
                
                # Recalculate distance from the new coordinates
                re_filtered = []
                for h in cached_hospitals:
                    dist = haversine_distance(lat, lon, h["latitude"], h["longitude"])
                    if dist <= radius_km:
                        h_copy = h.copy()
                        h_copy["distance_km"] = round(dist, 2)
                        re_filtered.append(h_copy)
                        
                return sorted(re_filtered, key=lambda x: x["distance_km"])
            except Exception as read_err:
                app_logger.error(f"Hospital Tool: Failed to read cache: {read_err}")
                
        # If cache is missing, return API unavailable indicator
        return [{"error": "API_UNAVAILABLE", "message": "Hospital API unavailable and cache is empty."}]
