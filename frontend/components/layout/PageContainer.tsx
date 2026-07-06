import { type ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  title,
  subtitle,
  action,
  className = '',
}: PageContainerProps) {
  return (
    <main className="flex-1 overflow-y-auto p-gutter relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className={`max-w-[1440px] mx-auto space-y-gutter ${className}`}>
        {/* Hero Section */}
        {(title || subtitle || action) && (
          <div className="flex justify-between items-end mb-8">
            <div>
              {title && (
                <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  {subtitle}
                </div>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </main>
  );
}
