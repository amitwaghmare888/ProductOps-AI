'use client';

import { type ReactNode } from 'react';
import { TopAppBar } from './TopAppBar';
import { SideNavBar } from './SideNavBar';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  onNewPipeline?: () => void;
}

export function AppLayout({ children, title, onNewPipeline }: AppLayoutProps) {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface-container-lowest">
      <TopAppBar title={title} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar onNewPipeline={onNewPipeline} />
        {children}
      </div>
    </div>
  );
}
