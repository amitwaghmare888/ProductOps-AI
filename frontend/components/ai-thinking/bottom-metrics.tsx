"use client";

import { motion } from "framer-motion";

export function BottomMetrics() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="h-auto border-t border-white/5 bg-surface-container-low p-unit-4 flex gap-unit-4 overflow-x-auto"
    >
      <motion.div variants={item} className="flex-1 min-w-[200px] bg-surface border border-white/5 rounded-lg p-unit-4 hover:border-white/20 transition-colors">
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Model Confidence</p>
        <div className="flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg text-primary">94%</span>
        </div>
      </motion.div>
      <motion.div variants={item} className="flex-1 min-w-[200px] bg-surface border border-white/5 rounded-lg p-unit-4 hover:border-white/20 transition-colors">
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Feedback Processed</p>
        <div className="flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg text-on-surface">1,402</span>
        </div>
      </motion.div>
      <motion.div variants={item} className="flex-1 min-w-[200px] bg-surface border border-white/5 rounded-lg p-unit-4 hover:border-white/20 transition-colors">
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Tasks Generated</p>
        <div className="flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg text-on-surface">12</span>
          <span className="font-label-mono text-label-mono text-[#4ade80]">+3</span>
        </div>
      </motion.div>
      <motion.div variants={item} className="flex-1 min-w-[200px] bg-surface border border-white/5 rounded-lg p-unit-4 hover:border-white/20 transition-colors">
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Pipeline Runtime</p>
        <div className="flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg text-on-surface font-label-mono">00:02:45</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
