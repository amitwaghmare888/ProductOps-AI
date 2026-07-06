'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, getStatusVariant } from '@/components/ui/StatusBadge';
import { getPipelineRuns } from '@/lib/api';
import type { PipelineRun } from '@/types/pipeline';

interface AnalyticsSummary {
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  running_runs: number;
  total_feedback_items: number;
  total_engineering_tasks: number;
  avg_duration_ms: number | null;
  top_categories: Array<{ category: string; count: number }>;
}

export default function AnalyticsPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [runsData, analyticsData] = await Promise.all([
        getPipelineRuns(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/summary`)
          .then(res => res.json())
          .catch(() => null)
      ]);
      setRuns(runsData);
      setAnalytics(analyticsData);
    } catch {
      // Fallback to runs-only if analytics fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRuns = analytics?.total_runs || runs.length;
  const completedRuns = analytics?.completed_runs || runs.filter(r => r.status === 'completed').length;
  const failedRuns = analytics?.failed_runs || runs.filter(r => r.status === 'failed').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
  const avgDuration = analytics?.avg_duration_ms || 
    (runs.filter(r => r.duration_ms).reduce((acc, r) => acc + (r.duration_ms || 0), 0) / completedRuns) || 0;

  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Analytics & Insights"
        subtitle="Pipeline performance metrics and historical trends"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
            Loading analytics…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <StatCard
                label="Total Runs"
                value={totalRuns}
                icon="analytics"
                trend={totalRuns > 0 ? 'up' : undefined}
              />
              <StatCard
                label="Success Rate"
                value={`${successRate}%`}
                icon="check_circle"
                trend={successRate >= 80 ? 'up' : successRate >= 50 ? undefined : 'down'}
              />
              <StatCard
                label="Avg Duration"
                value={`${(avgDuration / 1000).toFixed(1)}s`}
                icon="schedule"
              />
              <StatCard
                label="Failed"
                value={failedRuns}
                icon="error"
                trend={failedRuns > 0 ? 'down' : undefined}
              />
            </div>

            <BentoCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-headline-md text-headline-md text-on-surface">
                    Run History
                  </p>
                  <p className="text-body-base text-on-surface-variant mt-1">
                    Recent pipeline executions
                  </p>
                </div>
              </div>

              {runs.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
                    analytics
                  </span>
                  <p className="text-body-base text-on-surface-variant">
                    No pipeline runs yet. Launch your first pipeline to see analytics.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {runs.slice(0, 10).map((run, idx) => (
                    <motion.div
                      key={run.run_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <StatusBadge
                          variant={getStatusVariant(run.status)}
                          label={run.status}
                          pulse={run.status === 'running'}
                        />
                        <div className="min-w-0">
                          <p className="font-code-block text-code-block font-mono text-on-surface truncate">
                            {run.run_id}
                          </p>
                          <p className="text-body-base text-on-surface-variant text-xs mt-0.5">
                            {new Date(run.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        {run.duration_ms != null && (
                          <div className="text-right">
                            <p className="font-body-bold text-on-surface">
                              {(run.duration_ms / 1000).toFixed(1)}s
                            </p>
                            <p className="font-label-caps text-label-caps text-on-surface-variant">
                              DURATION
                            </p>
                          </div>
                        )}
                        <span className="badge-primary text-xs">Complete</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </BentoCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              <BentoCard>
                <p className="font-headline-sm text-headline-sm text-on-surface mb-4">
                  Status Distribution
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-base text-on-surface-variant">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-body-bold text-on-surface w-12 text-right">{completedRuns}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-base text-on-surface-variant">Failed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div
                          className="h-full bg-error rounded-full"
                          style={{ width: `${totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-body-bold text-on-surface w-12 text-right">{failedRuns}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-base text-on-surface-variant">Running</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${totalRuns > 0 ? (runs.filter(r => r.status === 'running').length / totalRuns) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-body-bold text-on-surface w-12 text-right">
                        {runs.filter(r => r.status === 'running').length}
                      </span>
                    </div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard>
                <p className="font-headline-sm text-headline-sm text-on-surface mb-4">
                  Performance Insights
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">speed</span>
                    </div>
                    <div>
                      <p className="font-body-bold text-on-surface">
                        {avgDuration > 0 ? `${(avgDuration / 1000).toFixed(1)}s average` : 'No data'}
                      </p>
                      <p className="text-body-base text-on-surface-variant text-xs">
                        Pipeline execution time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400">trending_up</span>
                    </div>
                    <div>
                      <p className="font-body-bold text-on-surface">{successRate}% success rate</p>
                      <p className="text-body-base text-on-surface-variant text-xs">
                        Reliability metric
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary">psychology</span>
                    </div>
                    <div>
                      <p className="font-body-bold text-on-surface">3 agents per run</p>
                      <p className="text-body-base text-on-surface-variant text-xs">
                        Sequential execution
                      </p>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </div>
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
