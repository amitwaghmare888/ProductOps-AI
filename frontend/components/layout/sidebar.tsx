export function Sidebar() {
  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col p-unit-4 z-40 bg-surface-container-low border-r border-white/5 w-64 hidden md:flex">
      <div className="mb-unit-8 px-unit-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-sm text-on-surface">Mission Control</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label-caps">AI OS v1.0</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <button className="flex items-center gap-3 px-3 py-2 bg-primary-container/20 text-primary rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="font-label-caps text-label-caps">Mission Control</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          <span className="font-label-caps text-label-caps">AI Agents</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">account_tree</span>
          <span className="font-label-caps text-label-caps">Pipeline Runs</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">layers</span>
          <span className="font-label-caps text-label-caps">Architecture</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span className="font-label-caps text-label-caps">Analytics</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-label-caps text-label-caps">Settings</span>
        </button>
      </div>
      <div className="border-t border-white/10 pt-4 flex flex-col gap-1 mb-4">
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[18px]">description</span>
          <span className="font-label-caps text-label-caps">Docs</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span className="font-label-caps text-label-caps">Support</span>
        </button>
      </div>
    </nav>
  );
}
