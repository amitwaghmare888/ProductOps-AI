import { MetricCard } from "@/components/decision-report/metric-card";
import { AssetCard } from "@/components/decision-report/asset-card";
import { SprintTaskRow } from "@/components/decision-report/sprint-task-row";

export default function DecisionReportPage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/30 selection:text-primary-fixed relative">
      {/* Ambient Background Lighting */}
      <div className="fixed top-0 left-1/4 w-1/2 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 animate-float"></div>
      <div className="fixed bottom-0 right-1/4 w-1/3 h-64 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 animate-float-delayed"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none z-0"></div>

      {/* TopNavBar */}
      <nav className="bg-surface/80 dark:bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/5 shadow-sm">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop w-full mx-auto max-w-max-width">
          <div className="flex items-center gap-unit-4">
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">ProductOps AI</span>
            <span className="px-2 py-1 bg-surface-container rounded-full border border-white/10 font-label-mono text-label-mono text-on-surface-variant flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Report Generated
            </span>
          </div>
          <div className="flex items-center gap-unit-6 hidden md:flex">
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-on-surface-variant">Pipeline Runtime</span>
              <span className="font-label-mono text-label-mono text-on-surface">00:02:45</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors duration-200">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>account_tree</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors duration-200">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>analytics</span>
            </button>
            <button className="bg-gradient-to-r from-primary via-white/40 to-primary bg-[length:200%_auto] text-on-primary hover:animate-shimmer font-body-sm text-body-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95">
              Deploy
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-unit-16 px-margin-mobile md:px-margin-desktop w-full max-w-max-width mx-auto relative z-10">
        
        {/* Header & Top Metrics */}
        <header className="mb-unit-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-unit-6 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '100ms' }}>
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">AI Decision Report</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Automated analysis and execution plan for high-priority pipeline issues.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-unit-4 w-full md:w-auto">
            <MetricCard title="Confidence" value={94} suffix="%" valueColorClass="text-success" />
            <MetricCard title="ICE Score" value={8.4} decimals={1} />
            <MetricCard title="Business Value" value={42} prefix="+$" suffix="k" isGlow={true} />
            <MetricCard title="Eng Hours" value={124} suffix="h" />
            <MetricCard title="Mentions" value={84} />
          </div>
        </header>

        {/* Top Section: Three Column Layout */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-unit-16">
          {/* Left Column: Executive Summary */}
          <div className="md:col-span-3 flex flex-col gap-unit-4 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '200ms' }}>
            <h2 className="font-headline-md text-headline-md text-on-surface border-b border-white/5 pb-2 mb-2">Executive Summary</h2>
            <div className="space-y-4">
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Overall Confidence</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success font-label-mono text-label-mono border border-success/20 animate-pulse">High</span>
              </div>
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Primary Customer Pain</span>
                <span className="font-body-md text-body-md text-on-surface">PDF Export Reliability</span>
              </div>
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Business Impact</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-error/10 text-error font-label-mono text-label-mono border border-error/20 animate-pulse">Severe</span>
              </div>
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Estimated Revenue Risk</span>
                <span className="font-body-md text-body-md text-on-surface">~$42k at risk</span>
              </div>
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Recommended Priority</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/10 text-warning font-label-mono text-label-mono border border-warning/20 animate-pulse">P0</span>
              </div>
              <div>
                <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Estimated Eng Effort</span>
                <span className="font-body-md text-body-md text-on-surface">Moderate</span>
              </div>
            </div>
          </div>

          {/* Center Column: Feature Opportunity Card */}
          <div className="md:col-span-6 glass-panel rounded-xl p-unit-6 relative shadow-[0_0_20px_rgba(124,92,255,0.15)] animate-breathe group hover:border-surface-variant transition-colors duration-300 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 right-0 p-unit-4">
              <span className="material-symbols-outlined text-primary/50 text-3xl">psychology</span>
            </div>
            <h3 className="font-label-caps text-label-caps text-primary mb-2 tracking-widest">FEATURE OPPORTUNITY</h3>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-unit-6">Fix PDF Export Reliability</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-label-mono text-label-mono text-on-surface-variant mb-2">PROBLEM SUMMARY</h4>
                <p className="font-body-md text-body-md text-on-surface/90 leading-relaxed">
                  Consistent failure in the PDF generation pipeline during high-load periods, primarily affecting complex reports generated by enterprise clients. The current rendering engine times out on documents exceeding 50 pages.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-3 rounded-lg border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Supporting Evidence</span>
                  <span className="font-body-md text-body-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span> 84 Mentions
                  </span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Affected Users</span>
                  <span className="font-body-md text-body-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>business</span> Enterprise Tier
                  </span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">ICE Score</span>
                  <span className="font-body-md text-body-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 8.4
                  </span>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Owner Rec.</span>
                  <span className="font-body-md text-body-md text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">smart_toy</span> Atlas (Eng Agent)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Thinking Summary */}
          <div className="md:col-span-3 flex flex-col gap-unit-4 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '400ms' }}>
            <h2 className="font-headline-md text-headline-md text-on-surface border-b border-white/5 pb-2 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span> AI Thinking
            </h2>
            <div className="space-y-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex gap-3 items-start transition-colors hover:bg-surface-container">
                <span className="font-label-mono text-label-mono text-primary-fixed-dim bg-primary/10 px-1.5 py-0.5 rounded">01</span>
                <p className="font-body-sm text-body-sm text-on-surface/80">Detected repeated export failures in APM logs correlating with support tickets.</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex gap-3 items-start transition-colors hover:bg-surface-container">
                <span className="font-label-mono text-label-mono text-primary-fixed-dim bg-primary/10 px-1.5 py-0.5 rounded">02</span>
                <p className="font-body-sm text-body-sm text-on-surface/80">Revenue impact exceeds threshold for automatic P0 escalation.</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex gap-3 items-start transition-colors hover:bg-surface-container">
                <span className="font-label-mono text-label-mono text-primary-fixed-dim bg-primary/10 px-1.5 py-0.5 rounded">03</span>
                <p className="font-body-sm text-body-sm text-on-surface/80">High enterprise customer exposure identified via CRM sync.</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex gap-3 items-start transition-colors hover:bg-surface-container">
                <span className="font-label-mono text-label-mono text-primary-fixed-dim bg-primary/10 px-1.5 py-0.5 rounded">04</span>
                <p className="font-body-sm text-body-sm text-on-surface/80">Engineering complexity evaluated as moderate based on repository analysis.</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex gap-3 items-start border-l-2 border-l-primary bg-primary/5 transition-colors hover:bg-primary/10">
                <span className="font-label-mono text-label-mono text-primary-fixed-dim bg-primary/20 px-1.5 py-0.5 rounded">05</span>
                <p className="font-body-sm text-body-sm text-on-surface">Recommended for immediate inclusion in next sprint cycle.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Engineering Execution Plan */}
        <section className="mb-unit-16 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '500ms' }}>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-unit-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">architecture</span>
            Engineering Execution Plan
          </h2>
          <div className="flex flex-col gap-unit-6">
            {/* Sprint 1 */}
            <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
              <div className="bg-surface-container-high px-unit-6 py-unit-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Sprint 1: Core Stabilization</h3>
                <span className="font-label-mono text-label-mono bg-white/10 text-on-surface px-2 py-1 rounded">Starts Next Week</span>
              </div>
              <div className="p-unit-6 space-y-4">
                <SprintTaskRow 
                  icon="priority_high"
                  iconColorClass="text-error"
                  title="Fix export rendering engine timeout"
                  description="Refactor PDF generation to use streaming chunks instead of buffering entirely in memory."
                  assignee="Atlas"
                  assigneeRole="AI"
                  duration="3 days"
                  status="Ready"
                />
                <SprintTaskRow 
                  icon="keyboard_double_arrow_up"
                  iconColorClass="text-warning"
                  title="Improve retry mechanism"
                  description="Implement exponential backoff for transient rendering failures."
                  assignee="Backend Team"
                  assigneeRole="Human"
                  duration="2 days"
                  status="Ready"
                />
              </div>
            </div>

            {/* Sprint 2 */}
            <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
              <div className="bg-surface-container-high px-unit-6 py-unit-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Sprint 2: Observability</h3>
                <span className="font-label-mono text-label-mono text-on-surface-variant">T+2 Weeks</span>
              </div>
              <div className="p-unit-6 space-y-4">
                <SprintTaskRow 
                  icon="remove"
                  iconColorClass="text-on-surface-variant"
                  title="Add granular monitoring"
                  description="Instrument PDF pipeline to track generation time per page."
                  assignee="DevOps"
                  assigneeRole="Human"
                  duration="2 days"
                  status="Draft"
                />
              </div>
            </div>

            {/* Sprint 3 */}
            <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
              <div className="bg-surface-container-high px-unit-6 py-unit-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Sprint 3: Rollout</h3>
                <span className="font-label-mono text-label-mono text-on-surface-variant">T+4 Weeks</span>
              </div>
              <div className="p-unit-6">
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-lg">
                  <span className="font-label-mono text-label-mono text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined">rocket_launch</span> Production Release Phase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Generated AI Assets */}
        <section className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 translate-y-5" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-unit-8">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">topic</span>
              Generated AI Assets
            </h2>
            <button className="text-primary hover:text-primary-fixed text-sm font-medium transition-colors">Download All</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <AssetCard icon="description" title="Product Requirements" subtitle="PRD.md" colSpan={2} />
            <AssetCard icon="code" title="Engineering Spec" subtitle="Tech_Spec.md" colSpan={2} />
            <AssetCard icon="check_circle" title="Jira Epic" subtitle="" colSpan={1} />
            <AssetCard icon="campaign" title="Rel. Notes" subtitle="" colSpan={1} />
            <AssetCard icon="bug_report" title="Test Plan" subtitle="" colSpan={1} />
            <AssetCard icon="api" title="API Changes" subtitle="OpenAPI_v3.yaml" colSpan={3} type="download" />
            <AssetCard icon="account_tree" title="Architecture Diagram" subtitle="Mermaid.js Generated" colSpan={4} type="external" isGlow={true} />
          </div>
        </section>
      </main>
    </div>
  );
}
