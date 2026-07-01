# ProductOps AI — PROJECT_CONTEXT.md

> **Single source of truth for the ProductOps AI codebase.**
> Written after reading every file, folder, function, and configuration.
> Intended for an engineer picking up this project with no prior context.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete Architecture](#2-complete-architecture)
3. [Folder Structure](#3-folder-structure)
4. [AI System](#4-ai-system)
5. [APIs](#5-apis)
6. [Frontend](#6-frontend)
7. [Data Flow](#7-data-flow)
8. [Important Design Decisions](#8-important-design-decisions)
9. [Current Features](#9-current-features)
10. [Missing Features and Technical Debt](#10-missing-features-and-technical-debt)
11. [Dependencies](#11-dependencies)
12. [Potential Bugs and Risks](#12-potential-bugs-and-risks)
13. [Future Improvements](#13-future-improvements)
14. [Development Notes](#14-development-notes)

---

## 1. Executive Summary

### Project Purpose

**ProductOps AI** is a fully automated AI pipeline that transforms raw customer feedback into structured, prioritised engineering work items. It removes the manual PM labour of triage, RICE scoring, and sprint planning by running the entire process through a 3-agent LLM pipeline.

### Problem Being Solved

Product teams receive hundreds of pieces of customer feedback per week across many channels (app stores, support tickets, surveys, Slack). Manually reading, categorising, scoring, and converting that feedback into actionable engineering tasks is slow, inconsistent, and depends on senior PM availability. ProductOps AI automates every step of this triage-to-planning workflow.

### Target Users

- **Product Managers** who want instant, structured triage of customer feedback
- **Engineering Managers / Tech Leads** who need ready-to-copy tickets with effort estimates
- **DevOps / Platform teams** who want to demonstrate Google ADK and MCP capabilities
- **Hackathon judges** evaluating multi-agent AI system design

### Current Implementation Status

| Layer | Status |
|-------|--------|
| Backend (FastAPI + ADK pipeline) | Complete and functional |
| 3 LLM Agents (ADK) | Complete |
| 9 FunctionTools | Complete |
| MCP Server (5 tools) | Complete |
| MCP Client wrapper | Complete (direct-call MVP mode) |
| SQLite DB + 5 tables | Complete |
| Long-term memory service | Complete |
| Evaluation framework (LLM-as-judge) | Complete |
| Frontend Dashboard | Complete |
| Frontend Pipeline Detail view | Complete |
| Frontend Evaluation view | Complete |
| Skills documentation (3 SKILL.md files) | Complete |
| Windows startup script | Complete |
| Sample data + CLI test script | Complete |
| Production deployment config | NOT present |
| Authentication / auth layer | NOT present |
| Real-time WebSocket updates | NOT present (polling only) |
| MCP stdio transport (production) | Direct-call only (MVP shortcut) |

---

## 2. Complete Architecture

### High-Level Architecture

```
Browser (Next.js 15)
  Dashboard | Pipeline Detail | Evaluation
        |
        | HTTP REST -- NEXT_PUBLIC_API_URL = localhost:8000/api/v1
        v
FastAPI Backend (port 8000)
  /api/v1/pipeline  /feedback/upload  /evaluate
  /health  /memory/recent  /mcp/stats
        |
        +-- ADK SequentialAgent (orchestrator)
        |     +-- LlmAgent: feedback_analyzer
        |     |     tools: categorize_feedback, detect_sentiment, extract_entities
        |     |     output_key: "analysis_result"
        |     +-- LlmAgent: business_prioritizer
        |     |     tools: calculate_rice_score, estimate_business_impact, rank_feedback_items
        |     |     output_key: "prioritization_result"
        |     +-- LlmAgent: engineering_planner
        |           tools: estimate_effort, generate_engineering_tasks, generate_release_notes
        |           output_key: "planning_result"
        |
        +-- MCP Client --> MCP Server (FastMCP, in-process)
        |     tools: ingest_csv, ingest_json, search, stats, store_analysis
        |
        +-- MemoryService --> SQLite (agent_memory table)
        |
        +-- SQLite (productops.db)
              pipeline_runs, feedback_items, engineering_tasks,
              evaluation_runs, agent_memory
```

### End-to-End Request Flow (Manual Text Submission)

```
1.  User types feedback in browser textarea
2.  POST /api/v1/pipeline  { feedback_text, source }
3.  FastAPI creates PipelineRun row (status=running), returns run_id (HTTP 202)
4.  asyncio.create_task() fires _run_pipeline_bg() -- non-blocking
5.  ADK Runner.run_async() starts the SequentialAgent
6.  feedback_analyzer runs:
      a. categorize_feedback(text) -> category + confidence
      b. detect_sentiment(text) -> sentiment + score
      c. extract_entities(text) -> entities + platforms + severity
      d. LLM synthesizes JSON -> session state["analysis_result"]
7.  business_prioritizer runs (reads analysis_result):
      a. calculate_rice_score(...)
      b. estimate_business_impact(...)
      c. rank_feedback_items(...)
      d. LLM synthesizes JSON -> session state["prioritization_result"]
8.  engineering_planner runs (reads prioritization_result):
      a. estimate_effort(...)
      b. generate_engineering_tasks(...)
      c. generate_release_notes(...)
      d. LLM synthesizes JSON -> session state["planning_result"]
9.  orchestrator reads final session state, returns dict
10. memory_service.store_pipeline_result() saves to agent_memory table
11. DB row updated: status=completed, all 3 outputs, duration_ms
12. Frontend polls GET /api/v1/pipeline/{run_id} every 3-4 seconds
13. On status=completed, 3-tab UI renders structured results
```

### Agent Workflow (ADK SequentialAgent)

```
ADK InMemorySessionService
  session (session_id = run_id)
    state: {}

Step 1 -- feedback_analyzer:
  state["analysis_result"] = <JSON string>

Step 2 -- business_prioritizer:
  reads: state["analysis_result"]  (injected via ADK session context)
  state["prioritization_result"] = <JSON string>

Step 3 -- engineering_planner:
  reads: state["prioritization_result"] (injected via ADK session context)
  state["planning_result"] = <JSON string>
```

Each agent uses ADK `output_key` to write its final LLM response into session state.
The next agent receives that value injected into its prompt context by ADK at runtime.

### Backend Architecture

- **Framework**: FastAPI with `asynccontextmanager` lifespan for DB init
- **Async**: All I/O is async/await. Pipeline runs fire-and-forget with `asyncio.create_task()`
- **DB access**: SQLAlchemy async with `aiosqlite` driver
- **Config**: `pydantic-settings` reads `.env`, cached with `@lru_cache`
- **CORS**: Configured for `http://localhost:3000` (comma-separated list supported)
- **Session management**: ADK `InMemorySessionService` — one session per run, keyed by `run_id`

### Frontend Architecture

- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript (strict mode off)
- **Styling**: Tailwind CSS v3 + custom design system in `globals.css`
- **Fonts**: Inter (UI) + JetBrains Mono (IDs/code) from Google Fonts
- **Routing**: File-system routing via `app/` directory
- **API calls**: Direct fetch to `NEXT_PUBLIC_API_URL` (backend). Next.js proxy routes exist but are bypassed — the browser calls the backend directly.
- **State**: Local `useState`/`useEffect` — no global state manager
- **Polling**: `setInterval` every 3–4 seconds to refresh running pipeline status

### Database

SQLite file `productops.db` created at startup by `init_db()`.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `pipeline_runs` | One row per execution | id, status, raw_input, analysis_output, prioritization_output, planning_output, duration_ms, error_message |
| `feedback_items` | Per-item analysis **(UNUSED)** | id, pipeline_run_id, raw_text, category, sentiment, rice_score |
| `engineering_tasks` | Generated tasks **(UNUSED)** | id, pipeline_run_id, title, description, technical_approach, effort_estimate, priority |
| `evaluation_runs` | Eval results | id, analysis_score, prioritization_score, planning_score, overall_score, details (JSON) |
| `agent_memory` | Long-term memory | id, agent_name, memory_type, content (JSON), relevance_score, created_at |

> **Critical:** `feedback_items` and `engineering_tasks` are defined and migrated at startup but **never written to** by any current code path. Dead schema.

### Memory

| Layer | Scope | Storage | Implementation |
|-------|-------|---------|---------------|
| **Session state** | Within one pipeline run | In-memory (InMemorySessionService) | ADK built-in; holds the 3 stage outputs |
| **Long-term memory** | Across runs | SQLite agent_memory table | MemoryService; stores completed pipeline outputs |

Long-term memory is stored after the pipeline completes (best-effort, exceptions silently swallowed). Readable via `GET /api/v1/memory/recent` but **not fed back** into agent prompts.

### MCP Integration

FastMCP server (`backend/mcp/server.py`) with 5 tools:

| Tool | Purpose |
|------|---------|
| `ingest_csv_feedback` | Parse CSV into structured feedback items |
| `ingest_json_feedback` | Parse JSON array/object into feedback items |
| `search_feedback` | Keyword search across in-memory ingested feedback |
| `get_feedback_stats` | Aggregate stats (total, by source, date range) |
| `store_analysis_result` | Attach analysis output to a feedback item |

**Important:** The MCP client calls server functions as **direct Python function calls** (same process) — MVP shortcut, not true inter-process MCP. The `_feedback_store` is a module-level list — wiped on restart, not persisted to SQLite.

```bash
# Test MCP server externally
npx @modelcontextprotocol/inspector python -m backend.mcp.server
```

### ADK Integration

| ADK Class | File | Purpose |
|-----------|------|---------|
| `SequentialAgent` | orchestrator.py | Chains 3 sub-agents in strict order |
| `LlmAgent` | Each agent file | Wraps Gemini + system prompt + tools |
| `FunctionTool` | Each agent file | Wraps pure Python functions as LLM-callable tools |
| `Runner` | orchestrator.py | Executes the pipeline, streams events |
| `InMemorySessionService` | orchestrator.py | Session lifecycle management |
| `types.Content` / `types.Part` | orchestrator.py | Constructs user messages for the runner |

### Evaluation Pipeline

```
test_data.py -> 15 TestCase dataclasses
                    |
                    v
eval_runner.py -> run_evaluation()
    for each test case:
        1. run_pipeline(case.input)       <- full 3-agent pipeline
        2. judge_analysis(...)            <- Gemini scores 4 dimensions (1-5)
        3. judge_prioritization(...)      <- Gemini scores 4 dimensions (1-5)
        4. judge_planning(...)            <- Gemini scores 4 dimensions (1-5)
        5. average all 3 stage scores -> overall_score
        6. passed = overall_score >= 3.0
    aggregate -> stored in evaluation_runs table
```

Both agents and judges use `gemini-2.0-flash`. Config provides separate `agent_model` and `judge_model` settings. Judges use `response_mime_type="application/json"` and temperature=0.1.

---

## 3. Folder Structure

```
productops-ai/
  .env.example                    <- environment variable template
  pyproject.toml                  <- Python project metadata + all dependencies
  start.ps1                       <- Windows one-command startup script
  data/sample_feedback.csv        <- 10 sample feedback rows for testing
  scripts/test_pipeline.py        <- CLI smoke test (calls run_pipeline directly)

  backend/
    main.py                       <- FastAPI app entry point + lifespan
    config.py                     <- Pydantic settings (reads .env, @lru_cache)
    database.py                   <- SQLAlchemy ORM models + async session factory

    agents/
      orchestrator.py             <- SequentialAgent + run_pipeline() + _parse_state()
      feedback_analyzer.py        <- Stage 1 LlmAgent (output_key=analysis_result)
      business_prioritizer.py     <- Stage 2 LlmAgent (output_key=prioritization_result)
      engineering_planner.py      <- Stage 3 LlmAgent (output_key=planning_result)
      tools/
        analysis_tools.py         <- categorize_feedback, detect_sentiment, extract_entities
        priority_tools.py         <- calculate_rice_score, estimate_business_impact, rank_feedback_items
        planner_tools.py          <- generate_engineering_tasks, estimate_effort, generate_release_notes

    api/
      routes.py                   <- All 9 API endpoints + _run_pipeline_bg()
      schemas.py                  <- Pydantic v2 request/response models

    mcp/
      server.py                   <- FastMCP server (5 tools) + module-level _feedback_store
      client.py                   <- MCPFeedbackClient (direct-call mode) + singleton

    memory/
      memory_service.py           <- MemoryService class + singleton

    evaluation/
      test_data.py                <- 15 TestCase dataclasses
      judges.py                   <- 3 judge functions + prompt templates
      eval_runner.py              <- run_evaluation() + run_single_test()

  frontend/
    .env.local                    <- BACKEND_URL + NEXT_PUBLIC_API_URL
    package.json                  <- next@15.1.0, react@19, tailwindcss@3.4
    tailwind.config.js            <- Custom colors, Inter/JetBrains fonts, animations
    app/
      layout.tsx                  <- Root layout: sidebar + main content area
      globals.css                 <- Full design system (CSS vars + component classes)
      page.tsx                    <- Dashboard (feedback input + file upload + run list)
      pipeline/[id]/page.tsx      <- Pipeline detail (3 tabs: analysis/priority/plan)
      evaluate/page.tsx           <- Evaluation runner + history + per-test accordion
      api/*/route.ts              <- Next.js proxy routes (bypassed by frontend)

  skills/
    feedback-analyzer/SKILL.md   <- Agent 1 spec (tools, I/O schema, eval criteria)
    business-prioritizer/SKILL.md <- Agent 2 spec (RICE framework, action mapping)
    engineering-planner/SKILL.md <- Agent 3 spec (task structure, sprint calc)
```

### File-by-File Details

**`backend/main.py`** — FastAPI app factory. Creates app, registers CORS middleware, mounts API router at `/api/v1`, calls `init_db()` on startup. Entry point: `uvicorn backend.main:app --reload --port 8000`.

**`backend/config.py`** — Pydantic-settings. Reads `.env`. `cors_origins_list` property splits comma-separated origins. `get_settings()` is `@lru_cache` singleton. Both `agent_model` and `judge_model` default to `gemini-2.0-flash`.

**`backend/database.py`** — 5 ORM models: `PipelineRun`, `FeedbackItem`, `EngineeringTask`, `EvaluationRun`, `AgentMemory`. `init_db()` creates all tables. `get_db()` is FastAPI dependency yielding `AsyncSession`. `FeedbackItem` and `EngineeringTask` are never written to — dead schema.

**`backend/api/routes.py`** — All 9 route handlers. `_run_pipeline_bg()` is the critical background task. Uses a **fresh DB session** (not the request session) because request sessions close before the background task completes. Pattern: `asyncio.create_task(_run_pipeline_bg(...))`.

**`backend/api/schemas.py`** — `PipelineRunRequest` (feedback_text 10–50000 chars, source). `PipelineResultResponse` (analysis, prioritization, planning as `dict[str, Any] | None`). `EvaluationRequest` (optional `test_subset: list[str] | None`).

**`backend/agents/orchestrator.py`** — `productops_pipeline` is a module-level `SequentialAgent` — created once at import. `InMemorySessionService` is a module-level singleton — sessions accumulate and are **never evicted** (memory leak). `run_pipeline(feedback_text, run_id)` creates session, runs agent, reads final state. `_parse_state(value)` strips markdown code fences and JSON-parses state values.

**`backend/agents/feedback_analyzer.py`** — Stage 1 agent. Instruction forces calling all 3 tools before output. Output schema: `{feedback_id, raw_text, category, category_confidence, sentiment, sentiment_score, entities, platforms, severity, summary}`.

**`backend/agents/business_prioritizer.py`** — Stage 2 agent. Reads `analysis_result` from session context. Output schema includes per-item RICE scores, urgency, risk flags, and recommended action.

**`backend/agents/engineering_planner.py`** — Stage 3 agent. Reads `prioritization_result`. Specifies 1 sprint = 10 story points in the prompt. Output includes full task list + release notes.

**`backend/agents/tools/analysis_tools.py`**
- `categorize_feedback`: Keyword signal counting across 5 category bags. Confidence = top_score/total, capped at 0.95. Falls back to `question` at 0.3 if no signals match.
- `detect_sentiment`: Counts positive/negative word lists. Score = pos/(pos+neg). Thresholds: >0.6 = positive, <0.4 = negative, else neutral.
- `extract_entities`: Regex platform detection, quoted-phrase + capitalised-word entity extraction (max 8, stop-word filtered), keyword-tier severity.
- **Critical limitation**: Heuristic keyword tools — NOT real NLP/ML. Accuracy degrades on sarcasm, slang, unusual phrasing.

**`backend/agents/tools/priority_tools.py`**
- `calculate_rice_score`: Fixed lookup tables for R/I/C/E by category/severity/sentiment. RICE = (R × I × C)/E. Urgency from severity + RICE score thresholds.
- `estimate_business_impact`: Rule-based revenue_risk and retention_risk flags, high/medium/low impact classification.
- `rank_feedback_items`: Sorts by urgency order (critical=0, high=1, medium=2, low=3) then RICE score descending. Input must be JSON string of items with `id`, `rice_score`, `urgency` fields.

**`backend/agents/tools/planner_tools.py`**
- `generate_engineering_tasks`: Template-driven. Different templates for bug_report, feature_request, and other categories. Task IDs: `TASK-{6-char-hex}`.
- `estimate_effort`: Base story points by category + severity modifier + entity_count modifier. Maps to small/medium/large/xl.
- `generate_release_notes`: Classifies tasks by title prefix into Bug Fixes / New Features / Improvements. Emoji-sectioned markdown.

**`backend/mcp/server.py`** — FastMCP server. `_feedback_store` is module-level list, in-memory only. Standalone: `python -m backend.mcp.server` (stdio transport).

**`backend/mcp/client.py`** — `MCPFeedbackClient` imports and calls server functions directly. `mcp_client` singleton used by routes.py for upload ingestion and stats.

**`backend/memory/memory_service.py`** — `store()` writes JSON to `agent_memory` with `mem_{10hex}` ID. `store_pipeline_result()` called after each successful run. Memory stored but **never injected into agent prompts**.

**`backend/evaluation/judges.py`** — 3 judge functions. `_call_judge()` uses **synchronous** `client.models.generate_content()` inside async context — blocks the event loop.
- `judge_analysis`: category_score, sentiment_score, severity_score, summary_quality (1–5 each)
- `judge_prioritization`: rice_reasonable, urgency_accuracy, justification, action
- `judge_planning`: task_completeness, technical_feasibility, effort_accuracy, criteria_quality

**`backend/evaluation/eval_runner.py`** — `run_single_test(case)`: full pipeline + 3 judge calls. Pass threshold = overall_score >= 3.0. `run_evaluation(test_subset)`: sequential iteration, 1-second sleep between tests.

**`backend/evaluation/test_data.py`** — 15 TestCase dataclasses. Fields: `id` (tc_01…tc_15), `input`, `expected_category`, `expected_sentiment`, `expected_severity`, `expected_urgency`, `description`. Cases cover: iOS PDF crash, dark mode request, dashboard perf, praise, auth failure, Slack integration, search UX, analytics bug, bulk export limit, iPad layout, SSO requirement, onboarding praise, report perf regression, data loss, Excel export question.

**`frontend/app/globals.css`** — CSS vars: `--bg #09090f`, `--surface #111118`, `--elevated #1a1a26`, `--border #2a2a3a`, `--muted #4a4a6a`, `--subtle #8b8baa`, `--primary #f0f0f8`. Component classes: `.card`, `.card-sm`, `.btn-primary`, `.btn-ghost`, `.badge-{critical|high|medium|low|success|violet|running}`, `.dot-{running|done|failed}`, `.mono`, `.label`, `.input`, `.tab`, `.tab-active`. Animations: `fadeIn` (0.25s), `pulseDot` (breathing), `spin-slow` (1.5s loader).

**`start.ps1`** — Validates `.env` and `GOOGLE_API_KEY`, starts uvicorn and `npm run dev` as PowerShell background jobs, streams job output every 5 seconds, stops both on Ctrl+C.

---

## 4. AI System

### Agent 1: Feedback Analyzer

| Property | Value |
|----------|-------|
| Name | `feedback_analyzer` |
| ADK Class | `LlmAgent` |
| Model | `gemini-2.0-flash` |
| Stage | 1 of 3 |
| Input | Raw customer feedback text (user message from orchestrator) |
| Output key | `analysis_result` |
| Tools | `categorize_feedback`, `detect_sentiment`, `extract_entities` |
| Prompting | Numbered steps. Forces ALL 3 tool calls before output. Exact JSON schema. Edge cases: empty input → category=question, severity=low. |
| Output schema | `{feedback_id, raw_text, category, category_confidence, sentiment, sentiment_score, entities, platforms, severity, summary}` |

### Agent 2: Business Prioritizer

| Property | Value |
|----------|-------|
| Name | `business_prioritizer` |
| ADK Class | `LlmAgent` |
| Model | `gemini-2.0-flash` |
| Stage | 2 of 3 |
| Input | Reads `analysis_result` from ADK session state |
| Output key | `prioritization_result` |
| Tools | `calculate_rice_score`, `estimate_business_impact`, `rank_feedback_items` |
| Prompting | References session state variable by name. Full RICE formula. Urgency-to-action mapping table in prompt. Step-by-step tool sequence. |
| Output schema | `{prioritized_items: [{feedback_id, rice_score, reach, impact, confidence, effort, urgency, business_impact, revenue_risk, retention_risk, business_justification, recommended_action}], priority_ranking, ranking_rationale}` |

### Agent 3: Engineering Planner

| Property | Value |
|----------|-------|
| Name | `engineering_planner` |
| ADK Class | `LlmAgent` |
| Model | `gemini-2.0-flash` |
| Stage | 3 of 3 |
| Input | Reads `prioritization_result` from ADK session state |
| Output key | `planning_result` |
| Tools | `estimate_effort`, `generate_engineering_tasks`, `generate_release_notes` |
| Prompting | Critical/high urgency items first. 1 sprint = 10 story points. Step-by-step tool call sequence with argument sourcing instructions. |
| Output schema | `{tasks: [{task_id, feedback_id, title, description, technical_approach, effort_estimate, story_points, priority, acceptance_criteria}], release_notes, release_summary, total_story_points, sprint_recommendation}` |

### Agent Orchestration

`productops_pipeline` is a **SequentialAgent** — sub-agents run strictly in sequence. No parallel execution, branching, or dynamic routing.

Inter-agent data flow is exclusively via **ADK session state**: `output_key` writes; the next agent receives the value injected into its prompt context by ADK.

The `Runner` class manages async execution. `runner.run_async()` yields events; structured data is read from session state (not the event stream) via `session_service.get_session()` after pipeline completes.

### Memory

**Session Memory (short-term):** `InMemorySessionService` dict keyed by (app_name, user_id, session_id). Persists for process lifetime only. Sessions never evicted — memory leak risk.

**SQLite Memory (long-term):** `store_pipeline_result()` saves all 3 stage outputs. Readable via API. **NOT injected back into agent prompts** in current implementation.

### Session State Keys

| Key | Written by | Read by |
|-----|-----------|---------|
| `analysis_result` | `feedback_analyzer` | `business_prioritizer` (via ADK context) |
| `prioritization_result` | `business_prioritizer` | `engineering_planner` (via ADK context) |
| `planning_result` | `engineering_planner` | `orchestrator` (via session_service.get_session) |

---

## 5. APIs

All routes under `/api/v1`. All responses are JSON.

### GET /
Root info: `{name, version, docs, health}`

### GET /api/v1/health
Health check: `{status: "ok", version: "0.1.0", agents: [...]}`

### POST /api/v1/pipeline
- **Request**: `{feedback_text: string (10–50000 chars), source: string}`
- **Response (202)**: `{run_id, status: "running", created_at, message}`
- **Flow**: Insert PipelineRun (running) → fire `asyncio.create_task(_run_pipeline_bg)` → return immediately
- **Background task**: `run_pipeline()` → memory store → UPDATE row (completed or failed+error_message)

### GET /api/v1/pipeline
- List recent runs. `limit` param (default 20).
- **Response**: `[{run_id, status, created_at, input_source, duration_ms}]`

### GET /api/v1/pipeline/{run_id}
- Full result of one run.
- **Response**: `{run_id, status, created_at, input_source, analysis, prioritization, planning, duration_ms, error_message}`
- `analysis`/`prioritization`/`planning` are JSON-parsed dicts or null if not yet complete.

### POST /api/v1/feedback/upload
- **Request**: `multipart/form-data` with `file` (.csv or .json only)
- **Response**: `{run_id, items_ingested, status: "running", message}`
- **Flow**: Read file → `mcp_client.ingest_csv/json()` → take top 10 items → concatenate as `[Feedback N]: text` → same background pipeline
- **Limitation**: Only .csv and .json accepted. No file size cap.

### POST /api/v1/evaluate
- **Request**: `{test_subset: string[] | null}` — null = all 15 tests
- **Response**: `{eval_id, status, test_cases_total, test_cases_passed, analysis_score, prioritization_score, planning_score, overall_score, details: [...]}`
- **Critical**: Blocks for 2–5 minutes. Should be made async (see Section 10).

### GET /api/v1/evaluate
- Last 10 evaluation summaries (no per-test details).

### GET /api/v1/memory/recent
- **Response**: `[{agent, type, entries: [{id, content, relevance_score, created_at}]}]`
- Returns last 3 analyses + last 3 prioritizations.

### GET /api/v1/mcp/stats
- **Response**: `{total, by_source, date_range}`
- Stats for in-memory MCP store only — resets to 0 on restart.

---
