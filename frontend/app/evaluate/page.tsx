'use client';
import { useState, useEffect } from 'react';

import { API_BASE as API } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EvalHistory {
  eval_id: string;
  created_at: string;
  overall_score: number | null;
  analysis_score: number | null;
  prioritization_score: number | null;
  planning_score: number | null;
  test_cases_total: number;
  test_cases_passed: number;
}

interface TestDetail {
  test_id: string;
  description: string;
  input: string;
  passed: boolean;
  analysis_score: number;
  prioritization_score: number;
  planning_score: number;
  overall_score: number;
  analysis_details?: Record<string, unknown>;
  prioritization_details?: Record<string, unknown>;
  planning_details?: Record<string, unknown>;
  error?: string;
}

interface EvalResult {
  eval_id: string;
  test_cases_total: number;
  test_cases_passed: number;
  analysis_score: number | null;
  prioritization_score: number | null;
  planning_score: number | null;
  overall_score: number | null;
  details: TestDetail[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBar({ score, label }: { score: number | null; label: string }) {
  const pct = score != null ? Math.round((score / 5) * 100) : 0;
  const color =
    pct >= 70 ? 'bg-emerald-500' :
    pct >= 40 ? 'bg-amber-500'  : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#8b8baa]">{label}</span>
        <span className="text-sm font-semibold text-[#f0f0f8]">
          {score != null ? `${score.toFixed(2)}/5` : '—'}
        </span>
      </div>
      <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ScoreChip({ value }: { value: number | undefined }) {
  if (value == null) return <span className="text-[#4a4a6a]">—</span>;
  const color =
    value >= 4 ? 'text-emerald-400' :
    value >= 3 ? 'text-amber-400'   : 'text-red-400';
  return <span className={`font-mono text-xs font-medium ${color}`}>{value.toFixed(1)}</span>;
}

function PassRateBar({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#8b8baa]">{passed}/{total} tests passed</span>
        <span className="text-xs font-medium text-[#f0f0f8]">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EvaluatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [history, setHistory] = useState<EvalHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/evaluate`);
      if (res.ok) setHistory(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchHistory(); }, []);

  const runEvaluation = async (subset?: string[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_subset: subset ?? null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(body.detail || 'Evaluation failed');
      }
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#f0f0f8]">Evaluation</h1>
          <p className="text-sm text-[#8b8baa] mt-1">
            LLM-as-judge framework — 15 hand-crafted test cases across all feedback categories and severity levels.
          </p>
        </div>
        <button
          onClick={() => runEvaluation()}
          disabled={loading}
          className="btn-primary shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
              Running…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run All Tests
            </>
          )}
        </button>
      </div>

      {/* Info card */}
      {!result && !loading && (
        <div className="card-sm bg-violet-500/5 border-violet-500/20 space-y-3">
          <p className="text-sm font-medium text-violet-300">How evaluation works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Run pipeline', desc: 'Each test case runs through the full 3-agent pipeline' },
              { step: '2', label: 'Judge with Gemini', desc: 'LLM-as-judge scores each stage: Analysis, Prioritization, Planning' },
              { step: '3', label: 'Aggregate scores', desc: 'Results averaged across all 15 test cases, score range 1–5' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#f0f0f8]">{s.label}</p>
                  <p className="text-xs text-[#8b8baa] mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4a4a6a]">⚠ Running all 15 tests calls Gemini ~45 times and takes 2–5 minutes.</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin-slow" />
            <p className="text-sm text-[#f0f0f8] font-medium">Running evaluation…</p>
          </div>
          <p className="text-xs text-[#8b8baa]">
            Executing 15 test cases through the pipeline and scoring with LLM-as-judge.
            This will take 2–5 minutes. Please wait.
          </p>
          <div className="h-1 bg-[#2a2a3a] rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full animate-pulse w-1/3" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card-sm border-red-500/20 bg-red-500/5">
          <p className="text-xs text-[#4a4a6a] mb-1">Error</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Score overview */}
          <div className="card space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-[#f0f0f8]">Evaluation Results</h2>
                <p className="text-xs text-[#4a4a6a] mt-0.5 mono">{result.eval_id}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-400">
                  {result.overall_score?.toFixed(2)}
                  <span className="text-base text-[#4a4a6a] font-normal">/5</span>
                </p>
                <p className="text-xs text-[#4a4a6a] mt-0.5">Overall Score</p>
              </div>
            </div>

            <PassRateBar passed={result.test_cases_passed} total={result.test_cases_total} />

            <div className="space-y-3 pt-2 border-t border-[#2a2a3a]">
              <ScoreBar score={result.analysis_score}       label="Analysis Quality (Feedback Analyzer)" />
              <ScoreBar score={result.prioritization_score} label="Prioritization Quality (Business Prioritizer)" />
              <ScoreBar score={result.planning_score}       label="Planning Quality (Engineering Planner)" />
            </div>
          </div>

          {/* Per-test results */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#f0f0f8]">Test Case Results</h3>
              <div className="flex items-center gap-3 text-xs text-[#4a4a6a]">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Pass</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Fail</span>
                <span>A / P / E = Analysis / Prioritization / Engineering</span>
              </div>
            </div>
            <div className="divide-y divide-[#2a2a3a]">
              {result.details.map((detail) => (
                <div key={detail.test_id}>
                  <button
                    onClick={() => setExpandedTest(expandedTest === detail.test_id ? null : detail.test_id)}
                    className="w-full flex items-start justify-between px-5 py-3.5 hover:bg-[#1a1a26] transition-colors text-left"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${detail.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="mono text-[#f0f0f8]">{detail.test_id}</span>
                          <span className="text-xs text-[#8b8baa] truncate">{detail.description}</span>
                        </div>
                        <p className="text-xs text-[#4a4a6a] mt-0.5 truncate max-w-sm">
                          &ldquo;{detail.input}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="flex items-center gap-1.5">
                        <ScoreChip value={detail.analysis_score} />
                        <span className="text-[#2a2a3a]">/</span>
                        <ScoreChip value={detail.prioritization_score} />
                        <span className="text-[#2a2a3a]">/</span>
                        <ScoreChip value={detail.planning_score} />
                      </div>
                      <svg className={`w-4 h-4 text-[#4a4a6a] transition-transform duration-150 ${expandedTest === detail.test_id ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {expandedTest === detail.test_id && (
                    <div className="px-5 pb-4 space-y-3 bg-[#0d0d14] border-t border-[#2a2a3a] animate-fade-in">
                      <div className="pt-3 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Analysis', details: detail.analysis_details },
                          { label: 'Prioritization', details: detail.prioritization_details },
                          { label: 'Planning', details: detail.planning_details },
                        ].map(({ label, details }) => details && (
                          <div key={label} className="card-sm space-y-1.5">
                            <p className="label">{label}</p>
                            {(details.reasoning as string) && (
                              <p className="text-xs text-[#8b8baa] leading-relaxed">
                                {details.reasoning as string}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {detail.error && (
                        <div className="card-sm border-red-500/20 bg-red-500/5">
                          <p className="text-xs text-red-400">Error: {detail.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {!result && history.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a3a]">
            <h2 className="text-sm font-medium text-[#f0f0f8]">Evaluation History</h2>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {history.map((h) => (
              <div key={h.eval_id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="mono text-[#f0f0f8]">{h.eval_id.slice(0, 12)}…</p>
                  <p className="text-xs text-[#4a4a6a] mt-0.5">
                    {new Date(h.created_at).toLocaleString()} · {h.test_cases_passed}/{h.test_cases_total} passed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-violet-400">
                    {h.overall_score?.toFixed(2) ?? '—'}
                    <span className="text-xs text-[#4a4a6a] font-normal">/5</span>
                  </p>
                  <div className="flex gap-1 mt-0.5 justify-end">
                    <ScoreChip value={h.analysis_score ?? undefined} />
                    <span className="text-[#2a2a3a] text-xs">/</span>
                    <ScoreChip value={h.prioritization_score ?? undefined} />
                    <span className="text-[#2a2a3a] text-xs">/</span>
                    <ScoreChip value={h.planning_score ?? undefined} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
