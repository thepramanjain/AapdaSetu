"""
AapdaSetu - SQLite Database Connection Layer
=================================================
Configures SQLAlchemy engine, session bindings, and initialization hooks
to support automated local SQLite storage setup on application startup.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import settings, app_logger

# connect_args={"check_same_thread": False} is required for SQLite inside multithreaded environments (like FastAPI)
DATABASE_URL = settings.DATABASE_URL
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif "mysql" in DATABASE_URL:
    connect_args = {"ssl": {}}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Initializes and creates all database tables on application startup and seeds default data."""
    try:
        # Import models here to register tables on Base before metadata creation
        from backend.models import DisasterEvent, ChatSession, FundRequest, BlockchainTransaction, SystemLog
        from modules.rwa.rwa_models import Society, RWAVolunteer, CommunityResource, EvacuationRecord
        from modules.blockchain.blockchain_models import BlockchainDisasterRecord, ReliefShipment
        app_logger.info("Initializing database schema via SQLAlchemy metadata...")
        Base.metadata.create_all(bind=engine)
        app_logger.info("Database tables initialized successfully.")

        # Seed initial mock data
        from backend.seed import seed_database
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()

    except Exception as e:
        app_logger.error(f"Database initialization failed: {e}", exc_info=True)


def get_db():
    """Dependency injection yield mapping for database session lifetimes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
