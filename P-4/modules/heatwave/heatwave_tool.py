"""
AapdaSetu — Heatwave Tool (Open-Meteo Client)
================================================
API client for Open-Meteo forecast data, heat index computation,
and heatwave probability scoring.

Open-Meteo is free and requires NO API key.

Heat Index Formula:
  Uses the Rothfusz regression equation (standard NOAA formula):
  HI = -42.379 + 2.04901523*T + 10.14333127*RH
       - 0.22475541*T*RH - 6.83783e-3*T² - 5.481717e-2*RH²
       + 1.22874e-3*T²*RH + 8.5282e-4*T*RH² - 1.99e-6*T²*RH²

  Where T = temperature (°F), RH = relative humidity (%)
"""

import logging
import time
from typing import Any, Dict, Optional
import httpx

from backend.config import settings

logger = logging.getLogger("aapdasetu.heatwave_tool")

# Simple in-memory cache: key -> (timestamp, data)
_forecast_cache: Dict[str, tuple] = {}
CACHE_TTL_SECONDS = 1800  # 30 minutes


# ---------------------------------------------------------------------------
# Open-Meteo API Client
# ---------------------------------------------------------------------------

async def fetch_forecast(
    lat: float,
    lng: float,
    days: int = 4,
) -> Dict[str, Any]:
    """
    Fetch weather forecast from Open-Meteo for a location.

    Returns daily max/min temperature, humidity, wind speed, and precipitation
    for today + (days-1) forecast days.
    """
    cache_key = f"{lat:.2f}_{lng:.2f}_{days}"
    now = time.time()

    # Check cache
    if cache_key in _forecast_cache:
        cached_time, cached_data = _forecast_cache[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            logger.debug("Cache hit for forecast (%.2f, %.2f)", lat, lng)
            return cached_data

    base_url = settings.OPEN_METEO_BASE_URL
    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_max",
            "relative_humidity_2m_min",
            "wind_speed_10m_max",
            "precipitation_sum",
        ]),
        "forecast_days": days,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{base_url}/forecast", params=params)
            resp.raise_for_status()
            data = resp.json()

        # Cache the result
        _forecast_cache[cache_key] = (now, data)
        logger.info("Fetched forecast for (%.4f, %.4f) — %d days", lat, lng, days)
        return data

    except Exception as e:
        logger.error("Open-Meteo forecast failed for (%.4f, %.4f): %s", lat, lng, e)
        return {"error": str(e), "daily": None}


# ---------------------------------------------------------------------------
# Heat Index (NOAA Rothfusz Regression)
# ---------------------------------------------------------------------------

def celsius_to_fahrenheit(c: float) -> float:
    return c * 9.0 / 5.0 + 32.0

def fahrenheit_to_celsius(f: float) -> float:
    return (f - 32.0) * 5.0 / 9.0


def compute_heat_index(temp_celsius: float, humidity_pct: float) -> float:
    """
    Compute the Heat Index using the NOAA Rothfusz regression equation.

    Parameters
    ----------
    temp_celsius : float
        Air temperature in °C.
    humidity_pct : float
        Relative humidity in % (0-100).

    Returns
    -------
    float
        Heat Index in °C.

    Notes
    -----
    The Rothfusz regression is only valid for T >= 80°F (26.7°C) and RH >= 40%.
    For lower values we use a simpler Steadman approximation.
    """
    T = celsius_to_fahrenheit(temp_celsius)
    RH = humidity_pct

    # Below 80°F, use simple Steadman formula
    if T < 80.0:
        hi_f = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
        return fahrenheit_to_celsius(hi_f)

    # Rothfusz regression
    HI = (
        -42.379
        + 2.04901523 * T
        + 10.14333127 * RH
        - 0.22475541 * T * RH
        - 6.83783e-3 * T**2
        - 5.481717e-2 * RH**2
        + 1.22874e-3 * T**2 * RH
        + 8.5282e-4 * T * RH**2
        - 1.99e-6 * T**2 * RH**2
    )

    # Adjustment for low humidity
    if RH < 13.0 and 80.0 <= T <= 112.0:
        adjustment = -((13.0 - RH) / 4.0) * ((17.0 - abs(T - 95.0)) / 17.0) ** 0.5
        HI += adjustment

    # Adjustment for high humidity
    if RH > 85.0 and 80.0 <= T <= 87.0:
        adjustment = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
        HI += adjustment

    return fahrenheit_to_celsius(HI)


# ---------------------------------------------------------------------------
# Heatwave Probability Scoring
# ---------------------------------------------------------------------------

# Historical average max temps for Indian cities by month (°C) — simplified
# Source: IMD climatological normals (approximate)
HISTORICAL_AVG_MAX_TEMPS = {
    1: 22, 2: 25, 3: 31, 4: 36, 5: 40, 6: 39,
    7: 35, 8: 34, 9: 34, 10: 33, 11: 29, 12: 24,
}


