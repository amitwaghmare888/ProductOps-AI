'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PipelineRun {
  run_id: string;
  status: 'running' | 'completed' | 'failed';
  created_at: string;
  input_source: string;
  duration_ms: number | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') return <span className="badge-success">completed</span>;
  if (status === 'failed')    return <span className="badge-critical">failed</span>;
  return <span className="badge-running">running</span>;
}

function AgentPipeline({ active }: { active: boolean }) {
  const agents = [
    { name: 'Feedback Analyzer', icon: '🔍' },
    { name: 'Business Prioritizer', icon: '📊' },
    { name: 'Engineering Planner', icon: '⚙️' },
  ];
  return (
    <div className="flex items-center gap-2 mt-3">
      {agents.map((agent, i) => (
        <div key={agent.name} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
            active
              ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
              : 'border-[#2a2a3a] bg-[#0d0d14] text-[#4a4a6a]'
          }`}>
            <span>{agent.icon}</span>
            <span>{agent.name}</span>
            {active && <span className="dot-running ml-1" />}
          </div>
          {i < agents.length - 1 && (
            <svg className={`w-3 h-3 shrink-0 ${active ? 'text-violet-500' : 'text-[#2a2a3a]'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#1a1a26] border border-[#2a2a3a] flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-[#4a4a6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#8b8baa]">No pipeline runs yet</p>
      <p className="text-xs text-[#4a4a6a] mt-1">Submit feedback above to start your first run</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${API}/pipeline`);
      if (res.ok) setRuns(await res.json());
    } catch { /* silently ignore network errors */ }
  };

  useEffect(() => {
    fetchRuns();
    const id = setInterval(fetchRuns, 4000);
    return () => clearInterval(id);
  }, []);

  // When active run completes, clear it
  useEffect(() => {
    if (activeRunId) {
      const run = runs.find(r => r.run_id === activeRunId);
      if (run && run.status !== 'running') {
        setTimeout(() => setActiveRunId(null), 2000);
      }
    }
  }, [runs, activeRunId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_text: feedbackText.trim(), source: 'manual' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(body.detail || 'Failed to start pipeline');
      }
      const data = await res.json();
      setActiveRunId(data.run_id);
      setFeedbackText('');
      fetchRuns();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/feedback/upload`, { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(body.detail || 'Upload failed');
      }
      const data = await res.json();
      setActiveRunId(data.run_id);
      fetchRuns();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#f0f0f8]">Dashboard</h1>
        <p className="text-sm text-[#8b8baa] mt-1">
          Submit customer feedback — the AI pipeline analyzes, prioritizes, and plans engineering work.
        </p>
      </div>

      {/* Input card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#f0f0f8]">New Pipeline Run</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            className="input font-mono resize-none"
            rows={5}
            placeholder={`Paste customer feedback here. Examples:\n\n"App crashes every time I export to PDF on iOS 17. Critical issue."\n"Would love dark mode. Not urgent but would use it daily."`}
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            disabled={loading}
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#4a4a6a]">
              {feedbackText.length > 0 ? `${feedbackText.length} chars` : 'Tip: Multiple items separated by newlines'}
            </p>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || feedbackText.trim().length < 10}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  Starting...
                </>
              ) : (
                <>
                  Run Pipeline
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Active run indicator */}
        {activeRunId && (
          <div className="border-t border-[#2a2a3a] pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-[#8b8baa]">Pipeline running</p>
                <p className="mono text-[#4a4a6a] mt-0.5">{activeRunId.slice(0, 8)}…</p>
              </div>
              <Link href={`/pipeline/${activeRunId}`} className="btn-primary text-xs px-3 py-1.5">
                View Live →
              </Link>
            </div>
            <AgentPipeline active={true} />
          </div>
        )}
      </div>

      {/* Pipeline runs list */}
      <div className="card space-y-1 p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#f0f0f8]">Recent Runs</h2>
          <span className="text-xs text-[#4a4a6a]">{runs.length} total</span>
        </div>

        {runs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-[#2a2a3a]">
            {runs.map((run) => (
              <Link
                key={run.run_id}
                href={`/pipeline/${run.run_id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#1a1a26] transition-colors duration-100 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={
                    run.status === 'running' ? 'dot-running' :
                    run.status === 'completed' ? 'dot-done' : 'dot-failed'
                  } />
                  <div className="min-w-0">
                    <p className="mono text-[#f0f0f8] truncate">{run.run_id.slice(0, 12)}…</p>
                    <p className="text-xs text-[#4a4a6a] mt-0.5">
                      {run.input_source} · {new Date(run.created_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={run.status} />
                  {run.duration_ms != null && (
                    <span className="text-xs text-[#4a4a6a]">
                      {(run.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  <svg className="w-4 h-4 text-[#4a4a6a] group-hover:text-[#8b8baa] transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Architecture callout */}
      <div className="card-sm bg-violet-500/5 border-violet-500/20 space-y-2">
        <p className="text-xs font-medium text-violet-300">Architecture</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            'ADK SequentialAgent',
            'LlmAgent ×3',
            'FunctionTool ×9',
            'MCP Server',
            'Session State',
            'SQLite Memory',
          ].map(tag => (
            <span key={tag} className="badge-violet">{tag}</span>
          ))}
        </div>
        <p className="text-xs text-[#8b8baa]">
          Feedback Analyzer → Business Prioritizer → Engineering Planner
        </p>
      </div>
    </div>
  );
}
