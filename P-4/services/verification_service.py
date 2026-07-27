"""
Deterministic Verification Layer
================================
Enforces strict verification statuses based purely on API source data.
Never allows LLM hallucination for verification.
"""

from typing import Dict, Any

VALID_STATUSES = ["LIVE", "PREPAREDNESS", "SIMULATION", "HISTORICAL"]
LIVE_API_SOURCES = ["usgs_live_api", "glofas_flood_api", "open_meteo", "government_alerts"]

def determine_verification_status(api_source: str, severity: float) -> Dict[str, Any]:
    """
    Computes a deterministic verification block based on the underlying data source.
    """
    source = str(api_source).lower()
    
    if source in LIVE_API_SOURCES:
        if severity > 0.0:
            status = "LIVE"
            confidence = 0.95
            evidence = f"Verified LIVE event reported by {source} with severity {severity}"
        else:
            status = "PREPAREDNESS"
            confidence = 0.90
            evidence = f"Verified PREPAREDNESS condition reported by {source} (Severity: 0)"
    elif source == "local_cache":
        status = "HISTORICAL"
        confidence = 0.80
        evidence = "HISTORICAL event loaded from local cache."
    else:
        status = "SIMULATION"
        confidence = 0.30
        evidence = f"SIMULATION data. Unverified source: {source}."
        
    return {
        "verification_status": status,
        "confidence": confidence,
        "evidence": evidence
    }
