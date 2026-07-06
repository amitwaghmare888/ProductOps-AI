import { type ReactNode } from 'react';
import { BentoCard } from './BentoCard';
import { cn } from '@/lib/utils/cn';

type AgentType = 'system' | 'alpha' | 'network';

interface AgentCardProps {
  name: string;
  type: AgentType;
  icon: string;
  status: 'active' | 'idle' | 'processing';
  children: ReactNode;
  className?: string;
}

const agentColors: Record<AgentType, { border: string; text: string; dot: string }> = {
  system: {
    border: 'border-on-surface',
    text: 'text-on-surface',
    dot: 'bg-on-surface',
  },
  alpha: {
    border: 'border-primary',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  network: {
    border: 'border-tertiary',
    text: 'text-tertiary',
    dot: 'bg-tertiary',
  },
};

export function AgentCard({ 
  name, 
  type, 
  icon, 
  status, 
  children,
  className 
}: AgentCardProps) {
  const colors = agentColors[type];
  
  return (
    <BentoCard className={cn('glass-panel border-l-4', colors.border, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            type === 'alpha' ? 'bg-primary/10' :
            type === 'network' ? 'bg-tertiary/10' :
            'bg-on-surface/10'
          )}>
            <span className={cn('material-symbols-outlined text-xl', colors.text)}>
              {icon}
            </span>
          </div>
          <div>
            <h3 className={cn('font-body-bold text-body-bold', colors.text)}>
              {name}
            </h3>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider">
              {type} Agent
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            colors.dot,
            status === 'processing' && 'animate-pulse-dot'
          )} />
          <span className="text-xs text-on-surface-variant capitalize">
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="text-body-base text-on-surface-variant">
        {children}
      </div>
    </BentoCard>
  );
}
