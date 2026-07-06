'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  iconFilled?: boolean;
}

interface SideNavBarProps {
  onNewPipeline?: () => void;
}

const navItems: NavItem[] = [
  { href: '/', icon: 'terminal', label: 'Mission Control', iconFilled: true },
  { href: '/agents', icon: 'smart_toy', label: 'AI Agents' },
  { href: '/architecture', icon: 'account_tree', label: 'Architecture' },
  { href: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { href: '/evaluate', icon: 'science', label: 'Evaluation' },
  { href: '/report', icon: 'description', label: 'Decision Report' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export function SideNavBar({ onNewPipeline }: SideNavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col h-full overflow-y-auto bg-surface w-64 flex-shrink-0 border-r border-outline-variant">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-surface">
              precision_manufacturing
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
              ProductOps AI
            </h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              AUTONOMOUS ORCHESTRATION
            </p>
          </div>
        </div>
      </div>

      {/* New Pipeline Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onNewPipeline}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-body-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-[1.02] transition-transform glow-accent"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Pipeline
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 space-y-1">
        <div className="font-body-bold text-on-surface text-sm opacity-50 mb-4 uppercase tracking-wider px-4">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 px-4 py-2 text-primary font-body-bold bg-primary-container/10 border-r-2 border-primary hover:bg-surface-variant/50 transition-colors duration-200 rounded-lg'
                  : 'flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors duration-200 rounded-lg'
              }
            >
              <span 
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: item.iconFilled && isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body-base text-body-base">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="mt-auto p-4 border-t border-outline-variant/30 space-y-2">
        <Link
          href="/docs"
          className="flex items-center gap-2 px-2 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-body-base"
        >
          <span className="material-symbols-outlined text-sm">menu_book</span>
          Docs
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-2 px-2 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-body-base"
        >
          <span className="material-symbols-outlined text-sm">help</span>
          Support
        </Link>
        <div className="flex items-center justify-between text-on-surface-variant mt-4 pt-2 border-t border-outline-variant/30 px-2">
          <span className="font-label-caps text-label-caps">SYSTEM STATUS</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></div>
            <span className="text-xs">OK</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
