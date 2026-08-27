"""
AapdaSetu - Live Emergency Shelter Query Tool
==================================================
Queries OpenStreetMap (Overpass API) for municipal buildings, designated shelters,
schools, police, and fire stations, implementing local JSON caching on API failure.
"""

import json
import os
from typing import List, Dict, Any
from backend.config import settings, app_logger
from tools.hospital_tool import haversine_distance
from tools.overpass_client import call_overpass_api


def _call_overpass_for_shelters(lat: float, lon: float, radius_meters: float) -> dict:
    """Query OSM for shelters, schools, police, and fire stations using robust client."""
    query = f"""[out:json][timeout:12];
    (
      node["amenity"="school"](around:{radius_meters},{lat},{lon});
      way["amenity"="school"](around:{radius_meters},{lat},{lon});
      node["amenity"="police"](around:{radius_meters},{lat},{lon});
      way["amenity"="police"](around:{radius_meters},{lat},{lon});
      node["amenity"="fire_station"](around:{radius_meters},{lat},{lon});
      way["amenity"="fire_station"](around:{radius_meters},{lat},{lon});
      node["amenity"="community_centre"](around:{radius_meters},{lat},{lon});
      way["amenity"="community_centre"](around:{radius_meters},{lat},{lon});
      node["social_facility"="shelter"](around:{radius_meters},{lat},{lon});
      way["social_facility"="shelter"](around:{radius_meters},{lat},{lon});
    );
    out center;"""
    app_logger.info(f"Shelter Tool: Overpass live query around ({lat}, {lon}) with radius {radius_meters}m...")
    response = call_overpass_api(query)
    if response is None:
        raise Exception("Overpass API unavailable.")
    return response


def find_nearby_shelters(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """
    Search the live Overpass API or fallback cache for operational emergency shelters.
    
    Args:
        lat: Latitude query anchor.
        lon: Longitude query anchor.
        radius_km: Search threshold in kilometers.
        
    Returns:
        List[Dict]: Nearby shelters sorted by distance.
    """
    cache_path = os.path.join(settings.CACHE_DIR, "shelters_cache.json")
    
    # Input Validation
    if not -90.0 <= lat <= 90.0 or not -180.0 <= lon <= 180.0:
        app_logger.warning(f"Shelter Tool: Invalid coordinates ({lat}, {lon}). Returning empty.")
        return []

    try:
        radius_meters = radius_km * 1000
        data = _call_overpass_for_shelters(lat, lon, radius_meters)
        
        elements = data.get("elements", [])
        shelters = []
        for element in elements:
            tags = element.get("tags", {})
            amenity = tags.get("amenity", "")
            facility = tags.get("social_facility", "")
            
            # Determine suitable human-readable name
            name = tags.get("name")
            if not name:
                if amenity:
                    name = f"Unnamed {amenity.replace('_', ' ').title()}"
                elif facility:
                    name = f"Unnamed {facility.replace('_', ' ').title()}"
                else:
                    name = "Unnamed Shelter Facility"
                    
            # Determine coordinates
            e_lat = element.get("lat") or (element.get("center", {}).get("lat") if "center" in element else None)
            e_lon = element.get("lon") or (element.get("center", {}).get("lon") if "center" in element else None)
            
            if e_lat is None or e_lon is None:
                continue
                
            dist = haversine_distance(lat, lon, e_lat, e_lon)
            
            # Estimate shelter capacity
            cap_str = tags.get("capacity")
            if cap_str:
                try:
                    capacity = int(cap_str)
                except ValueError:
                    capacity = 300
            else:
                if "school" in amenity:
                    capacity = 500
                elif "police" in amenity or "fire" in amenity:
                    capacity = 100
                else:
                    capacity = 300
                    
            shelters.append({
                "id": f"OSM_SHEL_{element.get('id')}",
                "name": name,
                "latitude": e_lat,
                "longitude": e_lon,
                "capacity": capacity,
                "occupied": int(capacity * 0.40),  # estimate occupants
                "has_supplies": True,
                "active": True,
                "distance_km": round(dist, 2),
                "type": amenity or facility or "shelter"
            })
            
        # Sort by proximity
        shelters = sorted(shelters, key=lambda x: x["distance_km"])
        
        # Save cache
        try:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump({"shelters": shelters}, f, indent=2)
        except Exception as cache_err:
            app_logger.warning(f"Shelter Tool: Failed to write cache: {cache_err}")
            
        return shelters

    except Exception as e:
        app_logger.warning(f"Shelter Tool: Live query failed ({e}). Loading fallback cache.")
        
        # Load cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                
                cached_shelters = cache_data.get("shelters", [])
                
                # Recalculate distance
                re_filtered = []
                for s in cached_shelters:
                    dist = haversine_distance(lat, lon, s["latitude"], s["longitude"])
                    if dist <= radius_km:
                        s_copy = s.copy()
                        s_copy["distance_km"] = round(dist, 2)
                        re_filtered.append(s_copy)
                        
                return sorted(re_filtered, key=lambda x: x["distance_km"])
            except Exception as read_err:
                app_logger.error(f"Shelter Tool: Failed to read cache: {read_err}")
                
        # If cache is missing, return API unavailable indicator
        return [{"error": "API_UNAVAILABLE", "message": "Shelter API unavailable and cache is empty."}]
