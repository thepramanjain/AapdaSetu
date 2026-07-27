"""
AapdaSetu — Heatwave Monitored Districts Config
==================================================
List of Indian cities/districts to monitor for heatwave risk.
Start with 15 major cities — expandable via admin API or config later.

Phase 0: Static config list.  Phase 3 may add dynamic management.
"""

# Each entry: (display_name, state, latitude, longitude)
MONITORED_DISTRICTS = [
    # North India
    ("New Delhi", "Delhi", 28.6139, 77.2090),
    ("Jaipur", "Rajasthan", 26.9124, 75.7873),
    ("Lucknow", "Uttar Pradesh", 26.8467, 80.9462),
    ("Chandigarh", "Chandigarh", 30.7333, 76.7794),

    # West India
    ("Ahmedabad", "Gujarat", 23.0225, 72.5714),
    ("Mumbai", "Maharashtra", 19.0760, 72.8777),
    ("Nagpur", "Maharashtra", 21.1458, 79.0882),

    # Central India
    ("Bhopal", "Madhya Pradesh", 23.2599, 77.4126),

    # South India
    ("Hyderabad", "Telangana", 17.3850, 78.4867),
    ("Chennai", "Tamil Nadu", 13.0827, 80.2707),
    ("Bengaluru", "Karnataka", 12.9716, 77.5946),
    ("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185),

    # East India
    ("Kolkata", "West Bengal", 22.5726, 88.3639),
    ("Bhubaneswar", "Odisha", 20.2961, 85.8245),
    ("Patna", "Bihar", 25.6093, 85.1376),
]


def get_all_districts():
    """Return the full list of monitored districts as dicts."""
    return [
        {
            "name": name,
            "state": state,
            "lat": lat,
            "lng": lng,
        }
        for name, state, lat, lng in MONITORED_DISTRICTS
    ]


def get_district_by_name(name: str):
    """Look up a district by name (case-insensitive)."""
    name_lower = name.lower()
    for d_name, state, lat, lng in MONITORED_DISTRICTS:
        if d_name.lower() == name_lower:
            return {"name": d_name, "state": state, "lat": lat, "lng": lng}
    return None
