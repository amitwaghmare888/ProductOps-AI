export function PipelineVisual() {
  return (
    <div className="relative h-[650px] w-full hidden lg:flex flex-col items-center justify-center">
      {/* Pipeline Path (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 500 600">
        <path className="flow-line" d="M250 50 V 550" fill="none" stroke="url(#pipeGrad)" strokeWidth="2"></path>
        <defs>
          <linearGradient id="pipeGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#cfbcff"></stop>
            <stop offset="100%" stopColor="#e7c365"></stop>
          </linearGradient>
        </defs>
      </svg>
      {/* Workflow Nodes */}
      <div className="flex flex-col gap-6 w-full max-w-sm z-10">
        {/* Node 1 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-secondary shadow-lg transition-all hover:translate-x-1" style={{ animationDelay: "0.1s" }}>
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">forum</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">Customer Feedback</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">Ingesting 12 source channels...</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        {/* Node 2 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-primary shadow-lg transition-all hover:translate-x-1" style={{ animationDelay: "0.2s" }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">psychology</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">Feedback Analyzer</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">Agent Orion mapping themes...</div>
          </div>
          <div className="text-[10px] font-bold text-primary">92% Conf</div>
        </div>
        {/* Node 3 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-tertiary shadow-lg transition-all hover:translate-x-1" style={{ animationDelay: "0.3s" }}>
          <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary">priority_high</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">Business Prioritizer</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">ROI evaluation complete</div>
          </div>
          <div className="material-symbols-outlined text-xs text-green-400">check_circle</div>
        </div>
        {/* Node 4 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-white/20 shadow-lg transition-all hover:translate-x-1" style={{ animationDelay: "0.4s" }}>
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/50">architecture</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">Engineering Planner</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">Generating technical specs...</div>
          </div>
          <div className="w-12 bg-white/10 h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
        {/* Node 5 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-primary/50 shadow-lg transition-all hover:translate-x-1" style={{ animationDelay: "0.5s" }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center node-pulse">
            <span className="material-symbols-outlined text-primary">bolt</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">LLM Gateway</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">Streaming tokens (2.8s total)...</div>
          </div>
        </div>
        {/* Node 6 */}
        <div className="node-appear glass-panel p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-white/10 shadow-lg opacity-60 grayscale hover:grayscale-0 transition-all hover:translate-x-1" style={{ animationDelay: "0.6s" }}>
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/40">checklist</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white/40">Engineering Tasks</div>
            <div className="text-[10px] text-on-surface-variant font-label-mono">Pending final approval...</div>
          </div>
        </div>
      </div>
      {/* Execution Status HUDs */}
      <div className="absolute top-10 right-0 glass-panel p-3 rounded-lg border border-primary/20 animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-label-mono text-primary">Agent: Orion analyzing feedback...</span>
        </div>
      </div>
      <div className="absolute bottom-10 left-0 glass-panel p-3 rounded-lg border border-secondary/20 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-label-mono text-on-surface-variant">Planner generating sprint...</span>
          <span className="text-[10px] font-bold text-secondary">84%</span>
        </div>
        <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-secondary w-[84%]"></div>
        </div>
      </div>
    </div>
  );
}
