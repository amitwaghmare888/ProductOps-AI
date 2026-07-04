/**
 * replayData.ts
 *
 * Canonical demo replay sequence for the ProductOps AI pipeline.
 * Represents a realistic execution trace of the 3-agent pipeline
 * (Feedback Analyzer → Business Prioritizer → Engineering Planner)
 * processing a sample customer feedback batch.
 *
 * All `offsetMs` values are wall-clock offsets from t=0 in milliseconds,
 * calibrated to the real ADK pipeline timing (≈18–25 s end-to-end).
 * At 1× speed the replay faithfully mirrors a real run.
 */

import type { ReplayStep } from '@/components/replay/ReplayProvider';

// ─── Pipeline replay sequence ──────────────────────────────────────────────────

export const DEMO_REPLAY_STEPS: ReplayStep[] = [
  // ── Submission ────────────────────────────────────────────────────────────
  {
    id:        'pipeline_start',
    label:     'Pipeline run started',
    timestamp: '2026-07-04T09:00:00.000Z',
    type:      'info',
    offsetMs:  0,
    payload:   { run_id: 'a1b2c3d4', source: 'manual' },
  },
  {
    id:        'session_created',
    label:     'ADK session initialised',
    timestamp: '2026-07-04T09:00:00.120Z',
    type:      'info',
    offsetMs:  120,
    payload:   { session_id: 'sess_a1b2c3d4' },
  },

  // ── Stage 1 — Feedback Analyzer ───────────────────────────────────────────
  {
    id:        'analyzer_start',
    label:     'Feedback Analyzer agent started',
    timestamp: '2026-07-04T09:00:00.250Z',
    type:      'agent',
    offsetMs:  250,
    payload:   { agent: 'feedback_analyzer', model: 'gemini-2.0-flash' },
  },
  {
    id:        'tool_categorize',
    label:     'Tool: categorize_feedback',
    timestamp: '2026-07-04T09:00:01.100Z',
    type:      'tool',
    offsetMs:  1100,
    payload:   { tool: 'categorize_feedback', items_received: 4 },
  },
  {
    id:        'tool_sentiment',
    label:     'Tool: detect_sentiment',
    timestamp: '2026-07-04T09:00:02.400Z',
    type:      'tool',
    offsetMs:  2400,
    payload:   { tool: 'detect_sentiment', avg_sentiment: -0.42 },
  },
  {
    id:        'tool_entities',
    label:     'Tool: extract_entities',
    timestamp: '2026-07-04T09:00:03.700Z',
    type:      'tool',
    offsetMs:  3700,
    payload:   { tool: 'extract_entities', entities_found: 9 },
  },
  {
    id:        'analyzer_complete',
    label:     'Feedback Analyzer — complete',
    timestamp: '2026-07-04T09:00:05.200Z',
    type:      'output',
    offsetMs:  5200,
    payload:   {
      analysis_result: {
        items:          4,
        critical_count: 1,
        high_count:     2,
        categories:     ['bug', 'performance', 'feature', 'bug'],
      },
    },
  },

  // ── Stage 2 — Business Prioritizer ────────────────────────────────────────
  {
    id:        'prioritizer_start',
    label:     'Business Prioritizer agent started',
    timestamp: '2026-07-04T09:00:05.350Z',
    type:      'agent',
    offsetMs:  5350,
    payload:   { agent: 'business_prioritizer', model: 'gemini-2.0-flash' },
  },
  {
    id:        'tool_rice',
    label:     'Tool: calculate_rice_score',
    timestamp: '2026-07-04T09:00:06.600Z',
    type:      'tool',
    offsetMs:  6600,
    payload:   { tool: 'calculate_rice_score', top_score: 4200 },
  },
  {
    id:        'tool_impact',
    label:     'Tool: estimate_business_impact',
    timestamp: '2026-07-04T09:00:08.100Z',
    type:      'tool',
    offsetMs:  8100,
    payload:   { tool: 'estimate_business_impact', revenue_risk: 'high' },
  },
  {
    id:        'tool_rank',
    label:     'Tool: rank_feedback_items',
    timestamp: '2026-07-04T09:00:09.500Z',
    type:      'tool',
    offsetMs:  9500,
    payload:   { tool: 'rank_feedback_items', ranked_count: 4 },
  },
  {
    id:        'prioritizer_complete',
    label:     'Business Prioritizer — complete',
    timestamp: '2026-07-04T09:00:11.000Z',
    type:      'output',
    offsetMs:  11000,
    payload:   {
      prioritization_result: {
        top_priority:    'P0',
        sprint_capacity: '80%',
        items_ranked:    4,
      },
    },
  },

  // ── Stage 3 — Engineering Planner ─────────────────────────────────────────
  {
    id:        'planner_start',
    label:     'Engineering Planner agent started',
    timestamp: '2026-07-04T09:00:11.150Z',
    type:      'agent',
    offsetMs:  11150,
    payload:   { agent: 'engineering_planner', model: 'gemini-2.0-flash' },
  },
  {
    id:        'tool_effort',
    label:     'Tool: estimate_effort',
    timestamp: '2026-07-04T09:00:12.400Z',
    type:      'tool',
    offsetMs:  12400,
    payload:   { tool: 'estimate_effort', total_points: 13 },
  },
  {
    id:        'tool_tasks',
    label:     'Tool: generate_engineering_tasks',
    timestamp: '2026-07-04T09:00:14.100Z',
    type:      'tool',
    offsetMs:  14100,
    payload:   {
      tool:         'generate_engineering_tasks',
      tasks_created: 4,
      sizes:         ['large', 'medium', 'medium', 'small'],
    },
  },
  {
    id:        'tool_release_notes',
    label:     'Tool: generate_release_notes',
    timestamp: '2026-07-04T09:00:15.900Z',
    type:      'tool',
    offsetMs:  15900,
    payload:   { tool: 'generate_release_notes', sections: ['bug_fixes', 'features'] },
  },
  {
    id:        'planner_complete',
    label:     'Engineering Planner — complete',
    timestamp: '2026-07-04T09:00:17.600Z',
    type:      'output',
    offsetMs:  17600,
    payload:   {
      planning_result: {
        tasks:                4,
        total_story_points:   13,
        sprint_recommendation: '2 sprints',
        release_summary:      '1 critical fix, 2 bugs, 1 feature',
      },
    },
  },

  // ── Pipeline complete ─────────────────────────────────────────────────────
  {
    id:        'pipeline_persist',
    label:     'Results persisted to SQLite',
    timestamp: '2026-07-04T09:00:17.850Z',
    type:      'info',
    offsetMs:  17850,
    payload:   { tables: ['pipeline_runs', 'feedback_items', 'engineering_tasks'] },
  },
  {
    id:        'pipeline_complete',
    label:     'Pipeline completed — 17.9 s',
    timestamp: '2026-07-04T09:00:17.940Z',
    type:      'output',
    offsetMs:  17940,
    payload:   { duration_ms: 17940, status: 'completed' },
  },
];

// ─── Metadata helpers ─────────────────────────────────────────────────────────

/** Total logical duration of the demo sequence in milliseconds. */
export const DEMO_DURATION_MS = DEMO_REPLAY_STEPS.at(-1)?.offsetMs ?? 0;

/** Number of steps in the sequence. */
export const DEMO_STEP_COUNT = DEMO_REPLAY_STEPS.length;

/** Steps grouped by agent stage for summary display. */
export const DEMO_STAGE_BREAKDOWN = {
  analyzer:    DEMO_REPLAY_STEPS.filter(s => s.id.startsWith('analyzer') || s.id === 'tool_categorize' || s.id === 'tool_sentiment' || s.id === 'tool_entities'),
  prioritizer: DEMO_REPLAY_STEPS.filter(s => s.id.startsWith('prioritizer') || s.id === 'tool_rice' || s.id === 'tool_impact' || s.id === 'tool_rank'),
  planner:     DEMO_REPLAY_STEPS.filter(s => s.id.startsWith('planner') || s.id === 'tool_effort' || s.id === 'tool_tasks' || s.id === 'tool_release_notes'),
} as const;
