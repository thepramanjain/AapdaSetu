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

    # ------------------------------------------------------------------
    # Phase 1: Seed RWA Societies, Volunteers, and Community Resources
    # ------------------------------------------------------------------
    from modules.rwa.rwa_models import Society, RWAVolunteer, CommunityResource

    # Mumbai region societies (near Brahmaputra flood coords for demo cross-referencing)
    soc1 = Society(
        id="soc-mumbai-01", name="Sunrise Heights RWA", address="Andheri West, Mumbai",
        latitude=19.1362, longitude=72.8296,
        president_name="Rajesh Sharma", president_phone="+919876543210",
        total_population=450, children_count=80, senior_citizen_count=60,
        pregnant_women_count=12, disabled_residents_count=8, pet_count=35,
        has_community_hall=True, generator_count=2, boat_count=0,
        water_tank_capacity_liters=5000.0,
    )
    soc2 = Society(
        id="soc-mumbai-02", name="Green Valley Society", address="Borivali East, Mumbai",
        latitude=19.2307, longitude=72.8567,
        president_name="Priya Mehta", president_phone="+919876543211",
        total_population=320, children_count=55, senior_citizen_count=45,
        pregnant_women_count=8, disabled_residents_count=5, pet_count=20,
        has_community_hall=True, generator_count=1, boat_count=0,
        water_tank_capacity_liters=3000.0,
    )
    soc3 = Society(
        id="soc-mumbai-03", name="Marine View Apartments", address="Worli, Mumbai",
        latitude=19.0176, longitude=72.8153,
        president_name="Amit Desai", president_phone="+919876543212",
        total_population=200, children_count=30, senior_citizen_count=35,
        pregnant_women_count=5, disabled_residents_count=3, pet_count=15,
        has_community_hall=False, generator_count=1, boat_count=1,
        water_tank_capacity_liters=2000.0,
    )

    # Delhi region societies
    soc4 = Society(
        id="soc-delhi-01", name="Vasant Kunj RWA", address="Vasant Kunj, New Delhi",
        latitude=28.5195, longitude=77.1585,
        president_name="Sunil Gupta", president_phone="+919876543213",
        total_population=600, children_count=120, senior_citizen_count=80,
        pregnant_women_count=15, disabled_residents_count=10, pet_count=40,
        has_community_hall=True, generator_count=3, boat_count=0,
        water_tank_capacity_liters=8000.0,
    )
    soc5 = Society(
        id="soc-delhi-02", name="Dwarka Sector 12 RWA", address="Dwarka Sector 12, New Delhi",
        latitude=28.5921, longitude=77.0419,
        president_name="Neha Singh", president_phone="+919876543214",
        total_population=800, children_count=150, senior_citizen_count=100,
        pregnant_women_count=20, disabled_residents_count=12, pet_count=55,
        has_community_hall=True, generator_count=4, boat_count=0,
        water_tank_capacity_liters=10000.0,
    )

    # Assam region society (near disaster coords)
    soc6 = Society(
        id="soc-assam-01", name="Dibrugarh Township RWA", address="Dibrugarh Town, Assam",
        latitude=27.4728, longitude=94.9120,
        president_name="Bhaskar Bora", president_phone="+919876543215",
        total_population=350, children_count=70, senior_citizen_count=50,
        pregnant_women_count=10, disabled_residents_count=6, pet_count=25,
        has_community_hall=True, generator_count=1, boat_count=3,
        water_tank_capacity_liters=4000.0,
    )

    db.add_all([soc1, soc2, soc3, soc4, soc5, soc6])

    # Volunteers
    volunteers = [
        RWAVolunteer(id="vol-001", society_id="soc-mumbai-01", name="Dr. Kavita Rao", phone="+919900110011", blood_group="O+", skill="MEDICAL", is_doctor=True),
        RWAVolunteer(id="vol-002", society_id="soc-mumbai-01", name="Ravi Kumar", phone="+919900110012", blood_group="A+", skill="FIRST_AID"),
        RWAVolunteer(id="vol-003", society_id="soc-mumbai-01", name="Deepak Patel", phone="+919900110013", blood_group="B+", skill="BOAT_OPERATOR"),
        RWAVolunteer(id="vol-004", society_id="soc-mumbai-02", name="Sunita Nair", phone="+919900110014", blood_group="AB+", skill="FIRST_AID", is_nurse=True),
        RWAVolunteer(id="vol-005", society_id="soc-mumbai-02", name="Ajay Verma", phone="+919900110015", blood_group="O-", skill="DRIVER"),
        RWAVolunteer(id="vol-006", society_id="soc-mumbai-03", name="Meera Shah", phone="+919900110016", blood_group="A-", skill="GENERAL"),
        RWAVolunteer(id="vol-007", society_id="soc-delhi-01", name="Dr. Arun Chopra", phone="+919900110017", blood_group="B-", skill="MEDICAL", is_doctor=True),
        RWAVolunteer(id="vol-008", society_id="soc-delhi-01", name="Priyanka Tiwari", phone="+919900110018", blood_group="O+", skill="FIRST_AID"),
        RWAVolunteer(id="vol-009", society_id="soc-delhi-02", name="Rohit Saxena", phone="+919900110019", blood_group="A+", skill="ELECTRICIAN"),
        RWAVolunteer(id="vol-010", society_id="soc-delhi-02", name="Neelam Kaur", phone="+919900110020", blood_group="B+", skill="GENERAL"),
        RWAVolunteer(id="vol-011", society_id="soc-assam-01", name="Jyoti Bora", phone="+919900110021", blood_group="O+", skill="BOAT_OPERATOR"),
        RWAVolunteer(id="vol-012", society_id="soc-assam-01", name="Nurse Anita Das", phone="+919900110022", blood_group="AB-", skill="FIRST_AID", is_nurse=True),
    ]
    db.add_all(volunteers)

    # Community Resources
    resources = [
        CommunityResource(id="res-001", society_id="soc-mumbai-01", type="FOOD", quantity=500, unit="packets"),
        CommunityResource(id="res-002", society_id="soc-mumbai-01", type="WATER", quantity=2000, unit="liters"),
        CommunityResource(id="res-003", society_id="soc-mumbai-01", type="FIRST_AID_KIT", quantity=10, unit="kits"),
        CommunityResource(id="res-004", society_id="soc-mumbai-02", type="FOOD", quantity=300, unit="packets"),
        CommunityResource(id="res-005", society_id="soc-mumbai-02", type="BLANKET", quantity=100, unit="pieces"),
        CommunityResource(id="res-006", society_id="soc-delhi-01", type="WATER", quantity=5000, unit="liters"),
        CommunityResource(id="res-007", society_id="soc-delhi-01", type="GENERATOR", quantity=1, unit="units"),
        CommunityResource(id="res-008", society_id="soc-delhi-02", type="FOOD", quantity=800, unit="packets"),
        CommunityResource(id="res-009", society_id="soc-assam-01", type="LIFE_JACKET", quantity=20, unit="pieces"),
        CommunityResource(id="res-010", society_id="soc-assam-01", type="BOAT", quantity=2, unit="boats"),
    ]
    db.add_all(resources)

    db.commit()
    print("Database seeding completed successfully (including RWA data)!")
