# ProductOps AI

> AI-powered product operations pipeline built with Google ADK, Gemini 2.0 Flash, and MCP.

## What It Does

ProductOps AI transforms raw customer feedback into structured engineering plans through a 3-agent AI pipeline:

```
Customer Feedback
      │
      ▼  (ingested via MCP Feedback Server)
ProductOps Orchestrator  ←  ADK SequentialAgent
      │
      ├─► Feedback Analyzer     →  category, sentiment, entities, severity
      │         │ session state: analysis_result
      ├─► Business Prioritizer  →  RICE scores, urgency, business impact
      │         │ session state: prioritization_result
      └─► Engineering Planner   →  tasks, effort estimates, release notes
                │
                ▼
         SQLite (pipeline runs + long-term agent memory)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent Framework | [Google ADK](https://google.github.io/adk-docs/) |
| LLM | Gemini 2.0 Flash |
| MCP Server | FastMCP (Python) — 5 tools |
| Backend API | FastAPI + SQLAlchemy async |
| Database | SQLite |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Evaluation | LLM-as-judge + 15 hand-crafted test cases |

## ADK Features Demonstrated

| Feature | Where Used |
|---------|-----------|
| `SequentialAgent` | Orchestrator chains 3 sub-agents |
| `LlmAgent` | Feedback Analyzer, Business Prioritizer, Engineering Planner |
| `FunctionTool` | 9 tools across 3 agents |
| Session State | `output_key`/`input_key` for inter-agent data flow |
| `InMemorySessionService` | Session lifecycle management |
| Memory Service | SQLite-backed long-term storage |

## MCP Server

`productops-feedback-server` exposes 5 tools:
- `ingest_csv_feedback` — Parse CSV feedback files
- `ingest_json_feedback` — Parse JSON feedback arrays
- `search_feedback` — Keyword search across ingested feedback
- `get_feedback_stats` — Aggregate statistics
- `store_analysis_result` — Persist analysis results

Test with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector python -m backend.mcp.server
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone and set up environment
```bash
git clone https://github.com/yourusername/productops-ai
cd productops-ai
cp .env.example .env
# Edit .env and set: GOOGLE_API_KEY=your_key_here
```

### 2. Install backend dependencies
```bash
pip install google-adk google-genai fastapi "uvicorn[standard]" pydantic pydantic-settings sqlalchemy aiosqlite python-multipart "mcp[cli]" httpx python-dotenv
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Start backend
```bash
uvicorn backend.main:app --reload --port 8000
```

### 5. Start frontend (new terminal)
```bash
cd frontend
npm run dev
```

### 6. Open the app
- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Running the Pipeline (CLI test)
```bash
python scripts/test_pipeline.py
```

## Running Evaluation
```bash
# Via API
curl -X POST http://localhost:8000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"test_subset": ["tc_01", "tc_02", "tc_03"]}'

# Full evaluation (15 tests, ~5 minutes)
curl -X POST http://localhost:8000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"test_subset": null}'
```

## Project Structure

```
productops-ai/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py          # ADK SequentialAgent
│   │   ├── feedback_analyzer.py     # ADK LlmAgent + 3 FunctionTools
│   │   ├── business_prioritizer.py  # ADK LlmAgent + 3 FunctionTools
│   │   ├── engineering_planner.py   # ADK LlmAgent + 3 FunctionTools
│   │   └── tools/                   # 9 pure-Python tool functions
│   ├── mcp/
│   │   ├── server.py                # FastMCP server (5 tools)
│   │   └── client.py                # MCP client wrapper
│   ├── evaluation/
│   │   ├── test_data.py             # 15 hand-crafted test cases
│   │   ├── judges.py                # LLM-as-judge (3 rubrics)
│   │   └── eval_runner.py           # Evaluation harness
│   ├── memory/
│   │   └── memory_service.py        # SQLite long-term memory
│   ├── api/
│   │   ├── routes.py                # All FastAPI endpoints
│   │   └── schemas.py               # Pydantic models
│   ├── config.py
│   ├── database.py
│   └── main.py
├── frontend/
│   └── app/
│       ├── page.tsx                 # Dashboard
│       ├── pipeline/[id]/page.tsx   # Pipeline detail (3 tabs)
│       └── evaluate/page.tsx        # Evaluation dashboard
├── data/
│   └── sample_feedback.csv
└── skills/
    ├── feedback-analyzer/SKILL.md
    ├── business-prioritizer/SKILL.md
    └── engineering-planner/SKILL.md
```

## Evaluation Methodology

**LLM-as-judge** with structured rubrics (score 1–5):

| Stage | What's Judged | Metrics |
|-------|--------------|---------|
| Analysis | Category, sentiment, severity, summary quality | Accuracy vs. expected |
| Prioritization | RICE reasonableness, urgency, business justification | Alignment with expected urgency |
| Planning | Task completeness, technical feasibility, effort accuracy | Criteria quality |

Pass threshold: overall score ≥ 3.0/5.0

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| 3 agents not 4 | Release notes is a tool, not a separate agent — insufficient autonomy to justify agent overhead |
| SQLite not Postgres | Eliminates infra dependency, sufficient for Kaggle demo |
| Gemini Flash not Pro | 10× cheaper, fast enough for demo; Pro reserved for judge evaluation |
| Fixed pipeline not dynamic | Production systems need predictability; dynamic routing adds coordination overhead |
| MCP for ingestion | Standardized protocol enables any future data source (Slack, email) without agent code changes |
