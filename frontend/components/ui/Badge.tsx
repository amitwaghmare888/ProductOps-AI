import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        critical: 'bg-red-500/10 text-red-400 border-red-500/20',
        high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        running: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

/**
 * Get badge variant from severity level
 */
export function getSeverityVariant(
  severity?: string
): 'critical' | 'high' | 'medium' | 'low' | undefined {
  if (!severity) return undefined;
  const s = severity.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  if (s === 'low') return 'low';
  return undefined;
}

/**
 * Get badge variant from priority level
 */
export function getPriorityVariant(
  priority?: string
): 'critical' | 'high' | 'medium' | 'low' | undefined {
  if (!priority) return undefined;
  if (priority === 'P0') return 'critical';
  if (priority === 'P1') return 'high';
  if (priority === 'P2') return 'medium';
  return 'low';
}

/**
 * Get badge variant from status
 */
export function getStatusVariant(
  status: string
): 'success' | 'critical' | 'running' {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'critical';
  return 'running';
}
