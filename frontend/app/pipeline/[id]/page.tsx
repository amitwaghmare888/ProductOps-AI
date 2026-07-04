'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { API_BASE as API } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PipelineResult {
  run_id: string;
  status: string;
  created_at: string;
  input_source: string;
  analysis: Record<string, unknown> | null;
  prioritization: Record<string, unknown> | null;
  planning: Record<string, unknown> | null;
  duration_ms: number | null;
  error_message: string | null;
}

// ─── Small reusable components ────────────────────────────────────────────────
function Pill({ label, value, color = 'default' }: { label: string; value: string | number | undefined; color?: string }) {
  const colorMap: Record<string, string> = {
    default: 'text-[#f0f0f8]',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  return (
    <div className="flex flex-col gap-0.5">
      <p className="label">{label}</p>
      <p className={`text-sm font-medium ${colorMap[color] || colorMap.default}`}>{value ?? '—'}</p>
    </div>
  );
}

function SeverityBadge({ value }: { value?: string }) {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === 'critical') return <span className="badge-critical">{value}</span>;
  if (v === 'high')     return <span className="badge-high">{value}</span>;
  if (v === 'medium')   return <span className="badge-medium">{value}</span>;
  return <span className="badge-low">{value}</span>;
}

function PriorityBadge({ value }: { value?: string }) {
  if (!value) return null;
  if (value === 'P0') return <span className="badge-critical">{value}</span>;
  if (value === 'P1') return <span className="badge-high">{value}</span>;
  if (value === 'P2') return <span className="badge-medium">{value}</span>;
  return <span className="badge-low">{value}</span>;
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <pre className="bg-[#09090f] rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-auto max-h-80 border border-[#2a2a3a] leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-[#8b8baa] text-sm">
      <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin-slow" />
      Loading pipeline run…
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────
function AnalysisPanel({ analysis }: { analysis: Record<string, unknown> }) {
  const entities: string[] = Array.isArray(analysis.entities) ? analysis.entities.map(String) : [];
  const platforms: string[] = Array.isArray(analysis.platforms) ? analysis.platforms.map(String) : [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="label mb-1">Summary</p>
            <p className="text-sm text-[#f0f0f8] leading-relaxed">
              {(analysis.summary as string) || '—'}
            </p>
          </div>
          <SeverityBadge value={analysis.severity as string} />
        </div>

        <div className="divider pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Pill label="Category" value={(analysis.category as string)?.replace('_', ' ')} />
          <Pill label="Sentiment" value={analysis.sentiment as string} />
          <Pill label="Sentiment Score" value={typeof analysis.sentiment_score === 'number' ? (analysis.sentiment_score as number).toFixed(2) : '—'} color="violet" />
          <Pill label="Confidence" value={typeof analysis.category_confidence === 'number' ? (analysis.category_confidence as number).toFixed(2) : '—'} color="violet" />
        </div>
      </div>

      {/* Entities */}
      {(entities.length > 0 || platforms.length > 0) && (
        <div className="card space-y-3">
          <p className="text-sm font-medium text-[#f0f0f8]">Extracted Entities</p>
          {entities.length > 0 && (
            <div>
              <p className="label mb-1.5">Product Entities</p>
              <div className="flex flex-wrap gap-1.5">
                {entities.map((e, i) => (
                  <span key={i} className="badge-medium">{e}</span>
                ))}
              </div>
            </div>
          )}
          {platforms.length > 0 && (
            <div>
              <p className="label mb-1.5">Platforms</p>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p, i) => (
                  <span key={i} className="badge-violet">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Needs review warning */}
      {Boolean(analysis.needs_review) && (
        <div className="card-sm border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-400">Low confidence — manual review recommended</p>
        </div>
      )}

      <details className="card-sm">
        <summary className="text-xs text-[#4a4a6a] cursor-pointer hover:text-[#8b8baa] transition-colors">
          Raw JSON output
        </summary>
        <div className="mt-3"><JsonViewer data={analysis} /></div>
      </details>
    </div>
  );
}

function PrioritizationPanel({ prioritization }: { prioritization: Record<string, unknown> }) {
  const items: Record<string, unknown>[] = Array.isArray(prioritization.prioritized_items) ? prioritization.prioritized_items : [];

  return (
    <div className="space-y-4 animate-fade-in">
      {items.map((item, idx) => (
        <div key={idx} className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SeverityBadge value={item.urgency as string} />
                <p className="mono text-[#4a4a6a]">{item.feedback_id as string}</p>
              </div>
              <p className="text-xs text-[#8b8baa]">{item.business_justification as string}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-violet-400">{item.rice_score as number}</p>
              <p className="text-xs text-[#4a4a6a]">RICE score</p>
            </div>
          </div>

          {/* RICE breakdown */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Reach', value: item.reach },
              { label: 'Impact', value: item.impact },
              { label: 'Confidence', value: (item.confidence as number)?.toFixed?.(1) },
              { label: 'Effort', value: item.effort },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#09090f] rounded-lg p-3 text-center border border-[#2a2a3a]">
                <p className="label mb-1">{label}</p>
                <p className="text-base font-semibold text-[#f0f0f8]">{value as string}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {Boolean(item.revenue_risk) && <span className="badge-critical">Revenue Risk</span>}
            {Boolean(item.retention_risk) && <span className="badge-high">Retention Risk</span>}
            <span className="badge-violet">
              {(item.recommended_action as string)?.replace(/_/g, ' ')}
            </span>
            <span className="badge">
              impact: {item.business_impact as string}
            </span>
          </div>
        </div>
      ))}

      {(prioritization.ranking_rationale as string) && (
        <div className="card-sm space-y-1">
          <p className="label">Ranking Rationale</p>
          <p className="text-sm text-[#8b8baa]">{prioritization.ranking_rationale as string}</p>
        </div>
      )}

      <details className="card-sm">
        <summary className="text-xs text-[#4a4a6a] cursor-pointer hover:text-[#8b8baa] transition-colors">
          Raw JSON output
        </summary>
        <div className="mt-3"><JsonViewer data={prioritization} /></div>
      </details>
    </div>
  );
}

function PlanningPanel({ planning }: { planning: Record<string, unknown> }) {
  const tasks: Record<string, unknown>[] = Array.isArray(planning.tasks) ? planning.tasks : [];
  const totalPoints = planning.total_story_points as number;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-violet-400">{tasks.length}</p>
          <p className="label mt-1">Tasks</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalPoints || 0}</p>
          <p className="label mt-1">Story Points</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-sm font-semibold text-amber-400 mt-1">{planning.sprint_recommendation as string || '—'}</p>
          <p className="label mt-1">Sprint Estimate</p>
        </div>
      </div>

      {/* Tasks */}
      {tasks.map((task, idx) => {
        const criteria: string[] = Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria.map(String) : [];
        return (
          <div key={idx} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge value={task.priority as string} />
                <p className="mono text-[#4a4a6a]">{task.task_id as string}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge">{task.effort_estimate as string}</span>
                <span className="badge-violet">{task.story_points as number}pt</span>
              </div>
            </div>

            <p className="text-sm font-medium text-[#f0f0f8]">{task.title as string}</p>
            <p className="text-xs text-[#8b8baa] leading-relaxed">{task.description as string}</p>

            <details>
              <summary className="text-xs text-[#4a4a6a] cursor-pointer hover:text-[#8b8baa] transition-colors">
                Technical approach
              </summary>
              <pre className="mt-2 text-xs text-[#8b8baa] whitespace-pre-wrap font-mono leading-relaxed bg-[#09090f] rounded-lg p-3 border border-[#2a2a3a]">
                {task.technical_approach as string}
              </pre>
            </details>

            {criteria.length > 0 && (
              <div>
                <p className="label mb-1.5">Acceptance Criteria</p>
                <ul className="space-y-1">
                  {criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#8b8baa]">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Release Notes */}
      {(planning.release_notes as string) && (
        <div className="card space-y-3">
          <p className="text-sm font-medium text-[#f0f0f8]">Release Notes Preview</p>
          <div className="bg-[#09090f] rounded-lg p-4 border border-[#2a2a3a]">
            <pre className="text-xs text-[#8b8baa] whitespace-pre-wrap font-mono leading-relaxed">
              {planning.release_notes as string}
            </pre>
          </div>
          {(planning.release_summary as string) && (
            <p className="text-xs text-[#4a4a6a]">{planning.release_summary as string}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
import { ReplayProvider } from '@/components/replay/ReplayProvider';
import { WatchAIThink } from '@/components/replay/WatchAIThink';
import { DEMO_REPLAY_STEPS } from '@/lib/replayData';

export default function PipelineDetailPage() {
  const { id } = useParams();
  const [run, setRun] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'analysis' | 'prioritization' | 'planning'>('analysis');
  const [watchMode, setWatchMode] = useState<'live' | 'replay' | null>(null);

  const fetchRun = async () => {
    try {
      const res = await fetch(`${API}/pipeline/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data);
        if (data.status !== 'running') setLoading(false);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
    // Poll while running
    const interval = setInterval(() => {
      if (run?.status === 'running' || !run) fetchRun();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, run?.status]);

  if (loading && !run) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/" className="text-xs text-[#4a4a6a] hover:text-[#8b8baa] transition-colors">← Dashboard</Link>
        <p className="text-sm text-[#8b8baa]">Pipeline run not found.</p>
      </div>
    );
  }

  const tabs = [
    { key: 'analysis' as const,       label: '1. Analysis',         ready: !!run.analysis },
    { key: 'prioritization' as const, label: '2. Prioritization',   ready: !!run.prioritization },
    { key: 'planning' as const,       label: '3. Engineering Plan',  ready: !!run.planning },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Overlay */}
      {watchMode && (
        <ReplayProvider initialSteps={watchMode === 'replay' ? DEMO_REPLAY_STEPS : []}>
          <WatchAIThink 
            mode={watchMode} 
            runId={typeof id === 'string' ? id : undefined} 
            onClose={() => setWatchMode(null)} 
          />
        </ReplayProvider>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-[#4a4a6a] hover:text-[#8b8baa] transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-[#f0f0f8] mt-1">Pipeline Run</h1>
          <p className="mono text-[#4a4a6a] mt-0.5">{run.run_id}</p>
        </div>
        <div className="text-right shrink-0">
          <div>
            {run.status === 'completed' && <span className="badge-success">completed</span>}
            {run.status === 'failed'    && <span className="badge-critical">failed</span>}
            {run.status === 'running'   && <span className="badge-running">running</span>}
          </div>
          {run.duration_ms != null && (
            <p className="text-xs text-[#4a4a6a] mt-1">{(run.duration_ms / 1000).toFixed(2)}s</p>
          )}
          <p className="text-xs text-[#4a4a6a]">{run.input_source}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {run.status === 'running' && (
          <button 
            onClick={() => setWatchMode('live')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-sm font-medium transition-colors border border-violet-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-dot" />
            Watch Live Execution
          </button>
        )}
        <button 
          onClick={() => setWatchMode('replay')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a26] text-[#f0f0f8] hover:bg-[#2a2a3a] text-sm font-medium transition-colors border border-[#2a2a3a]"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Replay Demo Sequence
        </button>
      </div>

      {/* Running state */}
      {run.status === 'running' && (
        <div className="card-sm border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
          <div className="dot-running" />
          <div>
            <p className="text-sm text-amber-400 font-medium">Pipeline running</p>
            <p className="text-xs text-[#8b8baa] mt-0.5">Agents are processing feedback — results will appear below</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {run.status === 'failed' && run.error_message && (
        <div className="card-sm border-red-500/20 bg-red-500/5">
          <p className="text-xs text-[#4a4a6a] mb-1">Error</p>
          <p className="text-sm text-red-400">{run.error_message}</p>
        </div>
      )}

      {/* Tab navigation */}
      {run.status === 'completed' && (
        <>
          <div className="flex border-b border-[#2a2a3a] gap-1 -mb-6">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={tab === t.key ? 'tab-active' : 'tab'}
              >
                {t.label}
                {!t.ready && <span className="ml-1 text-[#4a4a6a]">·</span>}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {tab === 'analysis'       && run.analysis       && <AnalysisPanel       analysis={run.analysis} />}
            {tab === 'prioritization' && run.prioritization && <PrioritizationPanel prioritization={run.prioritization} />}
            {tab === 'planning'       && run.planning        && <PlanningPanel       planning={run.planning} />}

            {tab === 'analysis'       && !run.analysis       && <p className="text-sm text-[#4a4a6a]">Analysis output not available.</p>}
            {tab === 'prioritization' && !run.prioritization && <p className="text-sm text-[#4a4a6a]">Prioritization output not available.</p>}
            {tab === 'planning'       && !run.planning       && <p className="text-sm text-[#4a4a6a]">Planning output not available.</p>}
          </div>
        </>
      )}
    </div>
  );
}
