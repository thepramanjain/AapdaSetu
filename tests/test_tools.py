"""
AapdaSetu - Tools Verification Test Suite
==========================================
Runs unit tests against all geocoding, meteorological, seismic, spatial,
and vector database tools.
"""

import sys
import os
import pytest

# Add workspace root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.geocoder_tool import geocode_location
from tools.weather_tool import get_weather
from tools.flood_tool import get_flood_forecast
from tools.earthquake_tool import get_seismic_data
from tools.hospital_tool import find_nearby_hospitals
from tools.shelter_tool import find_nearby_shelters
from tools.maps_tool import get_safe_route
from tools.rag_tool import search_guidelines


def test_geocoder_tool():
    """Verify address geocoding resolves to coordinates."""
    res = geocode_location("Mumbai Central")
    assert res["status"] == "success"
    assert "latitude" in res
    assert "longitude" in res
    assert res["latitude"] != 0.0


def test_weather_tool():
    """Verify weather tool retrieves temperature and precipitation."""
    res = get_weather(19.0760, 72.8777)
    assert res["status"] == "success"
    assert "temperature_c" in res
    assert "precipitation_mm" in res


def test_flood_tool():
    """Verify GloFAS flood forecast queries river discharge."""
    res = get_flood_forecast(19.0760, 72.8777, rainfall_mm=45.0)
    assert res["status"] == "success"
    assert "flood_probability" in res
    assert "flood_severity_score" in res


def test_earthquake_tool():
    """Verify USGS earthquake query compiles seismic metrics."""
    res = get_seismic_data(19.0760, 72.8777, "minor ground tremors reported")
    assert res["status"] == "success"
    assert "magnitude" in res
    assert "depth_km" in res
    assert "aftershock_risk" in res


def test_hospitals_query():
    """Verify proximity search on hospitals CSV."""
    res = find_nearby_hospitals(19.0760, 72.8777, radius_km=15.0)
    assert isinstance(res, list)
    # Even if CSV is not generated yet, fallback must return records
    assert len(res) > 0
    assert "distance_km" in res[0]


def test_shelters_query():
    """Verify proximity search on shelters CSV."""
    res = find_nearby_shelters(19.0760, 72.8777, radius_km=15.0)
    assert isinstance(res, list)
    assert len(res) > 0
    assert "distance_km" in res[0]


def test_maps_routing():
    """Verify OSRM route calculations and warning flags."""
    res = get_safe_route(19.0760, 72.8777, 19.0380, 72.8538)
    assert res["status"] == "success"
    assert "distance_km" in res
    assert "routing_advice" in res


def test_rag_guidelines_search():
    """Verify guideline vector searches and fallbacks."""
    res = search_guidelines("evacuation routes", disaster_filter="flood", top_k=1)
    assert isinstance(res, list)
    assert len(res) > 0
    assert "text" in res[0]
