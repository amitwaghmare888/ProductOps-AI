"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PipelineStage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.6, // Slower stagger for dramatic effect
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center gap-unit-12 relative z-10 py-12"
    >
      {/* Pipeline Line (Connector) */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: "80%" }}
        transition={{ duration: 3, ease: "linear" }}
        className="absolute left-[70px] top-[10%] w-px bg-gradient-to-b from-[#166534] via-primary/50 to-white/5 -z-10"
      />

      {/* Node 1: Reading */}
      <motion.div variants={item} className="flex items-center gap-unit-6 opacity-60">
        <div className="w-12 h-12 rounded-full bg-[#052e16] border border-[#166534] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex-1 bg-surface-container-low border border-white/5 rounded-xl p-unit-4 flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Reading Feedback</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Processed 1,402 items across 5 sources.</p>
          </div>
          <span className="font-label-mono text-label-mono text-[#4ade80]">Done</span>
        </div>
      </motion.div>

      {/* Node 2: Understanding */}
      <motion.div variants={item} className="flex items-center gap-unit-6 opacity-80">
        <div className="w-12 h-12 rounded-full bg-[#052e16] border border-[#166534] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex-1 bg-surface border border-white/5 rounded-xl p-unit-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Understanding Context</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Clustered entities and sentiment.</p>
            </div>
            <span className="font-label-mono text-label-mono text-[#4ade80]">Done</span>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-error-container/20 text-error font-label-mono text-label-mono border border-error/20">Export Failures (84)</span>
            <span className="px-2 py-1 rounded bg-tertiary-container/20 text-tertiary font-label-mono text-label-mono border border-tertiary/20">Payment Issues (32)</span>
          </div>
        </div>
      </motion.div>

      {/* Node 3: Business Prioritization (ACTIVE) */}
      <motion.div variants={item} className="flex items-center gap-unit-6 relative z-20">
        <div className="w-12 h-12 rounded-full bg-primary-container border border-primary flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(124,92,255,0.15)] animate-pulse">
          <span className="material-symbols-outlined text-on-primary-container animate-spin" style={{ animationDuration: '3s' }}>cycle</span>
        </div>
        <div className="flex-1 ai-spark glass-panel rounded-xl p-unit-6 shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-unit-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-primary font-semibold">Business Prioritization</h3>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant animate-pulse">Analyzing impact vs. effort...</p>
            </div>
            <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-label-caps text-label-caps uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Active
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface/50 border border-white/10 rounded-lg p-4">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">ICE Score</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface">8.4</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/ 10</span>
              </div>
            </div>
            <div className="bg-surface/50 border border-white/10 rounded-lg p-4 flex flex-col justify-center items-start">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Predicted Impact</p>
              <span className="bg-error-container text-error px-3 py-1 rounded font-label-mono text-label-mono border border-error/20 inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> High Impact
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Node 4: Engineering Planning */}
      <motion.div variants={item} className="flex items-center gap-unit-6 opacity-40">
        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0">
          <span className="font-label-mono text-label-mono text-on-surface-variant">04</span>
        </div>
        <div className="flex-1 bg-surface-container-low border border-white/5 rounded-xl p-unit-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">Engineering Planning</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Waiting for prioritization...</p>
        </div>
      </motion.div>

      {/* Node 5: Execution Ready */}
      <motion.div variants={item} className="flex items-center gap-unit-6 opacity-40">
        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0">
          <span className="font-label-mono text-label-mono text-on-surface-variant">05</span>
        </div>
        <div className="flex-1 bg-surface-container-low border border-white/5 rounded-xl p-unit-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">Execution Ready</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Pending plan generation...</p>
        </div>
      </motion.div>

    </motion.div>
  );
}
