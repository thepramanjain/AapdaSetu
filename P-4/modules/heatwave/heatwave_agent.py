"""
AapdaSetu — Heatwave Prediction Agent
========================================
Proactive agent that forecasts heatwave risk per district using
Open-Meteo weather data and the NOAA heat index formula.

Implements BaseAgent.
  1. Fetch forecast (today + 3 days) per district from Open-Meteo
  2. Compute Heat Index per day
  3. Compute Heatwave Probability (0-100%)
  4. Classify risk: LOW / MEDIUM / HIGH / EXTREME
  5. Generate role-specific recommendations
  6. Emit "heatwave.alert" if >= HIGH for any district
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List

from agents.base_agent import BaseAgent, AgentResult
from modules.heatwave.heatwave_tool import (
    fetch_forecast,
    compute_heat_index,
    compute_heatwave_probability,
    classify_risk,
    get_recommendations,
    HISTORICAL_AVG_MAX_TEMPS,
)
from modules.heatwave.heatwave_config import get_all_districts, get_district_by_name
from services.event_bus import event_bus

logger = logging.getLogger("aapdasetu.heatwave_agent")


class HeatwaveAgent(BaseAgent):
    """Proactive heatwave prediction agent using Open-Meteo weather data."""

    name = "Heatwave Prediction Agent"
    description = (
        "Analyses live weather forecasts to generate district-wise heatwave "
        "risk predictions and early warnings."
    )
    input_schema = {
        "districts": "list[str] — district/city names to monitor (optional, defaults to all)",
    }
    output_schema = {
        "district_forecasts": "list[DistrictForecast]",
        "alerts": "list[HeatwaveAlert]",
        "recommendations": "dict[role, list[str]]",
    }

    def run(self, context: Dict[str, Any]) -> AgentResult:
        """Execute heatwave prediction logic."""
        logger.info("HeatwaveAgent: Starting prediction run")

        try:
            loop = asyncio.get_running_loop()
            return loop.run_until_complete(self._async_run(context))
        except RuntimeError:
            return asyncio.run(self._async_run(context))

    async def _async_run(self, context: Dict[str, Any]) -> AgentResult:
        # Determine which districts to check
        district_names = context.get("districts", [])
        if district_names:
            districts = [get_district_by_name(n) for n in district_names]
            districts = [d for d in districts if d is not None]
        else:
            districts = get_all_districts()

        if not districts:
            return AgentResult(
                status="ERROR",
                data={"message": "No valid districts specified"},
                agent_name=self.name,
            )

        current_month = datetime.now().month
        historical_avg = HISTORICAL_AVG_MAX_TEMPS.get(current_month, 35)

        forecasts = []
        alerts = []
        worst_risk = "LOW"
        worst_district = ""

        for district in districts:
            raw = await fetch_forecast(district["lat"], district["lng"], days=4)

            daily = raw.get("daily")
            if not daily:
                forecasts.append({
                    "district": district["name"],
                    "state": district["state"],
                    "status": "error",
                    "error": raw.get("error", "No data"),
                })
                continue

            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            hum_max = daily.get("relative_humidity_2m_max", [])
            hum_min = daily.get("relative_humidity_2m_min", [])
            wind_max = daily.get("wind_speed_10m_max", [])
            precip = daily.get("precipitation_sum", [])
            dates = daily.get("time", [])

            # Compute humidities (average of max and min)
            humidities = [
                (hum_max[i] + hum_min[i]) / 2 if i < len(hum_min) else hum_max[i]
                for i in range(len(hum_max))
            ]

            # Daily heat indices
            daily_hi = [
                round(compute_heat_index(max_temps[i], humidities[i]), 1)
                for i in range(len(max_temps))
            ]

            # Probability
            probability = compute_heatwave_probability(
                max_temps, humidities, wind_max, historical_avg
            )
            risk = classify_risk(probability)

            # Build daily breakdown
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

            forecast_entry = {
                "district": district["name"],
                "state": district["state"],
                "lat": district["lat"],
                "lng": district["lng"],
                "probability": probability,
                "risk_level": risk,
                "heat_index_today": daily_hi[0] if daily_hi else None,
                "daily": daily_data,
            }
            forecasts.append(forecast_entry)

            # Track alerts
            if risk in ("HIGH", "EXTREME"):
                alerts.append({
                    "district": district["name"],
                    "state": district["state"],
                    "risk_level": risk,
                    "probability": probability,
                    "heat_index_c": daily_hi[0] if daily_hi else None,
                })

            # Track worst for recommendations
            risk_order = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "EXTREME": 3}
            if risk_order.get(risk, 0) > risk_order.get(worst_risk, 0):
                worst_risk = risk
                worst_district = district["name"]

        # Generate recommendations based on worst risk
        recommendations = {
            "government": get_recommendations(worst_risk, "government"),
            "ngo": get_recommendations(worst_risk, "ngo"),
            "public": get_recommendations(worst_risk, "public"),
        }

        # Emit alerts
        if alerts:
            event_bus.emit_sync("heatwave.alert", {
                "alert_count": len(alerts),
                "worst_risk": worst_risk,
                "worst_district": worst_district,
                "districts": [a["district"] for a in alerts],
            })

        payload = {
            "district_forecasts": forecasts,
            "alerts": alerts,
            "recommendations": recommendations,
            "summary": {
                "districts_monitored": len(districts),
                "districts_at_risk": len(alerts),
                "worst_risk_level": worst_risk,
                "worst_district": worst_district,
            },
        }

        return AgentResult(
            status="SUCCESS",
            data=payload,
            confidence=0.85,
            agent_name=self.name,
        )
