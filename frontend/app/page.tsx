'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePolling } from '@/hooks';
import {
  getPipelineRuns,
  createPipelineRun,
  uploadFeedbackFile,
  getErrorMessage,
} from '@/lib/api';
import { formatDateTime } from '@/lib/utils/date';
import type { PipelineRun } from '@/types/pipeline';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, getStatusVariant } from '@/components/ui/StatusBadge';

export default function MissionControlPage() {
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const data = await getPipelineRuns();
      setRuns(data);
    } catch {
      // Silently ignore network errors during polling
    }
  }, []);

  const hasActiveRun = runs.some(r => r.status === 'running');
  const isInitialLoad = runs.length === 0;
  usePolling(fetchRuns, 4000, hasActiveRun || isInitialLoad);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await createPipelineRun({
        feedback_text: feedbackText.trim(),
        source: 'manual',
      });
      setFeedbackText('');
      fetchRuns();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [feedbackText, loading, fetchRuns]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      await uploadFeedbackFile(file);
      fetchRuns();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [loading, fetchRuns]);

  const completedRuns = runs.filter(r => r.status === 'completed').length;
  const runningRuns = runs.filter(r => r.status === 'running').length;
  const avgDuration = runs.filter(r => r.duration_ms).reduce((acc, r) => acc + (r.duration_ms || 0), 0) / (runs.filter(r => r.duration_ms).length || 1);

  return (
    <AppLayout title="ProductOps AI" onNewPipeline={() => {}}>
      <PageContainer
        title="Mission Control"
        subtitle={
          <>
            <StatusBadge 
              variant="success" 
              label="Mission Status: Operational" 
              icon="check_circle"
            />
            <span className="font-label-caps opacity-50">T-MINUS 00:00:00</span>
          </>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-gutter">
          <StatCard
            label="TOTAL RUNS"
            value={runs.length}
            icon="rocket_launch"
          />
          <StatCard
            label="COMPLETED"
            value={completedRuns}
            icon="check_circle"
            trend={<span className="text-emerald-400">↑ {completedRuns > 0 ? Math.round((completedRuns / runs.length) * 100) : 0}%</span>}
          />
          <StatCard
            label="AVG DURATION"
            value={`${(avgDuration / 1000).toFixed(1)}s`}
            icon="schedule"
          />
        </div>

        {/* Input Form */}
        <BentoCard className="mb-gutter">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Launch New Pipeline
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Upload CSV / JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">
                CUSTOMER FEEDBACK INPUT
              </label>
              <textarea
                className="input font-mono resize-none"
                rows={6}
                placeholder="Paste customer feedback here. Examples:&#10;&#10;&quot;App crashes every time I export to PDF on iOS 17. Critical issue.&quot;&#10;&quot;Would love dark mode. Not urgent but would use it daily.&quot;"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-error/10 text-error rounded-lg border border-error/20"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="text-body-base">{error}</span>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-body-base text-on-surface-variant">
                {feedbackText.length > 0 ? `${feedbackText.length} characters` : 'Minimum 10 characters required'}
              </p>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || feedbackText.trim().length < 10}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                    Launching...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Launch Pipeline
                  </>
                )}
              </button>
            </div>
          </form>
        </BentoCard>

        {/* Active Pipeline Indicator */}
        {runningRuns > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card bg-amber-400/5 border-amber-400/20 mb-gutter"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-amber-400">
                    settings
                  </span>
                </div>
                <div>
                  <p className="font-body-bold text-on-surface">
                    {runningRuns} Pipeline{runningRuns > 1 ? 's' : ''} Running
                  </p>
                  <p className="text-body-base text-on-surface-variant">
                    Processing feedback through AI agents...
                  </p>
                </div>
              </div>
              <div className="dot-warning" />
            </div>
          </motion.div>
        )}

        {/* Pipeline Runs List */}
        <BentoCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Recent Pipeline Runs
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {runs.length} TOTAL
            </span>
          </div>

          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                  inbox
                </span>
              </div>
              <p className="font-body-bold text-on-surface mb-2">No pipeline runs yet</p>
              <p className="text-body-base text-on-surface-variant">
                Launch your first pipeline above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run, index) => (
                <motion.div
                  key={run.run_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/pipeline/${run.run_id}`}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-container-high transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={
                        run.status === 'running' ? 'dot-warning' :
                        run.status === 'completed' ? 'dot-success' :
                        'dot-error'
                      } />
                      <div className="min-w-0 flex-1">
                        <p className="font-code-block text-code-block text-on-surface font-mono truncate">
                          {run.run_id}
                        </p>
                        <p className="text-body-base text-on-surface-variant mt-1">
                          {run.input_source} · {formatDateTime(run.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <StatusBadge
                        variant={getStatusVariant(run.status)}
                        label={run.status}
                      />
                      {run.duration_ms != null && (
                        <span className="text-body-base text-on-surface-variant font-mono">
                          {(run.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Architecture Info */}
        <BentoCard className="bg-primary/5 border-primary/20 mt-gutter">
          <p className="font-label-caps text-label-caps text-primary mb-3">
            SYSTEM ARCHITECTURE
          </p>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {[
              'ADK SequentialAgent',
              'LlmAgent ×3',
              'FunctionTool ×9',
              'MCP Server',
              'Session State',
              'SQLite Memory',
            ].map(tag => (
              <span key={tag} className="badge-primary text-xs">{tag}</span>
            ))}
          </div>
          <p className="text-body-base text-on-surface-variant">
            Feedback Analyzer → Business Prioritizer → Engineering Planner
          </p>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}
