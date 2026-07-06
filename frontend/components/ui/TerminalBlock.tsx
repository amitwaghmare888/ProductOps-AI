import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TerminalBlockProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function TerminalBlock({ children, title, className }: TerminalBlockProps) {
  return (
    <div className={cn('terminal-bg rounded-lg overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-2 border-b border-outline-variant/30 bg-surface-container">
          <p className="font-label-caps text-label-caps text-on-surface-variant">
            {title}
          </p>
        </div>
      )}
      <div className="p-4 font-code-block text-code-block text-on-surface font-mono overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

interface TerminalLineProps {
  prefix?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalLine({ prefix = '$', children, className }: TerminalLineProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <span className="text-primary select-none">{prefix}</span>
      <span className="text-on-surface">{children}</span>
    </div>
  );
}
