'use client';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface TopAppBarProps {
  title?: string;
}

export function TopAppBar({ title = 'ProductOps AI' }: TopAppBarProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <span className="font-headline-md text-headline-md font-bold text-on-surface">
          {title}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          className="text-on-surface-variant hover:bg-surface-container-high transition-all p-2 rounded-lg"
          aria-label="Search"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
        
        <button 
          className="text-on-surface-variant hover:bg-surface-container-high transition-all p-2 rounded-lg"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant rounded-md text-on-surface-variant font-label-caps border border-outline-variant/30">
          <span>⌘K</span>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          Deploy
        </button>
        
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center font-body-bold text-on-primary hover:ring-2 hover:ring-primary/50 transition-all"
            aria-label="User menu"
          >
            {user?.initials || 'AW'}
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-panel p-2 space-y-1">
              <div className="px-3 py-2 border-b border-outline-variant/30 mb-2">
                <p className="font-body-bold text-on-surface">{user?.name || 'Amit Waghmare'}</p>
                <p className="text-body-base text-on-surface-variant text-xs">{user?.role || 'AI Product Engineer'}</p>
                <p className="text-body-base text-on-surface-variant text-xs mt-1">{user?.email || 'admin@productops.ai'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-left"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="text-body-base">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
