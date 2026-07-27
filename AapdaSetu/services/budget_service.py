"""Budget Recommendation Service
A deterministic service using configurable heuristics to estimate emergency
disaster relief funding in Indian Rupees (INR).

All monetary values are stored and returned in INR.
Display formatting follows the Indian numbering system (Lakhs / Crores).
"""

from backend.config import app_logger
from services.logging_service import execution_logger


# ---------------------------------------------------------------------------
# Indian number system formatter
# ---------------------------------------------------------------------------

def format_inr(amount: float) -> str:
    """Format a rupee amount using the Indian numbering system.

    Examples
    --------
    format_inr(50_000)      -> '\u20b950,000'
    format_inr(2_50_000)    -> '\u20b92.50 Lakhs'
    format_inr(18_00_000)   -> '\u20b918.00 Lakhs'
    format_inr(1_20_00_000) -> '\u20b91.20 Crore'
    format_inr(8_00_00_000) -> '\u20b980.00 Crore'
    """
    if amount <= 0:
        return "\u20b90"

    LAKH  = 1_00_000      # 100,000
    CRORE = 1_00_00_000   # 10,000,000

    if amount >= CRORE:
        return f"\u20b9{amount / CRORE:.2f} Crore"
    elif amount >= LAKH:
        return f"\u20b9{amount / LAKH:.2f} Lakhs"
    else:
        # Plain rupee with comma separators for amounts < 1 Lakh
        return f"\u20b9{int(round(amount)):,}"


# ---------------------------------------------------------------------------
# Budget calculation  (all values in INR)
# ---------------------------------------------------------------------------

def calculate_budget(
    risk_level: str,
    severity: float,
    population: int,
    hospitals_count: int,
    shelters_count: int,
    mission_count: int = 0,
    route_distance_km: float = 0.0,
) -> dict:
    """Estimates emergency disaster relief funding in Indian Rupees (INR).

    Indian disaster relief scale references
    ----------------------------------------
    Per-person relief support  : \u20b92,000 - \u20b910,000
    Field mission cost         : \u20b95,00,000 each
    Hospital emergency support : \u20b92,00,000 per hospital
    Shelter logistics support  : \u20b950,000 per shelter
    Evacuation routing         : \u20b910,000 / km
    Base preparedness reserve  : \u20b95,00,000
    """
    app_logger.info("Budget Service: Calculating Estimated Disaster Response Budget (INR)...")
    execution_logger.log_service_execution(
        "Budget Service", "STARTING", "Calculating budget heuristically in INR."
    )

    # ------------------------------------------------------------------
    # 1. Baseline Preparedness Reserve
    # ------------------------------------------------------------------
    preparedness_reserve = 5_00_000.0       # \u20b95 Lakhs baseline

    # ------------------------------------------------------------------
    # 2. Risk & Severity Multipliers
    # ------------------------------------------------------------------
    risk = risk_level.upper() if risk_level else "LOW"
    severity_multiplier = {
        "LOW":      1.0,
        "MEDIUM":   1.5,
        "HIGH":     3.0,
        "CRITICAL": 5.0,
    }.get(risk, 1.0)

    # Effective population when real figure unavailable
    effective_population = population if population > 0 else (max(severity, 1.0) * 1000)

    # Base relief: \u20b92,000 per person (scales with severity multiplier)
    base_relief_per_person = 2_000.0

    # ------------------------------------------------------------------
    # 3. Component Budgets
    # ------------------------------------------------------------------
    mission_cost          = mission_count    * 5_00_000.0   # \u20b95L per mission
    hospital_cost         = hospitals_count  * 2_00_000.0   # \u20b92L per hospital
    shelter_cost          = shelters_count   * 50_000.0     # \u20b950K per shelter
    evacuation_cost       = max(route_distance_km, 10.0) * 10_000.0  # \u20b910K/km; min 10 km

    population_cost       = effective_population * base_relief_per_person * severity_multiplier

    medical_budget        = population_cost * 0.25 + hospital_cost
    shelter_budget_alloc  = population_cost * 0.20 + shelter_cost
    food_budget           = population_cost * 0.15
    water_budget          = population_cost * 0.10
    transport_budget      = evacuation_cost + (mission_cost * 0.10)
    communication_budget  = max(50_000.0,   population_cost * 0.05)   # min \u20b950K
    logistics_budget      = max(1_00_000.0, mission_cost * 0.60)      # min \u20b91L
    reserve_budget        = preparedness_reserve + (population_cost * 0.15)

    total_budget = (
        medical_budget + shelter_budget_alloc + food_budget + water_budget
        + transport_budget + communication_budget + logistics_budget + reserve_budget
    )

    # ------------------------------------------------------------------
    # 4. Confidence score
    # ------------------------------------------------------------------
    conf_points = 50
    if population        > 0: conf_points += 20
    if hospitals_count   > 0: conf_points += 10
    if shelters_count    > 0: conf_points += 10
    if route_distance_km > 0: conf_points += 10

    # ------------------------------------------------------------------
    # 5. Human-readable justification (fully in INR)
    # ------------------------------------------------------------------
    per_person_effective = base_relief_per_person * severity_multiplier
    justification = (
        f"Estimated Disaster Response Budget formulated based on {risk} risk "
        f"(severity: {severity}/10). "
        f"Includes base preparedness reserve ({format_inr(preparedness_reserve)}), "
        f"relief support for {int(effective_population):,} estimated individuals "
        f"at {format_inr(per_person_effective)}/person, "
        f"{mission_count} emergency mission(s) at {format_inr(5_00_000)}/mission, "
        f"{hospitals_count} hospital(s), and {shelters_count} shelter(s). "
        f"Evacuation logistics cover {route_distance_km:.1f} km of primary routing."
    )

    execution_logger.log_service_execution(
        "Budget Service",
        "COMPLETED",
        f"Estimated Disaster Response Budget (INR): {format_inr(total_budget)}"
        f" | Confidence: {conf_points}%",
    )

    return {
        # Primary key \u2014 backward-compatible with all consumers
        "recommended_budget": total_budget,
        "confidence_score":   conf_points,
        "currency":           "INR",
        "budget_breakdown": {
            "medical":        round(medical_budget,       2),
            "shelter":        round(shelter_budget_alloc, 2),
            "food":           round(food_budget,          2),
            "water":          round(water_budget,         2),
            "transport":      round(transport_budget,     2),
            "communication":  round(communication_budget, 2),
            "logistics":      round(logistics_budget,     2),
            "reserve":        round(reserve_budget,       2),
        },
        "justification": justification,
    }

