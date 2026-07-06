import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const cardVariants = cva('bg-[#111118] border border-[#2a2a3a]', {
  variants: {
    size: {
      default: 'rounded-xl p-5',
      sm: 'rounded-lg p-4',
    },
    variant: {
      default: '',
      elevated: 'bg-[#1a1a26]',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ size, variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
