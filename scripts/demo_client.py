import os
import json
import sqlite3
import sys
import logging

# Ensure the parent directory is in sys.path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def main():
    logger.info("==================================================")
    logger.info("   AapdaSetu - End-to-End Backend Demo       ")
    logger.info("==================================================\n")
    
    # 1. Initialize DB
    logger.info("[1] Initializing SQLite database...")
    init_db()
    logger.info("    Database schemas verified.\n")
    
    # 2. Start Test Client
    client = TestClient(app)
    
    # 3. Simulate an Emergency Chat Request
    logger.info("[2] Simulating User Emergency Chat Request...")
    query = "There is a massive flood warning in Assam. Water levels are rising rapidly. What should I do?"
    logger.info(f"    User Query: '{query}'")
    
    payload = {
        "session_id": "demo-session-999",
        "message": query
    }
    
    response = client.post("/chat", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        logger.info("\n[3] AI Response Received!")
        logger.info("--------------------------------------------------")
        logger.info(f"{data.get('response')}")
        logger.info("--------------------------------------------------")
        logger.info(f"    Suggested Actions: {data.get('suggested_actions')}\n")
    else:
        logger.error(f"    Error {response.status_code}: {response.text}")
        return

    # 4. Verify Database Persistence
    logger.info("[4] Verifying SQLite Database Persistence...")
    db_path = os.path.join(os.path.dirname(__file__), '..', 'aapdasetu.db')
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT session_id, user_message, timestamp FROM chat_sessions WHERE session_id='demo-session-999' ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
        
        if row:
            logger.info("    [SUCCESS] Chat record found in 'chat_sessions' table!")
            logger.info(f"       Session ID : {row[0]}")
            logger.info(f"       Message    : {row[1]}")
            logger.info(f"       Timestamp  : {row[2]}")
        else:
            logger.error("    [ERROR] Chat record not found in the database.")
            
        conn.close()
    except Exception as e:
        logger.error(f"    Database verification failed: {e}")
    
    logger.info("\n==================================================")
    logger.info("   Demo Completed Successfully!                   ")
    logger.info("==================================================")

if __name__ == "__main__":
    main()
