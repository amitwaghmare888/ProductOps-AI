'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getEvaluationHistory,
  runEvaluation as runEvaluationApi,
  getErrorMessage,
} from '@/lib/api';
import { formatDateTimeFull } from '@/lib/utils/date';
import type { EvalHistory, EvalResult } from '@/types/evaluation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';

function ScoreBar({ score, label }: { score: number | null; label: string }) {
  const pct = score != null ? Math.round((score / 5) * 100) : 0;
  const color =
    pct >= 70 ? 'bg-emerald-400' :
    pct >= 40 ? 'bg-amber-400'  : 'bg-error';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
        <span className="font-body-bold text-on-surface">
          {score != null ? `${score.toFixed(2)}/5` : '—'}
        </span>
      </div>
      <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

function ScoreChip({ value }: { value: number | undefined }) {
  if (value == null) return <span className="text-on-surface-variant/50">—</span>;
  const color =
    value >= 4 ? 'text-emerald-400' :
    value >= 3 ? 'text-amber-400'   : 'text-error';
  return <span className={`font-mono text-xs font-semibold ${color}`}>{value.toFixed(1)}</span>;
}

function PassRateBar({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {passed}/{total} tests passed
        </span>
        <span className="font-body-bold text-on-surface">{pct}%</span>
      </div>
      <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
}

export default function EvaluatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [history, setHistory] = useState<EvalHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getEvaluationHistory();
      setHistory(data);
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const runEvaluation = useCallback(async (subset?: string[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runEvaluationApi({ test_subset: subset ?? null });
      setResult(data);
      fetchHistory();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="AI Evaluation Suite"
        subtitle="LLM-as-judge framework — 15 hand-crafted test cases across all feedback categories"
        action={
          <button onClick={() => runEvaluation()} disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                Running…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Run All Tests
              </>
            )}
          </button>
        }
      >
        {!result && !loading && (
          <BentoCard className="bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-primary">science</span>
              </div>
              <div className="space-y-3 flex-1">
                <p className="font-headline-sm text-headline-sm text-on-surface">How Evaluation Works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '1', label: 'Run pipeline', desc: 'Each test case runs through the full 3-agent pipeline', icon: 'route' },
                    { step: '2', label: 'Judge with Gemini', desc: 'LLM-as-judge scores each stage: Analysis, Prioritization, Planning', icon: 'gavel' },
                    { step: '3', label: 'Aggregate scores', desc: 'Results averaged across all 15 test cases, score range 1–5', icon: 'analytics' },
                  ].map(s => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-base text-on-primary">{s.icon}</span>
                      </div>
                      <div>
                        <p className="font-body-bold text-on-surface">{s.label}</p>
                        <p className="text-body-base text-on-surface-variant mt-1">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-body-base text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                  Running all 15 tests calls Gemini ~45 times and takes 2–5 minutes.
                </p>
              </div>
            </div>
          </BentoCard>
        )}

        {loading && (
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
              <div>
                <p className="font-body-bold text-on-surface">Running evaluation…</p>
                <p className="text-body-base text-on-surface-variant mt-1">
                  Executing 15 test cases through the pipeline and scoring with LLM-as-judge. This will take 2–5 minutes.
                </p>
              </div>
            </div>
            <div className="h-2 bg-surface-container-low rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: '30%' }}
                animate={{ width: ['30%', '60%', '30%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </BentoCard>
        )}

        {error && (
          <BentoCard className="bg-error/5 border-error/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-error">error</span>
              <div>
                <p className="font-body-bold text-error">Evaluation Failed</p>
                <p className="text-body-base text-on-surface-variant">{error}</p>
              </div>
            </div>
          </BentoCard>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-gutter"
          >
            <BentoCard>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="font-headline-md text-headline-md text-on-surface">Evaluation Results</p>
                  <p className="font-code-block text-code-block font-mono text-on-surface-variant mt-1">
                    {result.eval_id}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-stat-xl text-stat-xl text-primary">
                    {result.overall_score?.toFixed(2)}
                    <span className="text-stat-lg text-on-surface-variant font-normal">/5</span>
                  </p>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">OVERALL SCORE</p>
                </div>
              </div>

              <PassRateBar passed={result.test_cases_passed} total={result.test_cases_total} />

              <div className="space-y-4 pt-6 border-t border-outline-variant/30 mt-6">
                <ScoreBar score={result.analysis_score} label="Analysis Quality (Feedback Analyzer)" />
                <ScoreBar score={result.prioritization_score} label="Prioritization Quality (Business Prioritizer)" />
                <ScoreBar score={result.planning_score} label="Planning Quality (Engineering Planner)" />
              </div>
            </BentoCard>

            <BentoCard className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                <p className="font-headline-sm text-headline-sm text-on-surface">Test Case Results</p>
                <div className="flex items-center gap-3 text-body-base text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Pass
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    Fail
                  </span>
                  <span>A / P / E = Analysis / Prioritization / Engineering</span>
                </div>
              </div>
              <div className="divide-y divide-outline-variant/30">
                {result.details.map((detail) => (
                  <div key={detail.test_id}>
                    <button
                      onClick={() => setExpandedTest(expandedTest === detail.test_id ? null : detail.test_id)}
                      className="w-full flex items-start justify-between px-6 py-4 hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${detail.passed ? 'bg-emerald-400' : 'bg-error'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-code-block text-code-block font-mono text-on-surface">{detail.test_id}</span>
                            <span className="text-body-base text-on-surface-variant truncate">{detail.description}</span>
                          </div>
                          <p className="text-body-base text-on-surface-variant/70 mt-1 truncate max-w-md">
                            &ldquo;{detail.input}&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <div className="flex items-center gap-2">
                          <ScoreChip value={detail.analysis_score} />
                          <span className="text-outline-variant">/</span>
                          <ScoreChip value={detail.prioritization_score} />
                          <span className="text-outline-variant">/</span>
                          <ScoreChip value={detail.planning_score} />
                        </div>
                        <span
                          className={`material-symbols-outlined text-base text-on-surface-variant transition-transform duration-200 ${
                            expandedTest === detail.test_id ? 'rotate-90' : ''
                          }`}
                        >
                          chevron_right
                        </span>
                      </div>
                    </button>

                    {expandedTest === detail.test_id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-4 bg-surface-container border-t border-outline-variant/30"
                      >
                        <div className="pt-4 grid grid-cols-3 gap-4">
                          {[
                            { label: 'Analysis', details: detail.analysis_details },
                            { label: 'Prioritization', details: detail.prioritization_details },
                            { label: 'Planning', details: detail.planning_details },
                          ].map(({ label, details }) => details && (
                            <div key={label} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2">
                              <p className="font-label-caps text-label-caps text-on-surface-variant">{label.toUpperCase()}</p>
                              {(details.reasoning as string) && (
                                <p className="text-body-base text-on-surface-variant leading-relaxed">
                                  {details.reasoning as string}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        {detail.error && (
                          <div className="mt-4 p-4 rounded-lg bg-error/5 border border-error/20">
                            <p className="text-body-base text-error">Error: {detail.error}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </BentoCard>
          </motion.div>
        )}

        {!result && history.length > 0 && (
          <BentoCard className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30">
              <p className="font-headline-sm text-headline-sm text-on-surface">Evaluation History</p>
            </div>
            <div className="divide-y divide-outline-variant/30">
              {history.map((h) => (
                <div key={h.eval_id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-code-block text-code-block font-mono text-on-surface">{h.eval_id.slice(0, 12)}…</p>
                    <p className="text-body-base text-on-surface-variant mt-1">
                      {formatDateTimeFull(h.created_at)} · {h.test_cases_passed}/{h.test_cases_total} passed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-stat-lg text-stat-lg text-primary">
                      {h.overall_score?.toFixed(2) ?? '—'}
                      <span className="text-body-base text-on-surface-variant font-normal">/5</span>
                    </p>
                    <div className="flex gap-2 mt-1 justify-end">
                      <ScoreChip value={h.analysis_score ?? undefined} />
                      <span className="text-outline-variant text-xs">/</span>
                      <ScoreChip value={h.prioritization_score ?? undefined} />
                      <span className="text-outline-variant text-xs">/</span>
                      <ScoreChip value={h.planning_score ?? undefined} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        )}
      </PageContainer>
    </AppLayout>
  );
}
