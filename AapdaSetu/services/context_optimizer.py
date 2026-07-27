"""
AapdaSetu - Context Optimizer
=============================
A Data Compression Layer designed to summarize verbose API responses into compact strings 
or minimal dictionaries before they are injected into LLM prompts. This significantly 
reduces context bloat and token consumption.
"""

from typing import List, Dict, Any

def summarize_weather(weather: dict) -> str:
    """Extracts only essential weather data."""
    if not weather or weather.get("status") == "error":
        return "Weather data unavailable."
    
    parts = []
    if "temperature_c" in weather:
        parts.append(f"Temp: {weather['temperature_c']}°C")
    if "precipitation_mm" in weather:
        parts.append(f"Rain: {weather['precipitation_mm']}mm")
    if "wind_speed_kmh" in weather:
        parts.append(f"Wind: {weather['wind_speed_kmh']}km/h")
        
    return ", ".join(parts) if parts else "No weather data."

def summarize_flood(flood: dict) -> str:
    """Extracts essential flood data."""
    if not flood or flood.get("status") == "error":
        return "Flood data unavailable."
    
    severity = flood.get("flood_severity_score", "Unknown")
    prob = flood.get("flood_probability", "Unknown")
    
    return f"Severity: {severity}/10, Probability: {prob}"

def summarize_earthquake(eq: dict) -> str:
    """Extracts essential earthquake data."""
    if not eq or eq.get("status") == "error":
        return "Earthquake data unavailable."
    
    mag = eq.get("magnitude", "Unknown")
    depth = eq.get("depth_km", "Unknown")
    
    return f"Magnitude: {mag}, Depth: {depth}km"

def summarize_resources(hospitals: List[dict], shelters: List[dict], max_items: int = 3) -> Dict[str, Any]:
    """Sorts and limits hospitals and shelters to the top N priorities."""
    
    # Sort hospitals by capacity (descending)
    sorted_h = sorted(hospitals, key=lambda x: x.get("capacity", 0) - x.get("occupied_beds", 0), reverse=True)
    top_h = sorted_h[:max_items]
    
    h_summary = []
    for h in top_h:
        avail = h.get("capacity", 0) - h.get("occupied_beds", 0)
        h_summary.append(f"- {h.get('name', 'Unknown')} (Avail: {avail})")
        
    # Sort shelters by capacity
    sorted_s = sorted(shelters, key=lambda x: x.get("capacity", 0) - x.get("occupied", 0), reverse=True)
    top_s = sorted_s[:max_items]
    
    s_summary = []
    for s in top_s:
        avail = s.get("capacity", 0) - s.get("occupied", 0)
        s_summary.append(f"- {s.get('name', 'Unknown')} (Avail: {avail})")
        
    return {
        "hospitals_summary": "\n".join(h_summary) if h_summary else "None available.",
        "shelters_summary": "\n".join(s_summary) if s_summary else "None available.",
        "hospital_count": len(hospitals),
        "shelter_count": len(shelters),
        "top_hospitals_raw": top_h,
        "top_shelters_raw": top_s
    }

def summarize_routes(routes: dict, max_items: int = 1) -> Dict[str, Any]:
    """Extracts the best routes."""
    if not routes or routes.get("status") == "error":
        return {"route_summary": "No routing available.", "blocked_count": 0}
        
    paths = routes.get("safe_routes", [])
    if not paths:
        return {"route_summary": "No safe routes found.", "blocked_count": len(routes.get("blocked_roads", []))}
        
    top_paths = paths[:max_items]
    r_summary = []
    for r in top_paths:
        r_summary.append(f"Route via {r.get('name', 'Unknown')} ({r.get('distance_km', 0)}km)")
        
    return {
        "route_summary": ", ".join(r_summary),
        "blocked_count": len(routes.get("blocked_roads", [])),
        "top_routes_raw": top_paths
    }

def compress_rag_chunks(chunks: List[dict], max_items: int = 3) -> str:
    """Removes duplicate text and caps at max_items chunks. Formats as structured evidence."""
    if not chunks:
        return "No guidelines found."
        
    unique_chunks = []
    seen = set()
    
    for c in chunks:
        t = c.get("text", "").strip()
        if t and t not in seen:
            seen.add(t)
            unique_chunks.append(c)
            
        if len(unique_chunks) >= max_items:
            break
            
    if not unique_chunks:
        return "No actionable guidelines found."
        
    formatted = []
    for c in unique_chunks:
        t = c.get("text", "").strip()
        summary = t[:250] + "..." if len(t) > 250 else t
        meta = c.get("metadata", {})
        source = meta.get("source", "NDMA Manual")
        section = meta.get("category", meta.get("disaster_type", "General"))
        score = c.get("score", "N/A")
        
        formatted.append(f"- **Source**: {source} | **Section**: {section} | **Relevance Score**: {score}\n  **Summary**: {summary}")
        
    return "\n\n".join(formatted)

def build_verified_evidence_block(
    event_type: str = "",
    event_confirmed: bool = False,
    weather_available: bool = False,
    hospitals_confirmed: bool = False,
    shelters_confirmed: bool = False,
    roads_confirmed: bool = False,
    reliefweb_available: bool = False
) -> str:
    """Generates a strict Verified Evidence block for LLM Prompts to prevent hallucination."""
    evidence = ["[VERIFIED EVIDENCE]"]
    
    event_t = event_type.lower()
    if event_t == "earthquake":
        evidence.append(f"Earthquake: {'Confirmed' if event_confirmed else 'Not Confirmed'}")
    elif event_t == "flood":
        evidence.append(f"Flood: {'Confirmed' if event_confirmed else 'Not Confirmed'}")
    else:
        evidence.append(f"Event: {'Confirmed' if event_confirmed else 'Not Confirmed'}")
        
    evidence.append(f"Weather: {'Available' if weather_available else 'Unavailable'}")
    evidence.append(f"Hospitals: {'Confirmed' if hospitals_confirmed else 'Not Confirmed'}")
    evidence.append(f"Shelters: {'Confirmed' if shelters_confirmed else 'Not Confirmed'}")
    evidence.append(f"Roads: {'Confirmed' if roads_confirmed else 'Not Confirmed'}")
    evidence.append(f"ReliefWeb: {'Available' if reliefweb_available else 'Unavailable'}")
    
    if not event_confirmed:
        evidence.append("\nNo verified information available. Do not invent facts.")
        
    return "\n".join(evidence)

