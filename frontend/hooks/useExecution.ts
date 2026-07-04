'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Execution status mirroring the backend pipeline_runs.status enum. */
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

/** A single agent stage within an execution. */
export interface ExecutionStage {
  name:       'feedback_analyzer' | 'business_prioritizer' | 'engineering_planner';
  label:      string;
  status:     ExecutionStatus;
  /** Wall-clock start time (ms since epoch), undefined until stage begins. */
  startedAt?: number;
  /** Wall-clock end time (ms since epoch), undefined until stage ends. */
  endedAt?:   number;
  /** Duration in ms (endedAt - startedAt), undefined while running. */
  durationMs?: number;
}

/** Full execution state consumed by UI components. */
export interface ExecutionState {
  runId:      string | null;
  status:     ExecutionStatus;
  stages:     ExecutionStage[];
  /** Overall elapsed ms from pipeline start, updated while running. */
  elapsedMs:  number;
  /** Error message if status === 'failed'. */
  error:      string | null;
}

interface UseExecutionOptions {
  /**
   * Run ID to track. When provided the hook begins polling.
   * Set to `null` to stop all polling.
   */
  runId: string | null;
  /** Polling interval in ms. @default 1500 */
  pollIntervalMs?: number;
  /**
   * Backend base URL (without trailing slash).
   * Falls back to the module-level API_BASE from lib/api.ts.
   */
  baseUrl?: string;
  /** Called once when the pipeline completes. */
  onComplete?: (finalState: ExecutionState) => void;
  /** Called once if the pipeline fails. */
  onError?: (error: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_META: Omit<ExecutionStage, 'status'>[] = [
  { name: 'feedback_analyzer',   label: 'Feedback Analyzer' },
  { name: 'business_prioritizer', label: 'Business Prioritizer' },
  { name: 'engineering_planner',  label: 'Engineering Planner' },
];

function buildInitialStages(): ExecutionStage[] {
  return STAGE_META.map(s => ({ ...s, status: 'idle' }));
}

/**
 * Infer stage statuses from a top-level pipeline status + raw output keys.
 *
 * The backend exposes `analysis_output`, `prioritization_output`, and
 * `planning_output` on the run record. We use their presence to determine
 * how far the pipeline has progressed.
 */
function inferStages(
  pipelineStatus: ExecutionStatus,
  raw: Record<string, unknown>,
): ExecutionStage[] {
  const hasAnalysis      = !!raw.analysis_output;
  const hasPrioritization = !!raw.prioritization_output;
  const hasPlanning      = !!raw.planning_output;

  return [
    {
      ...STAGE_META[0],
      status:    hasAnalysis ? 'completed' : pipelineStatus === 'running' ? 'running' : 'idle',
    },
    {
      ...STAGE_META[1],
      status:    hasPrioritization
                  ? 'completed'
                  : hasAnalysis && pipelineStatus === 'running'
                    ? 'running'
                    : 'idle',
    },
    {
      ...STAGE_META[2],
      status:    hasPlanning
                  ? 'completed'
                  : hasPrioritization && pipelineStatus === 'running'
                    ? 'running'
                    : pipelineStatus === 'failed'
                      ? 'failed'
                      : 'idle',
    },
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useExecution
 *
 * Polls the backend `GET /api/v1/pipeline/{runId}` endpoint and surfaces
 * real-time execution state: overall status, per-stage progress, elapsed time,
 * and error messages.
 *
 * Polling stops automatically when `status` reaches 'completed' or 'failed'.
 * All intervals are cleaned up on unmount or when `runId` changes.
 *
 * @example
 * const { status, stages, elapsedMs, error } = useExecution({ runId: activeRunId });
 */
export function useExecution({
  runId,
  pollIntervalMs = 1500,
  baseUrl,
  onComplete,
  onError,
}: UseExecutionOptions): ExecutionState {
  const [state, setState] = useState<ExecutionState>({
    runId:     runId,
    status:    'idle',
    stages:    buildInitialStages(),
    elapsedMs: 0,
    error:     null,
  });

  const startWallMs  = useRef<number | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTerminated = useRef(false);

  // Callbacks as refs to avoid stale closure issues in intervals
  const onCompleteRef = useRef(onComplete);
  const onErrorRef    = useRef(onError);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onErrorRef.current    = onError;    }, [onError]);

  const clearTimers = useCallback(() => {
    if (elapsedTimer.current) { clearInterval(elapsedTimer.current); elapsedTimer.current = null; }
    if (pollTimer.current)    { clearInterval(pollTimer.current);    pollTimer.current    = null; }
  }, []);

  const resolvedBase =
    baseUrl ??
    (typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000')
      : 'http://127.0.0.1:8000');

  useEffect(() => {
    // Reset when runId changes
    clearTimers();
    isTerminated.current = false;
    startWallMs.current  = null;

    if (!runId) {
      setState({
        runId:     null,
        status:    'idle',
        stages:    buildInitialStages(),
        elapsedMs: 0,
        error:     null,
      });
      return;
    }

    // Begin elapsed timer (ticks every 100ms)
    startWallMs.current = Date.now();
    elapsedTimer.current = setInterval(() => {
      if (startWallMs.current !== null) {
        setState(prev => ({
          ...prev,
          elapsedMs: Date.now() - (startWallMs.current ?? Date.now()),
        }));
      }
    }, 100);

    const poll = async () => {
      if (isTerminated.current) return;

      try {
        const res = await fetch(`${resolvedBase}/api/v1/pipeline/${runId}`);

        if (!res.ok) {
          // 404 on first poll is normal — backend may not have created the record yet
          if (res.status !== 404) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return;
        }

        const data = (await res.json()) as Record<string, unknown>;
        const rawStatus = (data.status ?? 'running') as ExecutionStatus;
        const stages    = inferStages(rawStatus, data);

        setState(prev => ({
          ...prev,
          runId,
          status: rawStatus,
          stages,
          error:  rawStatus === 'failed' ? String(data.error_message ?? 'Unknown error') : null,
        }));

        if (rawStatus === 'completed' || rawStatus === 'failed') {
          isTerminated.current = true;
          clearTimers();

          if (rawStatus === 'completed') {
            onCompleteRef.current?.({
              runId,
              status: rawStatus,
              stages,
              elapsedMs: Date.now() - (startWallMs.current ?? Date.now()),
              error:     null,
            });
          } else {
            onErrorRef.current?.(String(data.error_message ?? 'Pipeline failed'));
          }
        }
      } catch (err) {
        // Network errors are silently swallowed — the UI shows the last known state
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useExecution] poll error:', err);
        }
      }
    };

    // First poll immediately, then on interval
    void poll();
    pollTimer.current = setInterval(poll, pollIntervalMs);

    return () => {
      isTerminated.current = true;
      clearTimers();
    };
  }, [runId, pollIntervalMs, resolvedBase, clearTimers]);

  return state;
}

export default useExecution;