def compute_heatwave_probability(
    max_temps: list[float],
    humidities: list[float],
    wind_speeds: list[float],
    historical_avg: float,
) -> float:
    """
    Compute heatwave probability (0-100%) using weighted scoring.

    Weights:
      - Temperature deviation from historical average: 40%
      - Heat index severity: 30%
      - Consecutive hot day trend: 20%
      - Low wind + high humidity combo: 10%

    Parameters
    ----------
    max_temps : list[float]
        Daily max temperatures (°C) for forecast period.
    humidities : list[float]
        Daily max relative humidity (%) values.
    wind_speeds : list[float]
        Daily max wind speeds (km/h).
    historical_avg : float
        Historical average max temperature for the current month (°C).

    Returns
    -------
    float
        Probability 0-100.
    """
    if not max_temps:
        return 0.0

    # 1. Temperature deviation score (40%)
    avg_temp = sum(max_temps) / len(max_temps)
    deviation = avg_temp - historical_avg
    # Scale: 0°C dev = 0, +3°C = 50, +6°C = 100
    temp_score = min(max(deviation / 6.0 * 100.0, 0.0), 100.0)

    # 2. Heat index severity score (30%)
    avg_humidity = sum(humidities) / len(humidities) if humidities else 50.0
    hi = compute_heat_index(avg_temp, avg_humidity)
    # Scale: HI < 27°C = 0, HI 27-32 = 25, HI 32-41 = 50, HI 41-54 = 75, HI > 54 = 100
    if hi < 27:
        hi_score = 0.0
    elif hi < 32:
        hi_score = 25.0
    elif hi < 41:
        hi_score = 50.0
    elif hi < 54:
        hi_score = 75.0
    else:
        hi_score = 100.0

    # 3. Consecutive hot day trend (20%)
    hot_threshold = historical_avg + 3.0
    consecutive = 0
    max_consecutive = 0
    for t in max_temps:
        if t > hot_threshold:
            consecutive += 1
            max_consecutive = max(max_consecutive, consecutive)
        else:
            consecutive = 0
    # Scale: 0 days = 0, 1 = 25, 2 = 50, 3 = 75, 4+ = 100
    consec_score = min(max_consecutive / 4.0 * 100.0, 100.0)

    # 4. Low wind + high humidity combo (10%)
    avg_wind = sum(wind_speeds) / len(wind_speeds) if wind_speeds else 10.0
    # Low wind (<10 km/h) + high humidity (>60%) is dangerous
    combo_score = 0.0
    if avg_wind < 10.0 and avg_humidity > 60.0:
        combo_score = 100.0
    elif avg_wind < 15.0 and avg_humidity > 50.0:
        combo_score = 50.0
    elif avg_wind < 20.0 or avg_humidity > 40.0:
        combo_score = 25.0

    # Weighted total
    probability = (
        temp_score * 0.40
        + hi_score * 0.30
        + consec_score * 0.20
        + combo_score * 0.10
    )

    return round(min(max(probability, 0.0), 100.0), 1)


def classify_risk(probability: float) -> str:
    """Map probability to risk classification."""
    if probability >= 75:
        return "EXTREME"
    elif probability >= 50:
        return "HIGH"
    elif probability >= 25:
        return "MEDIUM"
    else:
        return "LOW"


# ---------------------------------------------------------------------------
# Recommendation Generator
# ---------------------------------------------------------------------------

RECOMMENDATIONS = {
    "EXTREME": {
        "government": [
            "Declare heatwave emergency and activate NDMA protocols",
            "Open all government buildings as cooling centers",
            "Deploy mobile water tankers to vulnerable areas",
            "Issue work-from-home advisory for non-essential workers",
            "Alert hospitals to prepare for heat stroke admissions",
        ],
        "ngo": [
            "Distribute ORS packets and water bottles in slum areas",
            "Set up temporary shade shelters near construction sites",
            "Deploy volunteer medical teams to outdoor markets",
            "Coordinate with RWA societies for elderly welfare checks",
        ],
        "public": [
            "STAY INDOORS between 11 AM – 4 PM",
            "Drink water every 20 minutes, even if not thirsty",
            "Wear light, loose cotton clothing and cover your head",
            "Check on elderly neighbors and young children regularly",
            "Call 108 immediately if anyone shows signs of heat stroke",
        ],
    },
    "HIGH": {
        "government": [
            "Issue heatwave advisory through all media channels",
            "Extend water supply hours in affected districts",
            "Ensure power grid stability for AC/cooler demand",
        ],
        "ngo": [
            "Distribute water and ORS in high-traffic areas",
            "Conduct awareness drives in vulnerable communities",
        ],
        "public": [
            "Avoid outdoor activities during peak afternoon hours",
            "Stay hydrated — drink at least 3 liters of water daily",
            "Use wet towels or take cool showers to reduce body temp",
        ],
    },
    "MEDIUM": {
        "government": ["Monitor situation and prepare contingency plans"],
        "ngo": ["Stock up on ORS and water supplies"],
        "public": [
            "Stay hydrated and limit strenuous outdoor activity",
            "Keep an eye on weather updates",
        ],
    },
    "LOW": {
        "government": ["Continue routine monitoring"],
        "ngo": ["No immediate action required"],
        "public": ["Normal precautions — stay hydrated in warm weather"],
    },
}


def get_recommendations(risk_level: str, role: str = "public") -> list[str]:
    """Return role-specific recommendations for the given risk level."""
    risk = risk_level.upper()
    r = role.lower()
    return RECOMMENDATIONS.get(risk, RECOMMENDATIONS["LOW"]).get(r, [])
