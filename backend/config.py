"""
AapdaSetu - Central Configuration & Logging
===========================================
This module defines settings using Pydantic Settings and configures central
rotating logging. All parameters are parsed from environment variables or .env.
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from typing import Any
from pydantic import Field

from pydantic_settings import BaseSettings, SettingsConfigDict

# Base Directory of the P-4 application
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings(BaseSettings):
    """
    Core settings for AapdaSetu application.
    """
    ENV: str = Field(default="dev", description="Runtime environment (dev, prod, test)")
    LOG_LEVEL: str = Field(default="INFO", description="Console/file logging level (DEBUG, INFO, WARNING, ERROR)")
    HOST: str = Field(default="127.0.0.1", description="FastAPI host binding address")
    PORT: int = Field(default=8000, description="FastAPI port binding number")
    
    # Gemini API Credentials (Primary)
    GEMINI_API_KEY: str = Field(default="mock_api_key_value_for_testing", description="API Key for Google Gemini")
    GEMINI_MODEL: str = Field(default="gemini-3.6-flash", description="Default Gemini model name")
    
    # OpenRouter API Credentials (Fallback)
    OPENROUTER_API_KEY: str = Field(default="", description="API Key for OpenRouter fallback LLM")
    OPENROUTER_MODEL: str = Field(default="meta-llama/llama-3.3-70b-instruct:free", description="Default OpenRouter model name")
    
    # Paths config
    DATA_DIR: str = Field(default=os.path.join(BASE_DIR, "data"), description="Central data directory")
    
    # Vector DB, Cache and RAG docs
    VECTOR_DB_PATH: str = Field(default=os.path.join(BASE_DIR, "data", "vector_db"), description="RAG Vector database index path")
    CACHE_DIR: str = Field(default=os.path.join(BASE_DIR, "data", "cache"), description="Cache folder for APIs")
    RAG_DOCS_DIR: str = Field(default=os.path.join(BASE_DIR, "data", "rag_docs"), description="Path to RAG docs directory")

    # Database layer
    DATABASE_URL: str = Field(default="sqlite:///./aapdasetu.db", description="Database URL (SQLite for hackathon)")

    # Blockchain / Web3 layer
    WEB3_PROVIDER_URI: str = Field(default="", description="HTTP RPC endpoint for the target chain (e.g. Alchemy Sepolia URL)")
    BACKEND_WALLET_PRIVATE_KEY: str = Field(default="", description="Private key of the backend submitter wallet (never logged)")
    AAPDA_SETU_CONTRACT_ADDRESS: str = Field(default="", description="Deployed AapdaSetu contract address")
    BLOCK_EXPLORER_TX_URL: str = Field(default="https://sepolia.etherscan.io/tx/", description="Base explorer URL for transaction links")

    # LLM parameters
    PRIMARY_LLM: str = "gemini-3.6-flash"
    EMBEDDING_PROVIDER: str = Field(default="gemini", description="Embedding provider (gemini, huggingface)")
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"  # Google Gemini Embedding model
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
settings = Settings()

# Central Logging Configuration
LOGS_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

APP_LOG_PATH = os.path.join(LOGS_DIR, "app.log")
ERROR_LOG_PATH = os.path.join(LOGS_DIR, "error.log")

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s:%(filename)s:%(lineno)d] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logger(name: str = "aapdasetu") -> logging.Logger:
    """Configures centralized RotatingFileHandler and StreamHandler logging."""
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(level)
    logger.propagate = False

    # Console output
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    logger.addHandler(console_handler)

    # General app log file (rotating at 5MB)
    app_handler = RotatingFileHandler(APP_LOG_PATH, maxBytes=5*1024*1024, backupCount=5, encoding="utf-8")
    app_handler.setLevel(level)
    app_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    logger.addHandler(app_handler)

    # Error-only log file (rotating at 5MB)
    error_handler = RotatingFileHandler(ERROR_LOG_PATH, maxBytes=5*1024*1024, backupCount=5, encoding="utf-8")
    error_handler.setLevel(logging.WARNING)
    error_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    logger.addHandler(error_handler)

    return logger

# Global logger instance
app_logger = setup_logger("aapdasetu")
