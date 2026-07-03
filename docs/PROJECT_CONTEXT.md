# PROJECT_CONTEXT.md

> Permanent source of truth for ProductOps AI. Everything here is verified from code.
> Last updated: 2026-07-03 — v0.4.1 complete (LLM Gateway)

---

## Project Vision

Transform raw customer feedback into structured, prioritized engineering plans automatically using a multi-agent AI pipeline. Eliminate the manual triage work that sits between "customer complaint" and "engineering ticket."

---

## Business Problem

Product teams receive unstructured customer feedback at scale. Converting that feedback into actionable engineering work requires: reading and categorizing feedback, prioritizing by business impact, and creating engineering tasks with effort estimates. This pipeline is currently done manually and is slow, inconsistent, and bottlenecked by PMs.

---

## Target Users

- **Product Managers** — submit feedback and review prioritization
- **Engineering Leads** — consume engineering tasks and release notes
- **Kaggle / Demo audience** — project is built as a demonstrator of Google ADK capabilities

---

## Current Features

- Submit raw customer feedback text or upload a CSV/JSON file
- 3-agent AI pipeline (Analyze → Prioritize → Plan) runs automatically
- Each pipeline run is persisted to SQLite with full JSON outputs per stage
- LLM evaluation framework with 15 hand-crafted test cases (LLM-as-judge scoring)
- Long-term agent memory stored in SQLite (`agent_memory` table)
- MCP server exposing 5 structured feedback tools
- Next.js dashboard listing all runs with status badges and timing
- Pipeline detail view with 3 tabs: Analysis, Prioritization, Engineering Plan
- Evaluation dashboard with pass/fail scores per stage
- CLI smoke test (`scripts/test_pipeline.py`)

---

## Current Architecture

```
[Next.js Frontend :3000]
        │ HTTP (REST)
        ▼
[FastAPI Backend :8000]  ──── CORS allowed to :3000
        │
        ├── POST /pipeline  →  asyncio.create_task (fire-and-forget)
        │                         └── run_pipeline()
        │                               └── ADK SequentialAgent
        │                                     ├── feedback_analyzer  (LlmAgent)
        │                                     ├── business_prioritizer (LlmAgent)
        │                                     └── engineering_planner  (LlmAgent)
        │
        ├── POST /feedback/upload  →  MCP Client → MCP Server (same process)
        │
        ├── POST /evaluate  →  eval_runner  →  run_pipeline × N  →  LLM judges
        │
        └── SQLite (productops.db)
              ├── pipeline_runs
              ├── feedback_items
              ├── engineering_tasks
              ├── evaluation_runs
              └── agent_memory
```

**Session management:** `InMemorySessionService` (ADK). Sessions do NOT persist across backend restarts.  
**MCP transport:** In-process direct function calls for MVP (not stdio/HTTP transport).

---

## Current AI Workflow

1. User submits feedback text via dashboard or API
2. `run_pipeline()` creates an ADK session and triggers the `SequentialAgent`
3. **Stage 1 — Feedback Analyzer** (`LlmAgent`):
   - Calls `categorize_feedback`, `detect_sentiment`, `extract_entities` (FunctionTools)
   - Writes structured JSON to session state key `analysis_result`
4. **Stage 2 — Business Prioritizer** (`LlmAgent`):
   - Reads `analysis_result` from session state
   - Calls `calculate_rice_score`, `estimate_business_impact`, `rank_feedback_items`
   - Writes structured JSON to session state key `prioritization_result`
5. **Stage 3 — Engineering Planner** (`LlmAgent`):
   - Reads `prioritization_result` from session state
   - Calls `estimate_effort`, `generate_engineering_tasks`, `generate_release_notes`
   - Writes structured JSON to session state key `planning_result`
6. `_parse_state()` in `orchestrator.py` strips markdown fences and parses JSON from session state
7. Results are persisted to `pipeline_runs` table and to `agent_memory` (best-effort, non-blocking)

---

## Current Agents

| Agent | ADK Type | Tools (3 each) | Output Key |
|---|---|---|---|
| `feedback_analyzer` | `LlmAgent` | `categorize_feedback`, `detect_sentiment`, `extract_entities` | `analysis_result` |
| `business_prioritizer` | `LlmAgent` | `calculate_rice_score`, `estimate_business_impact`, `rank_feedback_items` | `prioritization_result` |
| `engineering_planner` | `LlmAgent` | `estimate_effort`, `generate_engineering_tasks`, `generate_release_notes` | `planning_result` |
| `productops_orchestrator` | `SequentialAgent` | — (chains the 3 above in sequence) | — |

