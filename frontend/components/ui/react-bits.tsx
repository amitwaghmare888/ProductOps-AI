'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[60vh] overflow-hidden rounded-3xl border border-[#2a2a3a] bg-[#0c0c12] mb-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[50%] opacity-40 blur-[100px]"
          style={{
            backgroundImage: `repeating-linear-gradient(120deg, transparent, transparent 15%, rgba(139, 92, 246, 0.15) 25%, rgba(16, 185, 129, 0.1) 35%, transparent 45%)`,
            backgroundSize: "200% 200%"
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 text-center">
        {children}
      </div>
    </div>
  );
}

export function ShinyText({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.span
      className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-violet-400 bg-[length:200%_auto] ${className}`}
      animate={{ backgroundPosition: ['200% center', '-200% center'] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  );
}

export function SplitText({ text, className = '' }: { text: string, className?: string }) {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center gap-x-2 gap-y-1 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

export function MagneticButton({ children, onClick, className = '', variant = 'primary' }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: 'primary' | 'secondary' }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyle = "relative rounded-full px-8 py-3.5 font-medium transition-colors outline-none flex items-center gap-2";
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]",
    secondary: "bg-[#1a1a26] hover:bg-[#2a2a3a] text-[#f0f0f8] border border-[#2a2a3a]"
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
