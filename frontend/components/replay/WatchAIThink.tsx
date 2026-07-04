'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle2, ChevronRight, X, Play, Pause, FastForward } from 'lucide-react';
import { GlowCard, CountUp } from '@/components/ui';
import { useExecution, ExecutionStage, ExecutionStatus } from '@/hooks/useExecution';
import { useReplay, ReplayStep } from '@/components/replay/ReplayProvider';

interface WatchAIThinkProps {
  mode: 'live' | 'replay';
  runId?: string | null;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReplayStageStatus(steps: ReplayStep[], prefix: string): ExecutionStatus {
  if (steps.length === 0) return 'idle';
  
  // A stage is running if we've seen its start step but not its complete step
  const started = steps.some(s => s.id === `${prefix}_start`);
  const completed = steps.some(s => s.id === `${prefix}_complete`);
  
  if (completed) return 'completed';
  if (started) return 'running';
  return 'idle';
}

function buildLiveLogs(stages: ExecutionStage[], elapsedMs: number, status: ExecutionStatus): string[] {
  const logs: string[] = ['Pipeline run started'];
  
  stages.forEach(stage => {
    if (stage.status === 'running' || stage.status === 'completed') {
      logs.push(`[${stage.label}] Agent started`);
    }
    if (stage.status === 'completed') {
      logs.push(`[${stage.label}] Complete`);
    }
    if (stage.status === 'failed') {
      logs.push(`[${stage.label}] Failed`);
    }
  });

  if (status === 'completed') {
    logs.push(`Pipeline completed — ${(elapsedMs / 1000).toFixed(1)} s`);
  } else if (status === 'failed') {
    logs.push('Pipeline failed');
  } else if (status === 'running') {
    logs.push('...');
  }
  
  return logs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WatchAIThink({ mode, runId, onClose }: WatchAIThinkProps) {
  // Live State
  const liveState = useExecution({ runId: mode === 'live' ? runId ?? null : null });
  
  // Replay State
  const replayState = useReplay();

  const isLive = mode === 'live';
  
  // Determine overall status
  const status = isLive ? liveState.status : replayState.status;
  const isComplete = status === 'completed' || status === 'failed';
  const elapsedMs = isLive 
    ? liveState.elapsedMs 
    : replayState.visibleSteps.length > 0 
      ? replayState.visibleSteps[replayState.visibleSteps.length - 1].offsetMs 
      : 0;

  // Determine stages
  const stages: ExecutionStage[] = isLive
    ? liveState.stages
    : [
        { name: 'feedback_analyzer', label: 'Feedback Analyzer', status: getReplayStageStatus(replayState.visibleSteps, 'analyzer') },
        { name: 'business_prioritizer', label: 'Business Prioritizer', status: getReplayStageStatus(replayState.visibleSteps, 'prioritizer') },
        { name: 'engineering_planner', label: 'Engineering Planner', status: getReplayStageStatus(replayState.visibleSteps, 'planner') },
      ];

  // Determine logs
  const logs = isLive 
    ? buildLiveLogs(liveState.stages, liveState.elapsedMs, liveState.status)
    : replayState.visibleSteps.map(s => {
        const time = s.timestamp.split('T')[1]?.replace('Z', '') || '';
        return `[${time}] ${s.label}`;
      });

  // Auto-scroll logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Start replay on mount if replay mode
  useEffect(() => {
    if (!isLive && replayState.status === 'idle') {
      replayState.play();
    }
  }, [isLive, replayState]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#09090f]/90 backdrop-blur-md"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-[#2a2a3a] bg-[#111118]/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400">
            <Terminal size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#f0f0f8]">Watch AI Think</h2>
            <p className="text-sm text-[#8b8baa]">
              {isLive ? `Live Execution • ${runId}` : 'Replay Mode • Demo Sequence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLive && (
            <div className="flex items-center gap-2 mr-4 bg-[#1a1a26] rounded-full p-1 border border-[#2a2a3a]">
              <button 
                onClick={() => replayState.status === 'playing' ? replayState.pause() : replayState.play()}
                className="p-1.5 rounded-full hover:bg-[#2a2a3a] text-[#f0f0f8] transition-colors"
              >
                {replayState.status === 'playing' ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="w-[1px] h-4 bg-[#2a2a3a]" />
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => replayState.setSpeed(s)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    replayState.speed === s ? 'bg-violet-500 text-white' : 'text-[#8b8baa] hover:text-[#f0f0f8]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
          
          <div className="text-right mr-4 font-mono text-[#f0f0f8]">
            <CountUp from={0} to={elapsedMs / 1000} decimals={1} suffix="s" duration={200} />
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2a2a3a] text-[#8b8baa] hover:text-[#f0f0f8] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left column: Stages */}
        <div className="w-1/3 p-6 border-r border-[#2a2a3a] overflow-y-auto space-y-4">
          <h3 className="text-sm font-medium text-[#8b8baa] mb-6 uppercase tracking-wider">AI Execution Stages</h3>
          
          {stages.map((stage, idx) => (
            <GlowCard 
              key={stage.name} 
              variant={stage.status === 'running' ? 'violet' : stage.status === 'completed' ? 'emerald' : 'default'}
              className="transition-colors duration-500"
              glow={stage.status === 'running'}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  ) : stage.status === 'running' ? (
                    <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin-slow" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-[#2a2a3a] rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${stage.status !== 'idle' ? 'text-[#f0f0f8]' : 'text-[#4a4a6a]'}`}>
                    {idx + 1}. {stage.label}
                  </p>
                  {stage.status === 'running' && (
                    <p className="text-sm text-violet-400 mt-1 animate-pulse">Processing...</p>
                  )}
                </div>
              </div>
            </GlowCard>
          ))}

          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8"
              >
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={32} />
                  <h3 className="text-lg font-semibold text-[#f0f0f8]">Execution Complete</h3>
                  <p className="text-sm text-[#8b8baa] mt-2 mb-4">The AI pipeline has finished processing.</p>
                  <button 
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors w-full"
                  >
                    Open Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Terminal Logs */}
        <div className="flex-1 bg-[#09090f] p-6 overflow-hidden flex flex-col font-mono text-sm">
          <div className="flex-1 overflow-y-auto space-y-2 pr-4 custom-scrollbar">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#8b8baa]"
              >
                <span className="text-[#4a4a6a] mr-2">›</span>
                {log}
              </motion.div>
            ))}
            {!isComplete && (
              <div className="text-violet-400 animate-pulse">
                <span className="text-[#4a4a6a] mr-2">›</span>
                <span className="w-2 h-4 inline-block bg-violet-400 align-middle animate-caret-blink" />
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
