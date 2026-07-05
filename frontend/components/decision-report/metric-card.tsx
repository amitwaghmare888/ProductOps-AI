"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  valueColorClass?: string;
  isGlow?: boolean;
}

export function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  valueColorClass = "text-on-surface",
  isGlow = false,
}: MetricCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, value, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onViewportEnter={() => setInView(true)}
      className={cn(
        "flex flex-col bg-surface-container-low p-3 rounded-lg border border-white/5 relative",
        isGlow && "shadow-[0_0_20px_rgba(124,92,255,0.15)] animate-breathe"
      )}
    >
      {isGlow && (
        <div className="absolute inset-0 rounded-lg p-[1px] pointer-events-none" style={{
          background: 'linear-gradient(to right, #cfbcff, #e7c365) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}></div>
      )}
      <span className={cn(
        "font-label-caps text-label-caps mb-1",
        isGlow ? "text-primary" : "text-on-surface-variant"
      )}>
        {title}
      </span>
      <span className={cn("font-headline-md text-headline-md", valueColorClass)}>
        {prefix}<motion.span>{rounded}</motion.span>{suffix}
      </span>
    </motion.div>
  );
}
