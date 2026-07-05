"use client";

import { motion } from "framer-motion";

export function TopTelemetryBar() {
  return (
    <header className="h-16 border-b border-white/5 bg-surface-container flex items-center justify-between px-gutter shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-mono text-label-mono uppercase tracking-wider">Pipeline Running</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center gap-4 font-label-mono text-label-mono text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">psychology</span> Model: Gemini 2.5 Flash</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Confidence: 94%</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">layers</span> Queue: 18 Items</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-label-mono text-label-mono text-on-surface-variant">00:02:45</span>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    </header>
  );
}
