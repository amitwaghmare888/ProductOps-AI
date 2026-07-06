import { type ReactNode } from 'react';
import { BentoCard } from './BentoCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <BentoCard className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
            {label}
          </p>
          <p className="font-stat-lg text-stat-lg text-on-surface">
            {value}
          </p>
          {trend && (
            <div className="mt-2 text-body-base text-on-surface-variant">
              {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-primary">
              {icon}
            </span>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