All agents use `gemini-2.0-flash` (configurable via `agent_model` in `config.py`).  
All agents are instantiated as **module-level constants** at import time.  
All agents use `generate_content_config=GenerateContentConfig(response_mime_type="application/json")` — Gemini emits raw JSON, no markdown fences.

---

## Current Tech Stack

| Layer | Technology | Pinned Version |
|---|---|---|
| Agent Framework | Google ADK | ≥1.0.0 |
| LLM | Gemini 2.0 Flash | via `google-genai` ≥1.0.0 |
| MCP Server | FastMCP (`mcp[cli]`) | ≥1.3.0 |
| Backend API | FastAPI | ≥0.115.0 |
| ASGI Server | Uvicorn | ≥0.32.0 |
| ORM | SQLAlchemy (async) | ≥2.0.0 |
| Database | SQLite via `aiosqlite` | ≥0.20.0 |
| Validation | Pydantic + pydantic-settings | ≥2.9.0 |
| Frontend | Next.js 15 + React 19 + TypeScript 5 | 15.1.0 |
| CSS | Tailwind CSS | ^3.4.1 |
| Python | 3.11+ | required |
| Node.js | 20+ | required |
| Build system | Hatchling | (pyproject.toml) |

---

## Folder Structure

```
productops-ai/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py          # SequentialAgent + run_pipeline()
│   │   ├── feedback_analyzer.py     # Stage 1 LlmAgent
│   │   ├── business_prioritizer.py  # Stage 2 LlmAgent
│   │   ├── engineering_planner.py   # Stage 3 LlmAgent
│   │   └── tools/
│   │       ├── analysis_tools.py    # categorize_feedback, detect_sentiment, extract_entities
│   │       ├── priority_tools.py    # calculate_rice_score, estimate_business_impact, rank_feedback_items
│   │       └── planner_tools.py     # estimate_effort, generate_engineering_tasks, generate_release_notes
│   ├── mcp/
│   │   ├── server.py                # FastMCP server — 5 tools, in-memory store
│   │   └── client.py                # In-process MCP client wrapper (singleton)
│   ├── evaluation/
│   │   ├── test_data.py             # 15 TestCase objects
│   │   ├── judges.py                # judge_analysis, judge_prioritization, judge_planning
│   │   └── eval_runner.py           # run_evaluation(), run_single_test()
│   ├── memory/
│   │   └── memory_service.py        # MemoryService singleton (SQLite-backed)
│   ├── utils/                       # [v0.2] Production utilities
│   │   ├── retry.py                 # async_retry: exponential backoff decorator
│   │   └── output_schemas.py        # Pydantic v2 schemas for all 3 agent outputs
│   ├── gateway/                     # [v0.4.1] LLM Gateway
│   │   ├── llm_gateway.py           # LLMGateway singleton: round-robin pool, metrics
│   │   └── providers/
│   │       ├── base.py              # LLMProvider ABC + ProviderMetrics + ProviderResponse
│   │       └── gemini.py            # GeminiProvider: circuit breaker + model fallback
│   ├── api/
│   │   ├── routes.py                # All FastAPI route handlers
│   │   └── schemas.py               # Pydantic request/response models
│   ├── config.py                    # Settings (pydantic-settings, reads .env)
│   ├── database.py                  # SQLAlchemy models + init_db()
│   └── main.py                      # FastAPI app factory + CORS + lifespan
├── frontend/
│   └── app/
│       ├── page.tsx                 # Dashboard: run list + feedback submit form
│       ├── pipeline/[id]/page.tsx   # Pipeline detail — 3 tabs
│       ├── evaluate/page.tsx        # Evaluation dashboard
│       ├── layout.tsx               # Root layout
│       └── globals.css              # Tailwind base + all custom utility classes
├── data/
│   └── sample_feedback.csv          # Demo CSV for upload
├── skills/
│   ├── feedback-analyzer/SKILL.md
│   ├── business-prioritizer/SKILL.md
│   └── engineering-planner/SKILL.md
├── scripts/
│   └── test_pipeline.py             # CLI smoke test (Phase 1 label)
├── docs/
│   └── PROJECT_CONTEXT.md           # This file
├── pyproject.toml                   # Python deps + build config
├── .env.example                     # Required env vars template
└── start.ps1                        # Windows startup script
```

---

## Important Components

