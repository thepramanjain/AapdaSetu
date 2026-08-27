import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.models import DisasterEvent, FundRequest, BlockchainTransaction, SystemLog

def seed_database(db: Session):
    """Seeds the database with realistic disaster incidents and funding requests."""
    # 1. Check if we already have disasters
    if db.query(DisasterEvent).first() is not None:
        print("Database already has data. Skipping seeding.")
        return

    print("Seeding initial realistic mock data into database...")

    # Incident 1: Brahmaputra River Flash Flood
    d1 = DisasterEvent(
        id="d-101",
        name="Brahmaputra River Flash Flood",
        event_type="flood",
        latitude=26.14,
        longitude=91.73,
        severity=9.4,
        severity_str="critical",
        population=480000,
        state="Assam",
        status="published",
        verification_status="LIVE",
        confidence=94,
        risk_level="Critical",
        description="Continuous monsoon rainfall caused the Brahmaputra River to overflow, inundating multiple villages in Dibrugarh district and disrupting transport infrastructure.",
        reported_at=datetime.now(timezone.utc) - timedelta(days=22),
        report_markdown={
            "government": "# AapdaSetu Govt Incident Report — Brahmaputra Flood\n- **Severity Level:** CRITICAL\n- **Confidence Rating:** 94%\n- **Total Population Exposed:** ~480,000 citizens\n- **Infrastructure Impact:** Dibrugarh-Guwahati road cutoff. 3 bridges washed out.\n- **Priority Recommendation:** Deploy SDRF teams and request air support.",
            "ngo": "# NGO Coordination Brief — Brahmaputra Flood\n- **Immediate Supplies Needed:** 12,000 dry ration packets, 40,000 water chlorine tablets.\n- **Sanitation Risk:** High risk of waterborne diseases. Mobilize Red Cross and regional NGO volunteers.\n- **Access Route:** Via NH-37 Corridor.",
            "public": "# Public Safety Advisory — Brahmaputra Flood\n- **Action Required:** Evacuate to higher areas immediately. Do not cross flooded paths.\n- **Emergency Helpline:** 1070 / 1078\n- **Safe Shelters:** Dibrugarh Govt Higher Secondary School & Moran Relief Camp."
        },
        mission_plan=[
            {"id": "m-1", "name": "Deploy NDRF Team Alpha", "priority": "High", "status": "Completed", "eta": "0 mins"},
            {"id": "m-2", "name": "Evacuate villages", "priority": "High", "status": "Completed", "eta": "0 mins"},
            {"id": "m-3", "name": "Medical Camp Setup", "priority": "High", "status": "Completed", "eta": "0 mins"},
            {"id": "m-4", "name": "Food Distribution", "priority": "Medium", "status": "Completed", "eta": "0 mins"},
            {"id": "m-5", "name": "Water Purification Units", "priority": "Medium", "status": "Completed", "eta": "0 mins"},
            {"id": "m-6", "name": "Temporary Shelters", "priority": "Medium", "status": "Completed", "eta": "0 mins"},
            {"id": "m-7", "name": "Boat Rescue Operations", "priority": "High", "status": "Completed", "eta": "0 mins"}
        ],
        hospitals=[
            {"name": "Assam Medical College Hospital", "availability": "Fully Functional", "distance": "5.2 km", "coordinates": [27.48, 94.90]},
            {"name": "Dibrugarh Civil Hospital", "availability": "24/7 Emergency Support", "distance": "3.8 km", "coordinates": [27.47, 94.92]},
            {"name": "Moran Community Health Centre", "availability": "Basic Trauma Care", "distance": "12.4 km", "coordinates": [27.18, 94.75]}
        ],
        shelters=[
            {"name": "Dibrugarh Govt Higher Secondary School", "availability": "150 Slots Open", "distance": "2.1 km", "coordinates": [27.49, 94.91]},
            {"name": "Moran Relief Camp", "availability": "300 Slots Open", "distance": "8.5 km", "coordinates": [27.20, 94.77]},
            {"name": "Barbaruah Community Hall", "availability": "80 Slots Open", "distance": "4.2 km", "coordinates": [27.45, 94.88]}
        ],
        relief_plan={"safe_route": "NH-37 Corridor"}
    )

    # Incident 2: South Lhonak GLOF Response
    d2 = DisasterEvent(
        id="d-102",
        name="South Lhonak GLOF Response",
        event_type="flood",
        latitude=27.67,
        longitude=88.62,
        severity=8.8,
        severity_str="high",
        population=62000,
        state="Sikkim",
        status="published",
        verification_status="LIVE",
        confidence=97,
        risk_level="High",
        description="A Glacial Lake Outburst Flood from South Lhonak Lake triggered flash floods along the Teesta basin, damaging bridges and downstream settlements.",
        reported_at=datetime.now(timezone.utc) - timedelta(days=294),
        report_markdown={
            "government": "# Preparedness & GLOF Response Briefing — South Lhonak\n- **Risk Level:** HIGH (GLOF LIVE EVENT)\n- **Confidence Rating:** 97%\n- **Status:** Blockchain release approved. Teesta basin evac active.",
            "ngo": "# NGO Directives — South Lhonak GLOF\n- **Target Resource:** Distribution of blankets, hygiene kits and emergency shelter materials.",
            "public": "# Preparedness Safety Alert — South Lhonak GLOF\n- **Situation:** Flash floods along Teesta basin.\n- **Advice:** Avoid river banks. Route via NH-10 Emergency Corridor."
        },
        mission_plan=[
            {"id": "m-8", "name": "Evacuate Teesta basin villages", "priority": "High", "status": "Completed", "eta": "0 mins"},
            {"id": "m-9", "name": "Deploy Army medical team", "priority": "High", "status": "Completed", "eta": "0 mins"},
            {"id": "m-10", "name": "Distribute blankets & emergency shelter materials", "priority": "Medium", "status": "Completed", "eta": "0 mins"},
            {"id": "m-11", "name": "Setup clean water distribution", "priority": "Medium", "status": "Completed", "eta": "0 mins"}
        ],
        hospitals=[
            {"name": "Mangan District Hospital", "availability": "Active", "distance": "4.5 km", "coordinates": [27.61, 88.58]},
            {"name": "STNM Hospital", "availability": "24/7 Referrals", "distance": "22.0 km", "coordinates": [27.32, 88.60]},
            {"name": "Army Medical Camp", "availability": "Trauma ICU", "distance": "8.0 km", "coordinates": [27.64, 88.63]}
        ],
        shelters=[
            {"name": "Mangan Relief Camp", "availability": "200 slots", "distance": "2.1 km", "coordinates": [27.62, 88.59]},
            {"name": "Government Polytechnic Shelter", "availability": "400 slots", "distance": "5.4 km", "coordinates": [27.58, 88.56]},
            {"name": "Community Hall", "availability": "100 slots", "distance": "1.2 km", "coordinates": [27.60, 88.57]}
        ],
        relief_plan={"safe_route": "NH-10 Emergency Corridor"}
    )

    # Incident 3: 2024 Assam Flood Simulation
    d3 = DisasterEvent(
        id="d-103",
        name="2024 Assam Flood Simulation",
        event_type="flood",
        latitude=26.14,
        longitude=91.73,
        severity=9.8,
        severity_str="critical",
        population=650000,
        state="Assam",
        status="reported",
        verification_status="Verified",
        confidence=98,
        risk_level="Critical",
        description="Historical telemetry logs verify the high-risk river levels. Ready for NGO relief task forces.",
        reported_at=datetime.now(timezone.utc) - timedelta(hours=12),
        report_markdown={
            "government": "# 2024 Assam Flood AI Intel Report\n- **Type:** FLOOD\n- **Risk Level:** CRITICAL\n- **Status:** Confirmed by AI Multi-Agent. Waiting to be published to responder network.",
            "ngo": "# NGO Directives — 2024 Assam Flood\n- **Immediate Supplies Needed:** 20,000 food packets, medical kits, temporary shelters.\n- **Sanitation Risk:** Elevated risk of waterborne vector diseases. Mobilize field teams.",
            "public": "# Public Safety Alert — 2024 Assam Flood\n- **Advice:** Evacuate immediately to higher regions and avoid flooded paths."
        },
        mission_plan=[
            {"id": "m-x-1", "name": "Establish 4 regional food distribution points", "priority": "High", "status": "Pending", "eta": "10 mins"},
            {"id": "m-x-2", "name": "Mobilize medical kits relief trucks", "priority": "High", "status": "Pending", "eta": "15 mins"}
        ],
        hospitals=[
            {"name": "Assam State Emergency Wing", "availability": "24 Beds", "distance": "5 km", "coordinates": [26.15, 91.74]}
        ],
        shelters=[
            {"name": "Disaster Relief Camp Beta", "availability": "500 slots", "distance": "3.2 km", "coordinates": [26.13, 91.72]}
        ],
        relief_plan={}
    )

    db.add_all([d1, d2, d3])

    # Seed Fund Requests
    fr1 = FundRequest(
        id="req-201",
        ngo="SEEDS Relief Organization",
        amount=1500000.0,
        purpose="Deploy 5 Water Purification Units",
        priority="High",
        status="submitted",
        required_resources="5 x Water Filtration Units, 2000 x Food/Med Packages",
        supporting_notes="We have teams on-ground in Dibrugarh. This funding will cover logistics and kit procurement.",
        disaster_id="d-101",
        disaster_name="Brahmaputra River Flash Flood",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=3)
    )

    fr2 = FundRequest(
        id="req-202",
        ngo="Red Cross India Council",
        amount=4500000.0,
        purpose="Establish temporary medical camp and diagnostic units",
        priority="High",
        status="blockchain_completed",
        reason="Immediate medical support recommended for high risk areas.",
        required_resources="3 x Trauma Ambulances, Medical supplies, 8 x Nurses",
        supporting_notes="Approved and confirmed via on-chain smart contract release.",
        disaster_id="d-101",
        disaster_name="Brahmaputra River Flash Flood",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=12),
        tx_hash="0x3f6e12a89b0db7c5f891b2c45def789a9cb2b82415bd8f8a9cfb824150df7812e"
    )

    fr3 = FundRequest(
        id="req-203",
        ngo="Goonj Foundation",
        amount=1200000.0,
        purpose="Blankets, hygiene kits and emergency shelter materials",
        priority="High",
        status="blockchain_completed",
        reason="GLOF outburst response. Emergency kits needed.",
        required_resources="1000 x Blankets, 1000 x Hygiene Kits, 200 x Shelter Tarps",
        supporting_notes="Approved and confirmed via on-chain smart contract release.",
        disaster_id="d-102",
        disaster_name="South Lhonak GLOF Response",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=20),
        tx_hash="0x4a15fb241d7898def789a9cb82415bd789acfb824150df7812e3f6e12a89b0db7"
    )

    db.add_all([fr1, fr2, fr3])

    # Seed Blockchain Transactions
    tx1 = BlockchainTransaction(
        hash="0x3f6e12a89b0db7c5f891b2c45def789a9cb2b82415bd8f8a9cfb824150df7812e",
        block=104289,
        timestamp=datetime.now(timezone.utc) - timedelta(hours=12),
        amount=4500000.0,
        ngo="Red Cross India Council",
        purpose="Establish temporary medical camp and diagnostic units",
        status="confirmed"
    )

    tx2 = BlockchainTransaction(
        hash="0x4a15fb241d7898def789a9cb82415bd789acfb824150df7812e3f6e12a89b0db7",
        block=104281,
        timestamp=datetime.now(timezone.utc) - timedelta(hours=20),
        amount=1200000.0,
        ngo="Goonj Foundation",
        purpose="Blankets, hygiene kits and emergency shelter materials",
        status="confirmed"
    )

    db.add_all([tx1, tx2])

    # Seed System Logs
    l1 = SystemLog(
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=10),
        level="info",
        agent="System",
        message="AapdaSetu Core Engine successfully bootstrapped."
    )
    l2 = SystemLog(
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=9),
        level="info",
        agent="Coordinator",
        message="Scanning data streams: IMD satellite imagery, USGS feed, and RSS news feeds."
    )
    l3 = SystemLog(
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=8),
        level="success",
        agent="Coordinator",
        message="No new anomaly detected in past 10 minutes scan cycle."
    )
    l4 = SystemLog(
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=5),
        level="warn",
        agent="System",
        message="ReliefWeb Portal API experiencing elevated response latency (420ms)."
    )

    db.add_all([l1, l2, l3, l4])

    db.commit()
    print("Database seeding completed successfully!")
