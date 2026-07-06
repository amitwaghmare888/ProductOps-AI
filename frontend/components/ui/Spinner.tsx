import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const spinnerVariants = cva(
  'rounded-full animate-spin-slow motion-reduce:animate-none',
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5 border-2',
        default: 'w-4 h-4 border-2',
        lg: 'w-6 h-6 border-[3px]',
      },
      variant: {
        default: 'border-violet-500/30 border-t-violet-500',
        light: 'border-white/30 border-t-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, variant, className }))}
      {...props}
    />
  );
}
