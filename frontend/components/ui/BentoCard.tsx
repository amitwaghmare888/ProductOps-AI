import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function BentoCard({ 
  children, 
  className, 
  hover = true,
  ...props 
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'bento-card',
        hover && 'glow-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