| File | Role |
|---|---|
| `backend/agents/orchestrator.py` | Core pipeline entry point — `run_pipeline()` called by every trigger |
| `backend/database.py` | All 5 ORM models; `init_db()` called at startup via lifespan |
| `backend/api/routes.py` | All HTTP endpoints; background pipeline runs via `asyncio.create_task` |
| `backend/config.py` | Single source for all env vars; `get_settings()` is `lru_cache`'d |
| `backend/mcp/server.py` | MCP tool definitions; `_feedback_store` is a module-level in-memory list |
| `backend/evaluation/judges.py` | Three LLM judge rubrics; scores 1–5; `gemini-2.0-flash` for judging |
| `frontend/app/page.tsx` | Main dashboard — polling loop, run list, feedback submission |
| `frontend/app/globals.css` | All shared Tailwind utility classes (badges, animations, etc.) |

---

## API Overview

All routes prefixed `/api/v1`. Backend runs on port `8000` by default.

| Method | Path | Description |
|---|---|---|
| GET | `/` | Root info: name, version, docs link, health link |
| GET | `/api/v1/health` | Health check — returns status + agents list |
| POST | `/api/v1/pipeline` | Start pipeline run (202 Accepted, fire-and-forget) |
| GET | `/api/v1/pipeline` | List recent runs (query param `limit`, default 20) |
| GET | `/api/v1/pipeline/{run_id}` | Fetch full pipeline result (analysis + prioritization + planning) |
| POST | `/api/v1/feedback/upload` | Upload CSV/JSON feedback file; triggers pipeline |
| POST | `/api/v1/evaluate` | Run evaluation framework (LLM-as-judge) against 15 test cases |
| GET | `/api/v1/evaluate` | List past evaluation runs |
| GET | `/api/v1/memory/recent` | Fetch recent agent memory entries from SQLite |
| GET | `/api/v1/mcp/stats` | Get MCP feedback store stats |
| GET | `/api/v1/pipeline/{run_id}/items` | **[v0.3]** Persisted feedback items for a run |
| GET | `/api/v1/pipeline/{run_id}/tasks` | **[v0.3]** Persisted engineering tasks for a run |
| GET | `/api/v1/analytics/summary`       | **[v0.3]** Aggregate stats: run counts, avg duration, top categories |
| GET | `/api/v1/gateway/stats`           | **[v0.4.1]** LLM Gateway: per-key request metrics, circuit-breaker status |

API docs auto-generated at `http://localhost:8000/docs`.

---

## Database Overview

Single SQLite file: `productops.db` (path from `DATABASE_URL` env var, default `sqlite+aiosqlite:///./productops.db`).

| Table | Purpose | Key Columns |
|---|---|---|
| `pipeline_runs` | One row per pipeline execution | `id`, `status`, `raw_input`, `analysis_output` (JSON Text), `prioritization_output` (JSON Text), `planning_output` (JSON Text), `duration_ms`, `error_message` |
| `feedback_items` | Individual feedback item details | `pipeline_run_id`, `category`, `sentiment`, `sentiment_score`, `severity`, `rice_score`, `priority_rank` |
| `engineering_tasks` | Tasks generated by Engineering Planner | `pipeline_run_id`, `title`, `description`, `technical_approach`, `effort_estimate`, `acceptance_criteria` |
| `evaluation_runs` | Evaluation run summaries | `test_cases_total`, `test_cases_passed`, `analysis_score`, `prioritization_score`, `planning_score`, `overall_score`, `details` (JSON) |
| `agent_memory` | Cross-run long-term memory | `agent_name`, `memory_type`, `content` (JSON), `relevance_score`, `created_at`, `accessed_at` |

No migrations framework (no Alembic). Schema is created via `Base.metadata.create_all` at startup.

---

## Current Limitations

1. **In-memory MCP store** — `_feedback_store` in `mcp/server.py` is a module-level list; resets on every backend restart.
2. **In-memory ADK sessions** — `InMemorySessionService`; sessions don't survive restarts.
3. **MCP not using real transport** — `mcp_client.py` calls server functions directly in-process; defeats the protocol boundary for testing.
4. ~~**`feedback_items` and `engineering_tasks` tables are unpopulated**~~ — **RESOLVED in v0.3**: both tables are now populated by `_persist_structured_outputs()` after every successful run.
5. **No authentication or authorization** on any endpoint.
6. **Evaluation is blocking** — `POST /evaluate` holds the HTTP connection open for the full run duration.
7. **Single feedback block per run** — pipeline processes one combined text input, not individual items separately.
8. **No streaming** — frontend polls `GET /pipeline/{id}` for completion; no SSE or WebSocket.
9. **JSON mode + function tools** — `response_mime_type="application/json"` with `FunctionTool` is supported in Gemini 2.0 Flash but is not guaranteed for older model versions.
10. **No Alembic** — schema changes require manual DB deletion and recreation.

