import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type StatusVariant = 'success' | 'warning' | 'error' | 'primary' | 'secondary' | 'tertiary';

interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant: StatusVariant;
  label: string;
  icon?: string;
  pulse?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  tertiary: 'badge-tertiary',
};

export function StatusBadge({ 
  variant, 
  label, 
  icon,
  pulse = false,
  className,
  ...props 
}: StatusBadgeProps) {
  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined text-sm">
          {icon}
        </span>
      )}
      {pulse && (
        <div className={
          variant === 'success' ? 'dot-success' :
          variant === 'warning' ? 'dot-warning' :
          variant === 'error' ? 'dot-error' :
          'dot-active'
        } />
      )}
      {label}
    </div>
  );
}

// Get status variant for backward compatibility
export function getStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase();
  if (normalized.includes('complet') || normalized.includes('success') || normalized.includes('done')) {
    return 'success';
  }
  if (normalized.includes('run') || normalized.includes('pend') || normalized.includes('progress')) {
    return 'warning';
  }
  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'error';
  }
  return 'primary';
}
