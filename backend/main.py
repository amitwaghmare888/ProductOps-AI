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
from backend.gateway import init_gateway

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Database initialized")

    # Initialize the LLM Gateway with configured API keys
    init_gateway(settings.gateway_api_keys_list)
    key_count = len(settings.gateway_api_keys_list)
    print(f"✅ LLM Gateway initialized ({key_count} Gemini key(s) in pool)")

    print(f"✅ ProductOps AI backend running on port {settings.backend_port}")
    print(f"📚 API docs: http://localhost:{settings.backend_port}/docs")
    print(f"📊 Gateway stats: http://localhost:{settings.backend_port}/api/v1/gateway/stats")
    yield
    print("👋 Shutting down ProductOps AI")


app = FastAPI(
    title="ProductOps AI",
    description=(
        "AI-powered product operations pipeline using Google ADK + LangGraph. "
        "Analyzes customer feedback → Prioritizes by business impact → "
        "Generates engineering plans. Features: LLM Gateway (key pooling, "
        "circuit breaker, model fallback), structured outputs, persistent storage."
    ),
    version="0.4.1",
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
        "version": "0.4.1",
        "docs": "/docs",
        "health": "/api/v1/health",
        "gateway_stats": "/api/v1/gateway/stats",
    }
