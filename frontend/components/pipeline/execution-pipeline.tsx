"use client";

import { cn } from "@/lib/utils";

export function ExecutionPipeline() {
  return (
    <section className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto pb-unit-16">
      <div className="flex items-center justify-between mb-unit-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Execution Pipeline</h1>
        <div className="flex items-center gap-4">
          <span className="font-label-mono text-on-surface-variant">Status:</span>
          <span className="px-2 py-1 rounded bg-ai-violet/20 text-ai-violet border border-ai-violet/30 font-label-mono text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-pulse"></span>
            Processing
          </span>
        </div>
      </div>

      {/* Pipeline Grid Layout */}
      <div className="grid grid-cols-12 gap-8 relative z-10">
        
        {/* Main Flow (Left Column) */}
        <div className="col-span-8 space-y-8 relative">
          {/* SVG Connecting Lines */}
          <svg className="absolute top-8 w-full h-[calc(100%-4rem)] pointer-events-none z-0" style={{ left: '23px' }}>
            <line stroke="rgba(255,255,255,0.1)" strokeWidth="2" x1="0" x2="0" y1="0" y2="100%"></line>
            <line className="stream-line" stroke="#00D084" strokeDasharray="6, 6" strokeWidth="2" x1="0" x2="0" y1="120" y2="240"></line>
            <line className="stream-line" stroke="#a855f7" strokeDasharray="6, 6" strokeWidth="2" x1="0" x2="0" y1="240" y2="360"></line>
          </svg>

          {/* Node 1: Completed */}
          <div className="flex gap-unit-6 group relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-accent-green/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,208,132,0.15)] animate-pulse-green">
              <span className="material-symbols-outlined text-accent-green">check_circle</span>
            </div>
            <div className="flex-1 glass-panel rounded-xl p-unit-4 flex items-center justify-between hover:bg-surface-container transition-colors">
              <div>
                <h3 className="font-body-lg text-body-lg text-on-surface">Customer Feedback Ingestion</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Aggregated from Intercom, Zendesk, Twitter.</p>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-label-mono text-accent-green bg-accent-green/10 px-2 py-1 rounded inline-block mb-1">Completed</div>
                <div className="font-label-mono text-label-mono text-on-surface-variant text-[11px]">0.8s</div>
              </div>
            </div>
          </div>

          {/* Node 2: Completed */}
          <div className="flex gap-unit-6 group relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-accent-green/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,208,132,0.15)] animate-pulse-green">
              <span className="material-symbols-outlined text-accent-green">check_circle</span>
            </div>
            <div className="flex-1 glass-panel rounded-xl p-unit-4 flex items-center justify-between">
              <div>
                <h3 className="font-body-lg text-body-lg text-on-surface">Feedback Analyzer</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Agent: <span className="text-primary">Orion</span> • Entity extraction &amp; sentiment.</p>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-label-mono text-accent-green bg-accent-green/10 px-2 py-1 rounded inline-block mb-1">Completed</div>
                <div className="font-label-mono text-label-mono text-on-surface-variant text-[11px]">1.2s • Conf: 95%</div>
              </div>
            </div>
          </div>

          {/* Node 3: Running */}
          <div className="flex gap-unit-6 group relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-ai-violet flex items-center justify-center animate-pulse-violet shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className="material-symbols-outlined text-ai-violet" style={{ fontVariationSettings: "'FILL' 1" }}>model_training</span>
            </div>
            <div className="flex-1 ai-spark rounded-xl p-unit-4 flex items-center justify-between shadow-[0_0_25px_rgba(168,85,247,0.1)]">
              <div>
                <h3 className="font-body-lg text-body-lg text-on-surface flex items-center gap-2">
                  Business Prioritizer 
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-pulse"></span>
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Agent: <span className="text-ai-violet">Lyra</span> • Calculating ICE scores.</p>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-label-mono text-ai-violet bg-ai-violet/10 border border-ai-violet/30 px-2 py-1 rounded inline-block mb-1">Running</div>
                <div className="font-label-mono text-label-mono text-on-surface-variant text-[11px]">Elapsed: 2.4s</div>
              </div>
            </div>
          </div>

          {/* Node 4: Queued */}
          <div className="flex gap-unit-6 group opacity-50 relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">architecture</span>
            </div>
            <div className="flex-1 glass-panel rounded-xl p-unit-4 flex items-center justify-between">
              <div>
                <h3 className="font-body-lg text-body-lg text-on-surface">Engineering Planner</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Agent: <span className="text-on-surface-variant">Atlas</span> • Translating specs.</p>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-label-mono text-on-surface-variant bg-white/5 px-2 py-1 rounded inline-block">Queued</div>
              </div>
            </div>
          </div>

          {/* Node 5: Queued */}
          <div className="flex gap-unit-6 group opacity-50 relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">task</span>
            </div>
            <div className="flex-1 glass-panel rounded-xl p-unit-4 flex items-center justify-between">
              <div>
                <h3 className="font-body-lg text-body-lg text-on-surface">Engineering Tasks</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Generate JIRA tickets &amp; PR stubs.</p>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-label-mono text-on-surface-variant bg-white/5 px-2 py-1 rounded inline-block">Queued</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Cards (Right Column) */}
        <div className="col-span-4 space-y-6">
          {/* LLM Gateway Card */}
          <div className="glass-panel border-t-2 border-t-primary rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">api</span>
                <h4 className="font-label-caps text-on-surface tracking-wide">LLM Gateway</h4>
              </div>
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-label-mono">Provider</span>
                <span className="text-on-surface font-label-mono">Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-label-mono">Latency</span>
                <span className="text-accent-green font-label-mono">180ms</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-label-mono">Token Usage</span>
                <span className="text-primary font-label-mono">14k / 1M</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-label-mono">Fallback</span>
                <span className="text-on-surface font-label-mono">Active (GPT-4o)</span>
              </div>
            </div>
          </div>

          {/* Agent Card: Lyra (Active) */}
          <div className="glass-panel border border-ai-violet/30 rounded-xl p-5 shadow-[0_4px_20px_rgba(168,85,247,0.1)] relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-ai-violet/20 flex items-center justify-center text-ai-violet">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                </div>
                <h4 className="font-label-caps text-ai-violet tracking-wide">Agent Lyra</h4>
              </div>
              <span className="text-[10px] uppercase font-bold text-ai-violet bg-ai-violet/10 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="mb-3">
              <div className="text-xs text-on-surface-variant mb-1 font-label-mono">Current Task:</div>
              <div className="text-sm text-on-surface font-body-sm">Clustering Themes &amp; ICE Scoring</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface/50 rounded p-2">
                <div className="text-[10px] text-on-surface-variant font-label-mono">Memory</div>
                <div className="text-sm text-on-surface font-label-mono">420 MB</div>
              </div>
              <div className="bg-surface/50 rounded p-2">
                <div className="text-[10px] text-on-surface-variant font-label-mono">Runtime</div>
                <div className="text-sm text-on-surface font-label-mono">2.4s</div>
              </div>
            </div>
          </div>

          {/* Agent Card: Atlas (Queued) */}
          <div className="glass-panel opacity-60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">architecture</span>
                </div>
                <h4 className="font-label-caps text-on-surface-variant tracking-wide">Agent Atlas</h4>
              </div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-white/5 px-2 py-0.5 rounded">Standby</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface/30 rounded p-2">
                <div className="text-[10px] text-on-surface-variant font-label-mono">Confidence</div>
                <div className="text-sm text-on-surface font-label-mono">--</div>
              </div>
              <div className="bg-surface/30 rounded p-2">
                <div className="text-[10px] text-on-surface-variant font-label-mono">Memory</div>
                <div className="text-sm text-on-surface font-label-mono">0 MB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Bottom Metrics Grid */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 pt-8 border-t border-white/5 z-10 w-full">
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Total Runtime</div>
          <div className="font-headline-md text-lg text-on-surface">00:04:12</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Avg Confidence</div>
          <div className="font-headline-md text-lg text-primary">94.2%</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Feedback Proc.</div>
          <div className="font-headline-md text-lg text-on-surface">1,402</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Tasks Gen.</div>
          <div className="font-headline-md text-lg text-on-surface">342</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Est. Biz Value</div>
          <div className="font-headline-md text-lg text-accent-green">+$42k</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Cost Saved</div>
          <div className="font-headline-md text-lg text-accent-green">$2.4k</div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px]">Gateway Latency</div>
          <div className="font-headline-md text-lg text-on-surface">180ms</div>
        </div>
        <div className="glass-panel rounded-lg p-3 border-ai-violet/30 border">
          <div className="font-label-caps text-label-caps text-ai-violet mb-1 text-[10px]">Active Agents</div>
          <div className="font-headline-md text-lg text-ai-violet flex items-center gap-2">
            6 <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-pulse"></span>
          </div>
        </div>
      </div>
    </section>
  );
}
