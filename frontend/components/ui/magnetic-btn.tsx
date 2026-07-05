"use client";

import { motion } from "framer-motion";
import { useRef, useState, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface MagneticBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function MagneticBtn({ children, className, ...props }: MagneticBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn("transition-colors active:scale-95", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
