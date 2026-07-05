"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Typewriter = ({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const startTyping = () => {
      timeoutId = setInterval(() => {
        if (currentIndex < text.length - 1) {
          setDisplayedText(prev => prev + text[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(timeoutId);
          setDisplayedText(text); // Ensure final text is set exactly
        }
      }, speed);
    };

    // Initial delay before typing starts
    const initialDelay = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timeoutId);
    };
  }, [text, delay, speed]);

  return <span>{displayedText}</span>;
};

export function LiveReasoning() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 1.5,
        delayChildren: 0.5
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="w-80 bg-surface-container-lowest border-l border-white/5 flex flex-col shrink-0 h-full fixed right-0 top-16 z-30">
      <div className="p-unit-4 border-b border-white/5 bg-surface-container-low flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
        <h2 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Live AI Thinking</h2>
      </div>
      <div className="flex-1 p-unit-4 overflow-y-auto flex flex-col gap-6 relative custom-scrollbar pb-32">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-surface-container-lowest to-transparent z-10 pointer-events-none"></div>
        
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6 mt-4">
          
          <motion.div variants={item} className="flex gap-3 opacity-50">
            <div className="w-1 h-full bg-white/10 rounded-full mt-2 shrink-0"></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <Typewriter text="Found repeated complaints about PDF export failures across Zendesk tickets and App Store reviews." delay={500} />
            </p>
          </motion.div>
          
          <motion.div variants={item} className="flex gap-3 opacity-70">
            <div className="w-1 h-full bg-white/20 rounded-full mt-2 shrink-0"></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <Typewriter text="Detected severe revenue impact associated with Enterprise tier users unable to generate monthly reports." delay={2000} />
            </p>
          </motion.div>
          
          <motion.div variants={item} className="flex gap-3 opacity-90">
            <div className="w-1 h-full bg-primary/40 rounded-full mt-2 shrink-0"></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <Typewriter text="Evaluating technical debt in the PDF rendering microservice..." delay={3500} />
            </p>
          </motion.div>
          
          <motion.div variants={item} className="flex gap-3 relative">
            <div className="w-1 h-full bg-primary rounded-full mt-2 shadow-[0_0_8px_rgba(207,188,255,0.8)] shrink-0"></div>
            <div className="font-body-sm text-body-sm text-primary leading-relaxed bg-primary/5 p-2 rounded border border-primary/10 relative">
              <Typewriter text="Prioritizing feature rewrite: High confidence that resolving this will reduce Enterprise churn by 12%. Calculating final ICE score..." delay={5000} speed={40} />
              <span className="ml-1 animate-pulse">_</span>
            </div>
            <span className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
