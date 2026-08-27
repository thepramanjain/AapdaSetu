"""Flood Analysis Agent
Fetches hydrological data and uses the LLM manager for reasoning.
"""

from backend.config import settings, app_logger
from tools.weather_tool import get_weather
from tools.flood_tool import get_flood_forecast
from agents.prompt_loader import load_prompt, parse_llm_response
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.context_optimizer import summarize_weather, summarize_flood
from services.verification_service import determine_verification_status


def analyze_flood(location: str, lat: float, lon: float, description: str) -> dict:
    """
    Runs the Flood Agent analysis pipeline.
    
    Returns:
        dict: Flood metrics, severity rating, and narrative summary.
    """
    app_logger.info(f"Flood Agent: Starting analysis for location='{location}'...")
    
    # 1. Fetch live metrics
    weather_res = get_weather(lat, lon)
    rainfall = weather_res.get("precipitation_mm", 0.0) if weather_res.get("status") == "success" else 0.0
    
    flood_res = get_flood_forecast(lat, lon, rainfall_mm=rainfall)
    
    # 1b. Deterministic Verification Logic
    source = flood_res.get("source", "unknown")
    verification_data = determine_verification_status(source, float(flood_res.get("flood_severity_score", 5.0)))
    
    verification_status = verification_data["verification_status"]
    confidence = verification_data["confidence"]
    evidence = verification_data["evidence"]
    event_confirmed = verification_status in ["LIVE", "HISTORICAL", "PREPAREDNESS"]
    
    # 2. Build and execute prompt using modular prompt files
    flood_p = load_prompt("flood_agent_prompt.md")
    
    user_context = (
        "## Current Task\n"
        f"{flood_p}\n\n"
        "## Compact State\n"
        f"Location: {location}, Weather: {summarize_weather(weather_res)}\n"
        f"Flood Metrics: {summarize_flood(flood_res)}\n\n"
        "## Verified Evidence\n"
        f"Status: {verification_status}\n"
        f"Confidence: {confidence}\n"
        f"Evidence: {evidence}\n\n"
        "## Relevant RAG Context\n"
        "None (Handled by RAG Agent)\n\n"
        "Return ONLY valid JSON.\n"
        "Do NOT explain.\n"
        "Do NOT use markdown.\n"
        "Do NOT use code fences.\n"
        "Do NOT think aloud.\n"
        "The first character must be {\n"
        "The last character must be }\n"
    )
    
    filled = user_context

    try:
        content = llm_manager.invoke(filled, temperature=0.0, require_json=True)
        app_logger.debug(f"Flood Agent LLM Raw Output:\n{content}")
        
        # Parse strictly
        parsed = parse_strict_json(content)
            
        # Map fields back to what the coordinator/application expects
        parsed["analysis_summary"] = parsed.get("summary", parsed.get("analysis_summary", "Flood assessment completed."))
        
        # Convert severity to severity_score
        severity_val = parsed.get("severity")
        if severity_val is not None:
            try:
                parsed["severity_score"] = float(severity_val)
            except ValueError:
                parsed["severity_score"] = float(flood_res.get("flood_severity_score", 5.0))
        else:
            parsed["severity_score"] = float(parsed.get("severity_score", flood_res.get("flood_severity_score", 5.0)))
            
        parsed["flood_probability"] = float(parsed.get("flood_probability", flood_res.get("flood_probability", 0.5)))
        parsed["evacuation_recommended"] = bool(parsed.get("evacuation_recommended", parsed["severity_score"] >= 7.0))
        
        # Attach strictly deterministic verification metrics
        parsed["event_confirmed"] = event_confirmed
        parsed["verification_status"] = verification_status
        parsed["confidence"] = confidence
        parsed["api_source"] = source
        
        app_logger.info(f"Flood Agent: Analysis completed. Severity={parsed['severity_score']}, Evac={parsed['evacuation_recommended']}, Verified: {verification_status}")
        return parsed
        
    except LLMServiceError as e:
        app_logger.error(f"Flood Agent: LLM failed: {e}", exc_info=True)
    except Exception as e:
        app_logger.error(f"Flood Agent: Analysis failed: {e}", exc_info=True)
        # Safe fallback structure
        return {
            "river_discharge_status": "data unavailable",
            "flood_probability": flood_res.get("flood_probability", 0.70),
            "severity_score": flood_res.get("flood_severity_score", 6.0),
            "evacuation_recommended": flood_res.get("flood_severity_score", 6.0) >= 7.0,
            "analysis_summary": f"Hydrological API fetch or LLM reasoning failed. Local fallback estimates indicate active flood risk. Detail: {e}",
            "event_confirmed": event_confirmed,
            "verification_status": verification_status,
            "confidence": confidence,
            "api_source": source
        }
