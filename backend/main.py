"""
FastAPI application entry point.

Start with:  uvicorn backend.main:app --reload --port 8000
API docs at: http://localhost:8000/docs
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.database import init_db
from backend.api.routes import router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Database initialized")
    print(f"✅ ProductOps AI backend running on port {settings.backend_port}")
    print(f"📚 API docs: http://localhost:{settings.backend_port}/docs")
    yield
    print("👋 Shutting down ProductOps AI")


app = FastAPI(
    title="ProductOps AI",
    description=(
        "AI-powered product operations pipeline using Google ADK. "
        "Analyzes customer feedback → Prioritizes by business impact → "
        "Generates engineering plans."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "ProductOps AI",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
