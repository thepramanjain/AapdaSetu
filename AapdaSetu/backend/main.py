"""
AapdaSetu - FastAPI Application Entrypoint
==========================================
Configures FastAPI app settings, CORS policies, standard exception handlers,
and mounts router endpoints. Integrates lifespan events to initialize logging
and cache RAG vector embeddings on boot.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from backend.config import settings, app_logger
from backend.routes import router as api_router
from backend.blockchain_routes import router as blockchain_router
from backend.pipeline_stream import router as stream_router
from backend.database import init_db
from tools.rag_tool import _load_rag_resources

# Phase 0 — New module routers
from modules.rwa.rwa_routes import router as rwa_router
from modules.blockchain.blockchain_routes import router as blockchain_transparency_router
from modules.heatwave.heatwave_routes import router as heatwave_router
from services.event_bus import event_bus


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler running on server boot and shutdown."""
    app_logger.info("==================================================")
    app_logger.info(f"AapdaSetu starting up in '{settings.ENV}' mode.")
    app_logger.info("==================================================")
    
    # 1. Initialize SQLite Database Schema
    init_db()

    # 2. Pre-cache Sentence Transformer models and vector index on boot
    app_logger.info("Warm-up: Loading RAG vector indices and models...")
    _load_rag_resources()

    # 3. Initialize Event Bus (Phase 0)
    app_logger.info("Event Bus: Initialised with %d registered events.", len(event_bus.list_subscriptions()))
    
    yield
    
    # Cleanup event bus on shutdown
    event_bus.clear()
    app_logger.info("AapdaSetu server shutting down.")


# Instantiate FastAPI
app = FastAPI(
    title="AapdaSetu API",
    description="Autonomous Multi-Agent AI Disaster Management System Backend (Flood & Earthquake Scope)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration (allows frontend to plug in later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # open for hackathon dev ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for clean API interface
@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """Intercepts and structures Pydantic validation errors."""
    app_logger.warning(f"Request validation failure on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Intercepts unexpected crashes and returns a standardized error envelope."""
    app_logger.error(f"Unhandled exception occurred on request {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred in the disaster response pipeline."
        }
    )


# Mount routers
app.include_router(api_router)
app.include_router(blockchain_router)
app.include_router(stream_router)

# Phase 0 — Mount new module routers
app.include_router(rwa_router)
app.include_router(blockchain_transparency_router)
app.include_router(heatwave_router)

# Serve frontend build if present (e.g., single-container/Hugging Face Space deployments)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app_logger.info(f"Frontend: Found built assets at {frontend_dist}. Mounting frontend static handlers.")
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend-static")
    
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Ignore requests targetting API endpoints or Swagger docs
        if catchall.startswith("api/") or catchall.startswith("docs") or catchall.startswith("redoc") or catchall.startswith("blockchain"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        return FileResponse(os.path.join(frontend_dist, "index.html"))

# Log startup bindings
app_logger.info(f"FastAPI router registration complete. Docs binding: http://{settings.HOST}:{settings.PORT}/docs")
