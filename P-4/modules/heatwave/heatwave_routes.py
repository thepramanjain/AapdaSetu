"""
AapdaSetu — Heatwave API Routes
==================================
REST endpoints for the Heatwave Prediction module.
"""

from fastapi import APIRouter, HTTPException, Query
from modules.heatwave.heatwave_tool import (
    fetch_forecast,
    compute_heat_index,
    compute_heatwave_probability,
    classify_risk,
    get_recommendations,
    HISTORICAL_AVG_MAX_TEMPS,
)
from modules.heatwave.heatwave_config import get_all_districts, get_district_by_name
from datetime import datetime

router = APIRouter(prefix="/api/heatwave", tags=["Heatwave Prediction"])


@router.get("/status")
async def heatwave_status():
    """Health check for the Heatwave module."""
    return {"module": "heatwave", "status": "active", "phase": 3, "monitored_districts": len(get_all_districts())}


@router.get("/forecast")
async def get_forecast(district: str = Query(..., description="District/city name")):
    """Get heatwave forecast for a district (today + 3 days)."""
    d = get_district_by_name(district)
    if not d:
        raise HTTPException(status_code=404, detail=f"District '{district}' not found in monitored list.")

    raw = await fetch_forecast(d["lat"], d["lng"], days=4)
    daily = raw.get("daily")
    if not daily:
        raise HTTPException(status_code=502, detail=f"Could not fetch weather data: {raw.get('error', 'Unknown')}")

    max_temps = daily.get("temperature_2m_max", [])
    min_temps = daily.get("temperature_2m_min", [])
    hum_max = daily.get("relative_humidity_2m_max", [])
    hum_min = daily.get("relative_humidity_2m_min", [])
    wind_max = daily.get("wind_speed_10m_max", [])
    precip = daily.get("precipitation_sum", [])
    dates = daily.get("time", [])

    humidities = [
        (hum_max[i] + hum_min[i]) / 2 if i < len(hum_min) else hum_max[i]
        for i in range(len(hum_max))
    ]

    daily_hi = [
        round(compute_heat_index(max_temps[i], humidities[i]), 1)
        for i in range(len(max_temps))
    ]

    current_month = datetime.now().month
    historical_avg = HISTORICAL_AVG_MAX_TEMPS.get(current_month, 35)
    probability = compute_heatwave_probability(max_temps, humidities, wind_max, historical_avg)
    risk = classify_risk(probability)

    daily_data = []
    for i in range(len(dates)):
        daily_data.append({
            "date": dates[i],
            "max_temp_c": max_temps[i] if i < len(max_temps) else None,
            "min_temp_c": min_temps[i] if i < len(min_temps) else None,
            "humidity_pct": round(humidities[i], 1) if i < len(humidities) else None,
            "wind_speed_kmh": wind_max[i] if i < len(wind_max) else None,
            "precipitation_mm": precip[i] if i < len(precip) else None,
            "heat_index_c": daily_hi[i] if i < len(daily_hi) else None,
        })

    return {
        "district": d["name"],
        "state": d["state"],
        "lat": d["lat"],
        "lng": d["lng"],
        "probability": probability,
        "risk_level": risk,
        "historical_avg_max_c": historical_avg,
        "daily": daily_data,
        "recommendations": get_recommendations(risk, "public"),
    }


@router.get("/map")
async def get_heat_map():
    """Get all monitored districts with current risk level (for India map rendering)."""
    districts = get_all_districts()
    current_month = datetime.now().month
    historical_avg = HISTORICAL_AVG_MAX_TEMPS.get(current_month, 35)

    results = []
    for d in districts:
        raw = await fetch_forecast(d["lat"], d["lng"], days=2)
        daily = raw.get("daily")

        if not daily:
            results.append({
                "district": d["name"], "state": d["state"],
                "lat": d["lat"], "lng": d["lng"],
                "risk_level": "UNKNOWN", "probability": 0,
                "max_temp_today": None, "heat_index_today": None,
            })
            continue

        max_temps = daily.get("temperature_2m_max", [])
        hum_max = daily.get("relative_humidity_2m_max", [])
        hum_min = daily.get("relative_humidity_2m_min", [])
        wind_max = daily.get("wind_speed_10m_max", [])

        humidities = [
            (hum_max[i] + hum_min[i]) / 2 if i < len(hum_min) else hum_max[i]
            for i in range(len(hum_max))
        ]

        hi_today = round(compute_heat_index(max_temps[0], humidities[0]), 1) if max_temps and humidities else None
        probability = compute_heatwave_probability(max_temps, humidities, wind_max, historical_avg)
        risk = classify_risk(probability)

        results.append({
            "district": d["name"],
            "state": d["state"],
            "lat": d["lat"],
            "lng": d["lng"],
            "risk_level": risk,
            "probability": probability,
            "max_temp_today": max_temps[0] if max_temps else None,
            "heat_index_today": hi_today,
        })

    return {"districts": results, "total": len(results)}


@router.get("/recommendations")
async def get_recommendations_endpoint(
    district: str = Query("", description="District name (optional)"),
    role: str = Query("public", description="Role: government, ngo, or public"),
):
    """Get role-specific heatwave recommendations."""
    if district:
        d = get_district_by_name(district)
        if not d:
            raise HTTPException(status_code=404, detail=f"District '{district}' not found.")

        raw = await fetch_forecast(d["lat"], d["lng"], days=4)
        daily = raw.get("daily")
        if not daily:
            return {"district": district, "risk_level": "UNKNOWN", "recommendations": []}

        max_temps = daily.get("temperature_2m_max", [])
        hum_max = daily.get("relative_humidity_2m_max", [])
        hum_min = daily.get("relative_humidity_2m_min", [])
        wind_max = daily.get("wind_speed_10m_max", [])
        humidities = [(hum_max[i] + hum_min[i]) / 2 if i < len(hum_min) else hum_max[i] for i in range(len(hum_max))]

        current_month = datetime.now().month
        historical_avg = HISTORICAL_AVG_MAX_TEMPS.get(current_month, 35)
        probability = compute_heatwave_probability(max_temps, humidities, wind_max, historical_avg)
        risk = classify_risk(probability)
    else:
        risk = "MEDIUM"

    recs = get_recommendations(risk, role)
    return {"district": district or "General", "role": role, "risk_level": risk, "recommendations": recs}
