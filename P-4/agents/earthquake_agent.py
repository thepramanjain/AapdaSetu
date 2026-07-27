"""Earthquake Analysis Agent
Queries USGS data and uses the LLM manager for summarization and safety advice.
"""

from backend.config import settings, app_logger
from tools.earthquake_tool import get_seismic_data
from agents.prompt_loader import load_prompt, parse_llm_response
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.context_optimizer import summarize_earthquake
from services.verification_service import determine_verification_status


def analyze_earthquake(location: str, lat: float, lon: float, description: str) -> dict:
    """
    Runs the Earthquake Agent analysis pipeline.
    
    Returns:
        dict: Seismic details, severity rating, and safety warnings.
    """
    app_logger.info(f"Earthquake Agent: Starting analysis for location='{location}'...")
    
    # 1. Fetch seismic parameters
    seismic_res = get_seismic_data(lat, lon, description_context=description)
    
    # 1b. Deterministic Verification Logic
    source = seismic_res.get("source", "unknown")
    verification_data = determine_verification_status(source, float(seismic_res.get("severity_score", 5.0)))
    
    verification_status = verification_data["verification_status"]
    confidence = verification_data["confidence"]
    evidence = verification_data["evidence"]
    event_confirmed = verification_status in ["LIVE", "HISTORICAL", "PREPAREDNESS"]
    
    # 2. Build and execute prompt using modular prompt files and LLM manager
    earthquake_p = load_prompt("earthquake_agent_prompt.md")

    user_context = (
        "## Current Task\n"
        f"{earthquake_p}\n\n"
        "## Compact State\n"
        f"Location: {location}\n"
        f"Earthquake Metrics: {summarize_earthquake(seismic_res)}\n\n"
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

    filled_prompt = user_context

    try:
        content = llm_manager.invoke(filled_prompt, temperature=0.0, require_json=True)
        app_logger.debug(f"Earthquake Agent LLM Raw Output:\n{content}")
        
        # Parse strictly
        parsed = parse_strict_json(content)
            
        # Map fields back to what the coordinator/application expects
        parsed["analysis_summary"] = parsed.get("summary", parsed.get("analysis_summary", "Seismic hazard assessment completed."))
        
        # Convert severity to severity_score
        severity_val = parsed.get("severity")
        if severity_val is not None:
            try:
                parsed["severity_score"] = float(severity_val)
            except ValueError:
                parsed["severity_score"] = float(seismic_res.get("severity_score", 5.0))
        else:
            parsed["severity_score"] = float(parsed.get("severity_score", seismic_res.get("severity_score", 5.0)))
            
        parsed["magnitude"] = float(parsed.get("magnitude", seismic_res.get("magnitude", 5.0)))
        parsed["depth_km"] = float(parsed.get("depth_km", seismic_res.get("depth_km", 10.0)))
        parsed["aftershock_risk"] = parsed.get("aftershock_risk", seismic_res.get("aftershock_risk", "LOW"))
        parsed["evacuation_recommended"] = bool(parsed.get("evacuation_recommended", parsed["severity_score"] >= 6.0))
        
        # Attach strictly deterministic verification metrics
        parsed["event_confirmed"] = event_confirmed
        parsed["verification_status"] = verification_status
        parsed["confidence"] = confidence
        parsed["api_source"] = source
        
        app_logger.info(f"Earthquake Agent: Analysis completed. Severity={parsed['severity_score']}, Aftershock={parsed['aftershock_risk']}, Verified: {verification_status}")
        return parsed
        
    except LLMServiceError as e:
        app_logger.error(f"Earthquake Agent: LLM failed: {e}", exc_info=True)
        # fall through to safe fallback below
    except Exception as e:
        app_logger.error(f"Earthquake Agent: Analysis failed: {e}", exc_info=True)
        # Safe fallback structure
        return {
            "magnitude": seismic_res.get("magnitude", 6.5),
            "depth_km": seismic_res.get("depth_km", 12.0),
            "aftershock_risk": seismic_res.get("aftershock_risk", "HIGH"),
            "severity_score": seismic_res.get("severity_score", 7.0),
            "evacuation_recommended": True,
            "analysis_summary": f"Seismic API fetch or LLM reasoning failed. Local fallback estimates indicate active seismic hazards. Detail: {e}",
            "event_confirmed": event_confirmed,
            "verification_status": verification_status,
            "confidence": confidence,
            "api_source": source
        }
