"""
AapdaSetu — RWA Agent
==============================
Resident Welfare Association community-level disaster response agent.

Implements BaseAgent. Logic:
  1. Filter societies within affected radius (geo-distance)
  2. Compute evacuation PRIORITY QUEUE (seniors > pregnant > disabled > children > others)
  3. Recommend nearest volunteers by skill relevant to disaster type
  4. Cross-check community resources against estimated need, flag shortages
  5. Emit "rwa.alert_ready" event
"""

import asyncio
from typing import Any, Dict

from agents.base_agent import BaseAgent, AgentResult
from modules.rwa.rwa_service import rwa_service
from services.event_bus import event_bus
import logging

logger = logging.getLogger("aapdasetu.rwa_agent")

class RWAAgent(BaseAgent):
    """Resident Welfare Association community-level response agent."""

    name = "RWA Community Agent"
    description = (
        "Evaluates registered housing societies within the disaster radius, "
        "computes evacuation priority queues, matches volunteers by skill, "
        "and flags resource shortages."
    )
    input_schema = {
        "disaster_type": "str — flood | earthquake | heatwave",
        "severity": "float — 0-10 scale",
        "latitude": "float",
        "longitude": "float",
        "radius_km": "float — search radius (default 25 km)",
    }
    output_schema = {
        "societies_affected": "int",
        "societies_data": "list[dict]",
        "recommended_volunteers": "list[dict]",
        "resource_shortages": "list[dict]",
    }

    def run(self, context: Dict[str, Any]) -> AgentResult:
        """Execute RWA logic synchronously (blocking on async calls if needed)."""
        logger.info("RWAAgent: Running for context %s", context.get("disaster_id", "unknown"))
        
        lat = context.get("latitude")
        lng = context.get("longitude")
        disaster_type = context.get("event_type", context.get("disaster_type", "unknown"))
        severity = context.get("severity", 5.0)
        radius_km = context.get("radius_km", 25.0)

        if lat is None or lng is None:
             return AgentResult(
                 status="ERROR",
                 data={"message": "Missing latitude or longitude in context"},
                 agent_name=self.name
             )

        # Create a new event loop to run async service methods if we are not in one
        try:
            loop = asyncio.get_running_loop()
            return loop.run_until_complete(self._async_run(lat, lng, disaster_type, severity, radius_km, context))
        except RuntimeError:
            return asyncio.run(self._async_run(lat, lng, disaster_type, severity, radius_km, context))

    async def _async_run(self, lat, lng, disaster_type, severity, radius_km, context):
        societies = await rwa_service.find_nearby_societies(lat, lng, radius_km)
        soc_ids = [s["id"] for s in societies]

        # Compute priority for all societies
        societies_data = []
        for soc in societies:
            prio = await rwa_service.compute_evacuation_priority(soc["id"])
            soc_data = soc.copy()
            soc_data["priority_queue"] = prio.get("priority_queue", [])
            societies_data.append(soc_data)
        
        vols = await rwa_service.match_volunteers(disaster_type, soc_ids)
        gaps = await rwa_service.check_resource_gaps(soc_ids, severity)

        payload = {
            "societies_affected": len(soc_ids),
            "societies_data": societies_data,
            "recommended_volunteers": vols,
            "resource_shortages": gaps,
        }

        if soc_ids:
            # Emit event
            event_bus.emit_sync("rwa.alert_ready", {
                "disaster_id": context.get("disaster_id"),
                "affected_societies_count": len(soc_ids)
            })

        return AgentResult(
            status="SUCCESS",
            data=payload,
            confidence=0.9,
            agent_name=self.name,
            next_agent_hint="allocate_resources",
        )
