'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePolling } from '@/hooks';
import { getPipelineRun } from '@/lib/api';
import type { PipelineResult } from '@/types/pipeline';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { AgentCard } from '@/components/ui/AgentCard';
import { StatusBadge, getStatusVariant } from '@/components/ui/StatusBadge';
import { getSeverityVariant, getPriorityVariant } from '@/components/ui/Badge';
import { TerminalBlock } from '@/components/ui/TerminalBlock';

function Pill({ label, value, color = 'default' }: { label: string; value: string | number | undefined; color?: string }) {
  const colorMap: Record<string, string> = {
    default: 'text-on-surface',
    violet: 'text-primary',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-error',
  };
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-label-caps text-label-caps text-on-surface-variant">{label}</p>
      <p className={`font-body-bold text-body-bold ${colorMap[color] || colorMap.default}`}>{value ?? '—'}</p>
    </div>
  );
}

function SeverityBadge2({ value }: { value?: string }) {
  const variant = getSeverityVariant(value);
  if (!variant || !value) return null;
  return <span className={`badge badge-${variant}`}>{value}</span>;
}

function PriorityBadge2({ value }: { value?: string }) {
  const variant = getPriorityVariant(value);
  if (!variant || !value) return null;
  return <span className={`badge badge-${variant}`}>{value}</span>;
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <TerminalBlock>
      <pre className="text-emerald-400 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </TerminalBlock>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant text-body-base">
      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
      Loading pipeline run…
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: Record<string, unknown> }) {
  const entities = (analysis.entities as string[]) || [];
  const platforms = (analysis.platforms as string[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <AgentCard
        name="Feedback Analyzer"
        type="alpha"
        icon="psychology"
        status="idle"
      >
        <div className="space-y-4">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
              SUMMARY
            </p>
            <p className="text-body-base text-on-surface leading-relaxed">
              {(analysis.summary as string) || '—'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Pill label="CATEGORY" value={(analysis.category as string)?.replace('_', ' ')} />
            <Pill label="SENTIMENT" value={analysis.sentiment as string} />
            <Pill label="SCORE" value={typeof analysis.sentiment_score === 'number' ? (analysis.sentiment_score as number).toFixed(2) : '—'} color="violet" />
            <Pill label="SEVERITY" value={analysis.severity as string} color="amber" />
          </div>

          {(entities.length > 0 || platforms.length > 0) && (
            <div className="space-y-3">
              {entities.length > 0 && (
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                    ENTITIES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entities.map((e, i) => (
                      <span key={i} className="badge-secondary text-xs">{e}</span>
                    ))}
                  </div>
                </div>
              )}
              {platforms.length > 0 && (
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                    PLATFORMS
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {platforms.map((p, i) => (
                      <span key={i} className="badge-primary text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AgentCard>

      <details className="bento-card">
        <summary className="font-label-caps text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
          RAW JSON OUTPUT
        </summary>
        <div className="mt-4"><JsonViewer data={analysis} /></div>
      </details>
    </motion.div>
  );
}

function PrioritizationPanel({ prioritization }: { prioritization: Record<string, unknown> }) {
  const items = (prioritization.prioritized_items as Record<string, unknown>[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <AgentCard
        name="Business Prioritizer"
        type="network"
        icon="analytics"
        status="idle"
      >
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-3 pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge2 value={item.urgency as string} />
                    <p className="font-code-block text-code-block font-mono text-on-surface-variant">
                      {item.feedback_id as string}
                    </p>
                  </div>
                  <p className="text-body-base text-on-surface-variant">{item.business_justification as string}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-stat-lg text-stat-lg text-primary">{item.rice_score as number}</p>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">RICE</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Reach', value: item.reach },
                  { label: 'Impact', value: item.impact },
                  { label: 'Confidence', value: (item.confidence as number)?.toFixed?.(1) },
                  { label: 'Effort', value: item.effort },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-container-low rounded-lg p-3 text-center border border-outline-variant/30">
                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">{label}</p>
                    <p className="font-body-bold text-on-surface">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AgentCard>

      <details className="bento-card">
        <summary className="font-label-caps text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
          RAW JSON OUTPUT
        </summary>
        <div className="mt-4"><JsonViewer data={prioritization} /></div>
      </details>
    </motion.div>
  );
}

function PlanningPanel({ planning }: { planning: Record<string, unknown> }) {
  const tasks = (planning.tasks as Record<string, unknown>[]) || [];
  const totalPoints = planning.total_story_points as number;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <AgentCard
        name="Engineering Planner"
        type="system"
        icon="engineering"
        status="idle"
      >
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="font-stat-lg text-stat-lg text-primary">{tasks.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">TASKS</p>
          </div>
          <div className="text-center">
            <p className="font-stat-lg text-stat-lg text-emerald-400">{totalPoints || 0}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">POINTS</p>
          </div>
          <div className="text-center">
            <p className="font-body-bold text-amber-400">{planning.sprint_recommendation as string || '—'}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">SPRINT</p>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task, idx) => {
            const criteria = (task.acceptance_criteria as string[]) || [];
            return (
              <div key={idx} className="space-y-3 pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge2 value={task.priority as string} />
                    <p className="font-code-block text-code-block font-mono text-on-surface-variant">
                      {task.task_id as string}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="badge-secondary text-xs">{task.effort_estimate as string}</span>
                    <span className="badge-primary text-xs">{task.story_points as number}pt</span>
                  </div>
                </div>

                <p className="font-body-bold text-on-surface">{task.title as string}</p>
                <p className="text-body-base text-on-surface-variant leading-relaxed">
                  {task.description as string}
                </p>

                {criteria.length > 0 && (
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                      ACCEPTANCE CRITERIA
                    </p>
                    <ul className="space-y-1">
                      {criteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-body-base text-on-surface-variant">
                          <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <details>
                  <summary className="font-label-caps text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
                    TECHNICAL APPROACH
                  </summary>
                  <TerminalBlock>
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {task.technical_approach as string}
                    </pre>
                  </TerminalBlock>
                </details>
              </div>
            );
          })}
        </div>
      </AgentCard>

      {(planning.release_notes as string) && (
        <BentoCard>
          <p className="font-headline-md text-headline-md text-on-surface mb-4">
            Release Notes Preview
          </p>
          <TerminalBlock>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {planning.release_notes as string}
            </pre>
          </TerminalBlock>
        </BentoCard>
      )}

      <details className="bento-card">
        <summary className="font-label-caps text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
          RAW JSON OUTPUT
        </summary>
        <div className="mt-4"><JsonViewer data={planning} /></div>
      </details>
    </motion.div>
  );
}

export default function PipelineDetailPage() {
  const { id } = useParams();
  const [run, setRun] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'analysis' | 'prioritization' | 'planning'>('analysis');

  const fetchRun = useCallback(async () => {
    try {
      const data = await getPipelineRun(id as string);
      setRun(data);
      if (data.status !== 'running') setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [id]);

  const shouldPoll = !run || run.status === 'running';
  usePolling(fetchRun, 3000, shouldPoll);

  if (loading && !run) {
    return (
      <AppLayout title="ProductOps AI">
        <PageContainer>
          <LoadingSpinner />
        </PageContainer>
      </AppLayout>
    );
  }

  if (!run) {
    return (
      <AppLayout title="ProductOps AI">
        <PageContainer>
          <Link href="/" className="text-body-base text-on-surface-variant hover:text-on-surface transition-colors">
            ← Back to Mission Control
          </Link>
          <p className="text-body-base text-on-surface-variant mt-4">Pipeline run not found.</p>
        </PageContainer>
      </AppLayout>
    );
  }

  const tabs = [
    { key: 'analysis' as const, label: '1. Analysis', icon: 'psychology', ready: !!run.analysis },
    { key: 'prioritization' as const, label: '2. Prioritization', icon: 'analytics', ready: !!run.prioritization },
    { key: 'planning' as const, label: '3. Engineering Plan', icon: 'engineering', ready: !!run.planning },
  ];

  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Pipeline Execution"
        subtitle={
          <>
            <StatusBadge
              variant={getStatusVariant(run.status)}
              label={run.status.toUpperCase()}
              pulse={run.status === 'running'}
            />
            <span className="font-code-block text-code-block font-mono text-on-surface-variant">
              {run.run_id}
            </span>
            {run.duration_ms != null && (
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                {(run.duration_ms / 1000).toFixed(2)}s
              </span>
            )}
          </>
        }
        action={
          <Link href="/" className="btn-secondary">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Mission Control
          </Link>
        }
      >
        {run.status === 'running' && (
          <BentoCard className="bg-amber-400/5 border-amber-400/20 mb-gutter">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-amber-400 animate-spin-slow">
                  settings
                </span>
              </div>
              <div>
                <p className="font-body-bold text-on-surface">Pipeline Running</p>
                <p className="text-body-base text-on-surface-variant">
                  Agents are processing feedback — results will appear below
                </p>
              </div>
              <div className="ml-auto dot-warning" />
            </div>
          </BentoCard>
        )}

        {run.status === 'failed' && run.error_message && (
          <BentoCard className="bg-error/5 border-error/20 mb-gutter">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-error">error</span>
              <div>
                <p className="font-body-bold text-error">Pipeline Failed</p>
                <p className="text-body-base text-on-surface-variant">{run.error_message}</p>
              </div>
            </div>
          </BentoCard>
        )}

        {run.status === 'completed' && (
          <>
            <div className="flex gap-2 mb-gutter">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    tab === t.key
                      ? 'flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-body-bold border border-primary/20'
                      : 'flex items-center gap-2 px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors'
                  }
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                  {!t.ready && <span className="opacity-50">·</span>}
                </button>
              ))}
            </div>

            {tab === 'analysis' && run.analysis && <AnalysisPanel analysis={run.analysis} />}
            {tab === 'prioritization' && run.prioritization && <PrioritizationPanel prioritization={run.prioritization} />}
            {tab === 'planning' && run.planning && <PlanningPanel planning={run.planning} />}

            {tab === 'analysis' && !run.analysis && <p className="text-body-base text-on-surface-variant">Analysis output not available.</p>}
            {tab === 'prioritization' && !run.prioritization && <p className="text-body-base text-on-surface-variant">Prioritization output not available.</p>}
            {tab === 'planning' && !run.planning && <p className="text-body-base text-on-surface-variant">Planning output not available.</p>}
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
