"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function AiReasoningLog() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulating auto-scroll like the original script
    const interval = setInterval(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-[400px] flex-shrink-0 border-l border-white/5 bg-[#0A0F1A]/95 backdrop-blur flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] h-[calc(100vh-64px)] fixed right-0 top-16">
      <div className="p-unit-4 border-b border-white/5 flex items-center justify-between bg-surface/50">
        <h2 className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ai-violet animate-pulse"></span>
          AI Reasoning Log
        </h2>
        <div className="flex gap-2 items-center">
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-label-mono text-on-surface-variant">Auto-scroll</span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-white">filter_list</span>
        </div>
      </div>
      
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-label-mono text-[13px] leading-relaxed custom-scrollbar space-y-3">
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <div className="text-[10px] text-on-surface-variant/70 mb-1">10:42:01 • SYS</div>
          <div className="text-on-surface">Pipeline execution initialized. Booting agents.</div>
        </div>
        
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <div className="text-[10px] text-on-surface-variant/70 mb-1">10:42:02 • AGENT: ORION</div>
          <div className="flex gap-2 items-start">
            <span className="text-primary">[REASONING]</span>
            <span className="text-on-surface-variant">Extracting core themes from 18 Zendesk tickets. High volume of "slow export" complaints detected.</span>
          </div>
        </div>
        
        <div className="p-2 rounded bg-white/5 border border-white/5">
          <div className="text-[10px] text-on-surface-variant/70 mb-1">10:42:03 • AGENT: ORION</div>
          <div className="flex gap-2 items-start">
            <span className="text-accent-green">[INSIGHT]</span>
            <span className="text-on-surface-variant">Sentiment analyzed. Average score: 0.4 (Negative). Escalation flag triggered.</span>
          </div>
        </div>
        
        {/* Active Pulsing Entry */}
        <div className="p-3 rounded bg-ai-violet/10 border border-ai-violet/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-ai-violet"></div>
          <div className="text-[10px] text-ai-violet mb-1 flex items-center justify-between">
            <span>10:42:04 • AGENT: LYRA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-pulse"></span>
          </div>
          <div className="flex gap-2 items-start mb-2">
            <span className="text-ai-violet font-semibold">[SCORE]</span>
            <span className="text-on-surface">Priority 8.4/10 based on MRR impact (Est. $42k at risk).</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-ai-violet font-semibold">[PLAN]</span>
            <span className="text-on-surface">Generating 4 engineering sub-tasks for optimization... <span className="animate-pulse">_</span></span>
          </div>
        </div>
      </div>
    </aside>
  );
}
