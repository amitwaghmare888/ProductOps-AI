import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProductOps AI',
  description: 'AI-powered product operations pipeline — feedback to engineering plan',
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-ghost">
      {children}
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="w-56 min-h-screen shrink-0 border-r border-[#2a2a3a] bg-[#0c0c12] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f0f0f8] leading-none">ProductOps</p>
            <p className="text-xs text-[#4a4a6a] mt-0.5">AI Pipeline</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2 flex flex-col gap-0.5 flex-1">
        <NavLink href="/">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink href="/evaluate">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Evaluation
        </NavLink>
      </nav>

      {/* ADK badge */}
      <div className="p-4 border-t border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          <span className="text-xs text-[#4a4a6a]">Powered by Google ADK</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="badge-violet text-[10px]">ADK</span>
          <span className="badge-violet text-[10px]">MCP</span>
          <span className="badge-violet text-[10px]">Gemini</span>
        </div>
      </div>
    </aside>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