---

## Future Roadmap

UNKNOWN - NEEDS VERIFICATION (no roadmap file exists; items below are inferred from README decisions and code comments)

- Switch MCP client to proper stdio/HTTP transport
- Populate `feedback_items` and `engineering_tasks` tables via API
- Add streaming pipeline responses (SSE)
- Add authentication layer
- Run evaluation asynchronously with polling
- Batch process multiple feedback items individually per run
- Support Slack, email data sources via additional MCP tools

---

## Coding Standards

Verified from code:

- **Python 3.11+** syntax — `str | None` union types, `Mapped[T]` ORM columns
- **Async-first** — all DB calls, agent invocations, and route handlers are `async def`
- **Pydantic v2** — request/response schemas use `BaseModel`; settings via `pydantic-settings`
- **SQLAlchemy 2.x declarative** — `DeclarativeBase`, `mapped_column`, `Mapped[T]`
- **Singleton pattern** — `mcp_client`, `memory_service`, `get_settings()` are module-level singletons
- **Agents as module-level constants** — instantiated once at import time, not per-request
- **Tool functions are pure Python** — no ADK imports inside `tools/` files; wrapped in `FunctionTool()` by agents
- **Strict JSON output** — every agent instruction explicitly states "Output ONLY the JSON"
- **`_parse_state()` handles LLM formatting drift** — strips markdown fences before JSON parsing
- **No test suite** — `pytest` is a dev dependency but no test files exist; evaluation framework is the quality gate

---

## Files That Should Rarely Be Modified

| File | Reason |
|---|---|
| `backend/database.py` | Schema changes require full DB recreation (no migration tooling) |
| `backend/config.py` | Env var contract shared across all modules via `get_settings()` |
| `backend/main.py` | App factory — CORS, lifespan, router registration affect all consumers |
| `backend/agents/orchestrator.py` | Core pipeline contract — changes ripple to all 3 agents and all callers |
| `frontend/app/globals.css` | Shared utility classes used across all frontend pages |
| `pyproject.toml` | Dependency pinning — changes affect all installs |

---

## Development Workflow

```bash
# 1. Environment setup
cp .env.example .env
# Set: GOOGLE_API_KEY=<your_gemini_key>

# 2. Install backend dependencies
pip install google-adk google-genai fastapi "uvicorn[standard]" pydantic pydantic-settings \
    sqlalchemy aiosqlite python-multipart "mcp[cli]" httpx python-dotenv

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Start backend (port 8000)
uvicorn backend.main:app --reload --port 8000

# 5. Start frontend (port 3000, new terminal)
cd frontend && npm run dev

# 6. CLI smoke test (no server needed)
python -m scripts.test_pipeline

# 7. Run evaluation via API (server must be running)
curl -X POST http://localhost:8000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"test_subset": ["tc_01", "tc_02", "tc_03"]}'

# 8. Inspect MCP server standalone
npx @modelcontextprotocol/inspector python -m backend.mcp.server
```

---

## Important Decisions

| Decision | Rationale |
|---|---|
| 3 agents, not 4 | Release notes is a tool, not an agent — insufficient autonomy to justify agent overhead |
| SQLite, not Postgres | Eliminates infra dependency; sufficient for Kaggle/demo |
| `gemini-2.0-flash` for agents | 10× cheaper than Pro; fast enough for demo |
| Fixed sequential pipeline | Predictability over dynamic routing; dynamic routing adds coordination overhead |
| MCP for ingestion | Standardized protocol enables future data sources without agent code changes |
| In-process MCP client | MVP shortcut — real transport can be swapped in `mcp_client.py` later |
| `output_key` / session state for inter-agent data | ADK session state is the inter-agent contract; no custom message passing |
| `InMemorySessionService` | Simplest ADK option; acceptable for demo; swap to persistent service for production |

---

## Current Phase

**Phase 1 — Complete (MVP / Demo-ready)**

Verified from `scripts/test_pipeline.py` header comment: "Phase 1 smoke test." All core systems are implemented: `SequentialAgent` pipeline, FastAPI backend, Next.js frontend, MCP server (5 tools), evaluation framework (15 test cases, LLM-as-judge), and SQLite-backed agent memory.

**Phase 2 — Not started** (scope UNKNOWN - NEEDS VERIFICATION)
