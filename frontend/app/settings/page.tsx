'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Settings"
        subtitle="Configure your ProductOps AI environment"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 space-y-gutter">
            <BentoCard>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-6">
                API Configuration
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="apiEndpoint" className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">
                    API ENDPOINT
                  </label>
                  <input
                    id="apiEndpoint"
                    type="text"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <p className="text-body-base text-on-surface-variant text-xs mt-1">
                    Backend API base URL
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="dot-success" />
                  <span className="text-body-base text-on-surface-variant">Connected</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-6">
                Appearance
              </p>
              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 block">
                    THEME
                  </label>
                  <div className="flex gap-3">
                    {['dark', 'light', 'system'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={
                          theme === t
                            ? 'px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-body-bold'
                            : 'px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/30 transition-colors'
                        }
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-body-base text-on-surface-variant text-xs mt-2">
                    Currently fixed to dark mode
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-6">
                Notifications
              </p>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-body-bold text-on-surface">Pipeline Notifications</p>
                    <p className="text-body-base text-on-surface-variant text-sm">
                      Get notified when pipelines complete or fail
                    </p>
                  </div>
                  <div
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </div>
                </label>
              </div>
            </BentoCard>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary">
                <span className="material-symbols-outlined text-sm">save</span>
                Save Changes
              </button>
              {saved && (
                <span className="text-body-base text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Saved successfully
                </span>
              )}
            </div>
          </div>

          <div className="space-y-gutter">
            <BentoCard>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-4">
                Profile
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center font-headline-md text-headline-md text-on-primary">
                  {user?.initials || 'AW'}
                </div>
                <div>
                  <p className="font-body-bold text-on-surface">{user?.name || 'Amit Waghmare'}</p>
                  <p className="text-body-base text-on-surface-variant text-sm">{user?.role || 'AI Product Engineer'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-body-base text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">email</span>
                  {user?.email || 'admin@productops.ai'}
                </div>
              </div>
            </BentoCard>

            <BentoCard className="bg-error/5 border-error/20">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-4">
                Danger Zone
              </p>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 border border-error/20 transition-colors font-body-bold"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Logout
              </button>
            </BentoCard>

            <BentoCard>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-3">
                About
              </p>
              <div className="space-y-2 text-body-base text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="font-mono text-xs">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Build</span>
                  <span className="font-mono text-xs">2026.01</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment</span>
                  <span className="badge-secondary text-xs">Development</span>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
