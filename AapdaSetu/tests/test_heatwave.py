"""
Tests for the Heatwave Prediction module (Phase 3).
Tests heat index formula, probability scoring, risk classification,
district config, and agent interface.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from modules.heatwave.heatwave_tool import (
    compute_heat_index,
    compute_heatwave_probability,
    classify_risk,
    get_recommendations,
    celsius_to_fahrenheit,
    fahrenheit_to_celsius,
)
from modules.heatwave.heatwave_config import get_all_districts, get_district_by_name


# --- Temperature conversion ---

def test_celsius_to_fahrenheit():
    assert celsius_to_fahrenheit(0) == 32.0
    assert celsius_to_fahrenheit(100) == 212.0
    assert abs(celsius_to_fahrenheit(37) - 98.6) < 0.1


def test_fahrenheit_to_celsius():
    assert fahrenheit_to_celsius(32) == 0.0
    assert fahrenheit_to_celsius(212) == 100.0


# --- Heat Index (NOAA Rothfusz) ---

def test_heat_index_low_temp():
    """Below 26.7°C (80°F), uses Steadman approximation."""
    hi = compute_heat_index(20.0, 50.0)
    # Should be close to input temp at low values
    assert 18 < hi < 24


def test_heat_index_moderate():
    """At ~30°C and 60% humidity, heat index should be higher than raw temp."""
    hi = compute_heat_index(30.0, 60.0)
    assert hi > 30.0  # Heat index should exceed raw temp with humidity


def test_heat_index_extreme():
    """At 45°C and 40% humidity (typical Delhi heatwave), HI should be very high."""
    hi = compute_heat_index(45.0, 40.0)
    assert hi > 48  # Should be significantly above raw temp


def test_heat_index_high_humidity():
    """High humidity amplifies the heat index."""
    hi_low = compute_heat_index(35.0, 30.0)
    hi_high = compute_heat_index(35.0, 80.0)
    assert hi_high > hi_low  # Higher humidity = higher heat index


# --- Probability scoring ---

def test_probability_empty_input():
    assert compute_heatwave_probability([], [], [], 35.0) == 0.0


def test_probability_cool_weather():
    """Cool temps below historical average should produce low probability."""
    prob = compute_heatwave_probability(
        max_temps=[30, 31, 30, 29],
        humidities=[50, 50, 50, 50],
        wind_speeds=[15, 15, 15, 15],
        historical_avg=35.0,
    )
    assert prob < 25  # Should be LOW


def test_probability_hot_weather():
    """Temps well above historical average should produce high probability."""
    prob = compute_heatwave_probability(
        max_temps=[44, 45, 46, 47],
        humidities=[30, 30, 30, 30],
        wind_speeds=[5, 5, 5, 5],
        historical_avg=35.0,
    )
    assert prob > 50  # Should be HIGH or EXTREME


def test_probability_range():
    """Probability should always be between 0 and 100."""
    prob = compute_heatwave_probability(
        max_temps=[50, 51, 52, 53],
        humidities=[90, 90, 90, 90],
        wind_speeds=[2, 2, 2, 2],
        historical_avg=30.0,
    )
    assert 0 <= prob <= 100


# --- Risk classification ---

def test_classify_risk_low():
    assert classify_risk(10) == "LOW"
    assert classify_risk(24.9) == "LOW"


def test_classify_risk_medium():
    assert classify_risk(25) == "MEDIUM"
    assert classify_risk(49.9) == "MEDIUM"


def test_classify_risk_high():
    assert classify_risk(50) == "HIGH"
    assert classify_risk(74.9) == "HIGH"


def test_classify_risk_extreme():
    assert classify_risk(75) == "EXTREME"
    assert classify_risk(100) == "EXTREME"


# --- District config ---

def test_get_all_districts():
    districts = get_all_districts()
    assert len(districts) == 15
    assert all("name" in d and "lat" in d and "lng" in d for d in districts)


def test_get_district_by_name():
    d = get_district_by_name("New Delhi")
    assert d is not None
    assert d["name"] == "New Delhi"

    d2 = get_district_by_name("NonExistent")
    assert d2 is None


def test_get_district_case_insensitive():
    d = get_district_by_name("mumbai")
    assert d is not None
    assert d["state"] == "Maharashtra"


# --- Recommendations ---

def test_recommendations_extreme():
    recs = get_recommendations("EXTREME", "public")
    assert len(recs) > 0
    assert any("STAY INDOORS" in r or "heat stroke" in r.lower() for r in recs)


def test_recommendations_low():
    recs = get_recommendations("LOW", "government")
    assert len(recs) > 0


# --- Agent interface ---

def test_heatwave_agent_interface():
    """The HeatwaveAgent should implement BaseAgent and return AgentResult."""
    from modules.heatwave.heatwave_agent import HeatwaveAgent

    agent = HeatwaveAgent()
    assert agent.name == "Heatwave Prediction Agent"
    assert hasattr(agent, "run")
