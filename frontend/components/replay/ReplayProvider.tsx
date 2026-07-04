'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single step in a replay sequence. */
export interface ReplayStep {
  /** Unique identifier for the step (e.g. 'agent_start', 'tool_call'). */
  id: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** ISO timestamp of when this step logically occurred. */
  timestamp: string;
  /** Replay category for colour-coding. */
  type: 'agent' | 'tool' | 'output' | 'error' | 'info';
  /** Optional payload data attached to the step. */
  payload?: Record<string, unknown>;
  /** Wall-clock offset from the start of replay (ms) — controls pacing. */
  offsetMs: number;
}

export type ReplayStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface ReplayState {
  /** All steps in the current replay sequence. */
  steps: ReplayStep[];
  /** The index of the last revealed step (-1 = nothing shown yet). */
  cursor: number;
  /** Playback state. */
  status: ReplayStatus;
  /** Playback speed multiplier (0.5×, 1×, 2×, 4×). */
  speed: number;
  /** The currently visible steps (steps[0..cursor]). */
  visibleSteps: ReplayStep[];
}

export interface ReplayActions {
  /** Load a new sequence and reset playback. */
  load: (steps: ReplayStep[]) => void;
  /** Start or resume playback. */
  play: () => void;
  /** Pause playback at the current cursor position. */
  pause: () => void;
  /** Reset to the beginning without starting playback. */
  reset: () => void;
  /** Jump directly to a step index. */
  seekTo: (index: number) => void;
  /** Change the playback speed. */
  setSpeed: (speed: number) => void;
}

export type ReplayContextValue = ReplayState & ReplayActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const ReplayContext = createContext<ReplayContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ReplayProviderProps {
  /** Initial steps to load immediately. */
  initialSteps?: ReplayStep[];
  children: React.ReactNode;
}

/**
 * ReplayProvider
 *
 * Manages time-based playback of a step sequence (agent execution trace).
 * Exposes `play`, `pause`, `reset`, `seekTo`, and `setSpeed` controls.
 * Steps are revealed according to their `offsetMs` value, scaled by `speed`.
 *
 * @example
 * <ReplayProvider initialSteps={DEMO_STEPS}>
 *   <WatchAIThinkSection />
 * </ReplayProvider>
 */
export function ReplayProvider({ initialSteps = [], children }: ReplayProviderProps) {
  const [steps,   setSteps]   = useState<ReplayStep[]>(initialSteps);
  const [cursor,  setCursor]  = useState<number>(-1);
  const [status,  setStatus]  = useState<ReplayStatus>('idle');
  const [speed,   setSpeedState] = useState<number>(1);

  // Refs for the scheduler — avoid stale closures inside rAF
  const stepsRef  = useRef(steps);
  const cursorRef = useRef(cursor);
  const speedRef  = useRef(speed);
  const rafRef    = useRef<number | null>(null);
  const playStartWallMs = useRef<number | null>(null);
  const playStartOffset = useRef<number>(0); // offsetMs of the step we resumed from

  useEffect(() => { stepsRef.current  = steps;  }, [steps]);
  useEffect(() => { cursorRef.current = cursor;  }, [cursor]);
  useEffect(() => { speedRef.current  = speed;   }, [speed]);

  // ── Scheduler ──────────────────────────────────────────────────────────────

  const cancelScheduler = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    cancelScheduler();

    const tick = (now: number) => {
      if (playStartWallMs.current === null) playStartWallMs.current = now;

      const elapsed  = (now - playStartWallMs.current) * speedRef.current;
      const logicalT = playStartOffset.current + elapsed;

      const allSteps = stepsRef.current;
      let nextCursor = cursorRef.current;

      // Reveal all steps whose offsetMs has been reached
      while (
        nextCursor + 1 < allSteps.length &&
        allSteps[nextCursor + 1].offsetMs <= logicalT
      ) {
        nextCursor++;
      }

      if (nextCursor !== cursorRef.current) {
        cursorRef.current = nextCursor;
        setCursor(nextCursor);
      }

      if (nextCursor + 1 >= allSteps.length) {
        // All steps revealed — mark complete
        setStatus('completed');
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [cancelScheduler]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const load = useCallback((newSteps: ReplayStep[]) => {
    cancelScheduler();
    setSteps(newSteps);
    setCursor(-1);
    setStatus('idle');
    playStartWallMs.current = null;
    playStartOffset.current = 0;
  }, [cancelScheduler]);

  const play = useCallback(() => {
    if (status === 'completed') return;

    const currentCursor = cursorRef.current;
    const allSteps      = stepsRef.current;

    // Resume offset = the offsetMs of the step at current cursor (or 0)
    playStartOffset.current =
      currentCursor >= 0 ? allSteps[currentCursor].offsetMs : 0;
    playStartWallMs.current = null; // will be set on first tick

    setStatus('playing');
    scheduleNext();
  }, [status, scheduleNext]);

  const pause = useCallback(() => {
    cancelScheduler();
    setStatus('paused');
    playStartWallMs.current = null;
  }, [cancelScheduler]);

  const reset = useCallback(() => {
    cancelScheduler();
    setCursor(-1);
    setStatus('idle');
    playStartWallMs.current = null;
    playStartOffset.current = 0;
  }, [cancelScheduler]);

  const seekTo = useCallback((index: number) => {
    cancelScheduler();
    const clamped = Math.max(-1, Math.min(index, stepsRef.current.length - 1));
    setCursor(clamped);
    setStatus('paused');
    playStartWallMs.current = null;
    playStartOffset.current = clamped >= 0 ? stepsRef.current[clamped].offsetMs : 0;
  }, [cancelScheduler]);

  const setSpeed = useCallback((s: number) => {
    // If currently playing, restart scheduling from current position
    const wasPlaying = status === 'playing';
    if (wasPlaying) cancelScheduler();
    speedRef.current = s;
    setSpeedState(s);
    if (wasPlaying) {
      playStartOffset.current = cursorRef.current >= 0
        ? stepsRef.current[cursorRef.current].offsetMs
        : 0;
      playStartWallMs.current = null;
      scheduleNext();
    }
  }, [status, cancelScheduler, scheduleNext]);

  // Cleanup on unmount
  useEffect(() => () => cancelScheduler(), [cancelScheduler]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const visibleSteps = cursor >= 0 ? steps.slice(0, cursor + 1) : [];

  const value: ReplayContextValue = {
    steps,
    cursor,
    status,
    speed,
    visibleSteps,
    load,
    play,
    pause,
    reset,
    seekTo,
    setSpeed,
  };

  return (
    <ReplayContext.Provider value={value}>
      {children}
    </ReplayContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useReplay
 *
 * Returns the full ReplayContext value. Must be used inside a `<ReplayProvider>`.
 *
 * @throws if used outside a ReplayProvider
 */
export function useReplay(): ReplayContextValue {
  const ctx = useContext(ReplayContext);
  if (!ctx) {
    throw new Error('useReplay must be used within a <ReplayProvider>.');
  }
  return ctx;
}

export default ReplayProvider;
