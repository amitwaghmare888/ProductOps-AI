# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fixed an issue where the Google ADK `LlmAgent` reported "No API key was provided." by explicitly exporting `GOOGLE_API_KEY` to `os.environ` in `backend/config.py`.

## [0.2.0] — 2026-07-03

### Added
- `backend/utils/retry.py` — `async_retry` decorator with exponential backoff (configurable attempts, base delay, max delay). Applied to all ADK pipeline executions.
- `backend/utils/output_schemas.py` — Pydantic v2 schemas (`AnalysisOutput`, `PrioritizationOutput`, `PlanningOutput`) for non-blocking validation of agent JSON outputs.
- `backend/utils/__init__.py` — utils package.

### Changed
- `backend/agents/orchestrator.py` — Extracted ADK runner execution into `_execute_adk_pipeline()` (private, retryable). Each retry creates a fresh session ID to prevent stale state pollution. Added `_validate_output()` for non-blocking per-stage schema validation. `run_pipeline()` public interface unchanged.

### Reliability
- Pipeline now survives transient Gemini API errors (rate limits, 5xx) with up to 3 attempts: 2s → 4s → 8s delay.
- Agent output schema drift is now observable via `WARNING` log lines instead of silently producing `{"raw_output": ...}`.

### Structured Outputs (Gemini Native JSON Mode)
- `backend/agents/feedback_analyzer.py` — Added `generate_content_config=GenerateContentConfig(response_mime_type="application/json")` to `LlmAgent`. Agent now emits raw JSON without markdown fences.
- `backend/agents/business_prioritizer.py` — Same. Raw JSON output enforced at model level.
- `backend/agents/engineering_planner.py` — Same. Raw JSON output enforced at model level.
- `backend/agents/orchestrator.py` — `_parse_state()` markdown fence stripping condensed to a warned fallback. Normal execution path is now direct `json.loads()` with no preprocessing.

## [0.3.0] — 2026-07-03

### Added: Persistent Pipeline Storage
- `backend/api/routes.py` — `_persist_structured_outputs()` private function. After every successful pipeline run, writes one `FeedbackItem` and N `EngineeringTask` rows to SQLite. IDs are namespaced as `{run_id[:8]}_{original_id}` for global uniqueness.
- `backend/api/routes.py` — `GET /api/v1/pipeline/{run_id}/items` — Returns all persisted `FeedbackItem` rows for a run.
- `backend/api/routes.py` — `GET /api/v1/pipeline/{run_id}/tasks` — Returns all persisted `EngineeringTask` rows for a run.
- `backend/api/routes.py` — `GET /api/v1/analytics/summary` — Returns aggregate stats: run counts by status, total items/tasks, avg duration, top-5 categories.
- `backend/api/schemas.py` — `FeedbackItemResponse`, `EngineeringTaskResponse`, `AnalyticsSummaryResponse` Pydantic models.

### Database
- `feedback_items` table now populated on every successful pipeline run.
- `engineering_tasks` table now populated on every successful pipeline run.
- Persistence is best-effort (non-fatal): `pipeline_runs` record is committed first; structured output write failures are caught and silently skipped.

### No Breaking Changes
- All existing API endpoints and response shapes unchanged.
- No new dependencies introduced.

## [0.4.1] — 2026-07-03

### Added: LLM Gateway (v0.4.1)
- `backend/gateway/providers/base.py` — `LLMProvider` ABC + `ProviderMetrics` + `ProviderResponse` dataclasses. Provider-agnostic interface for future OpenAI/Claude implementations.
- `backend/gateway/providers/gemini.py` — `GeminiProvider`: Gemini implementation with per-key metrics tracking, circuit breaker (60 s cooldown on 429/quota errors), and model fallback (retries with `agent_model_fallback` on non-rate-limit failures).
- `backend/gateway/llm_gateway.py` — `LLMGateway` singleton: round-robin key pool, `generate()` (async), `generate_sync()`, `get_stats()`. `from_gemini_keys()` factory for initialization.
- `backend/gateway/__init__.py` — Public API: `llm_gateway`, `init_gateway()`.
- `backend/api/schemas.py` — `GatewayKeyStats`, `GatewayStatsResponse` Pydantic models.
- `backend/api/routes.py` — `GET /api/v1/gateway/stats` endpoint.

### Modified
- `backend/config.py` — Added `google_api_keys: str` (comma-separated pool), `agent_model_fallback: str` (default `gemini-1.5-flash`), `use_langgraph: bool` (feature flag, default `False`), `gateway_api_keys_list` property.
- `backend/main.py` — `init_gateway()` called in lifespan. Version bumped to `0.4.1`. Gateway stats URL printed at startup.

### Features
- **Key pooling**: Set `GOOGLE_API_KEYS=key1,key2,key3` in `.env`. Gateway distributes requests round-robin. Falls back to `GOOGLE_API_KEY` when `GOOGLE_API_KEYS` is not set.
- **Circuit breaker**: Rate-limited keys are automatically excluded from routing for 60 s and then re-instated.
- **Model fallback**: Any generation call can specify `fallback_model`; used automatically on non-rate-limit failures.
- **Metrics**: Per-key request counts, error rates, avg latency, fallback counts, rate-limit status exposed at `GET /gateway/stats`.
- **Feature flag**: `USE_LANGGRAPH=false` (default) keeps the existing ADK SequentialAgent path active. Ready for v0.4.2.

### Unchanged
- All ADK agent files untouched.
- All existing API contracts preserved.
- No new pip dependencies required (uses `google-genai` already installed).
