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
