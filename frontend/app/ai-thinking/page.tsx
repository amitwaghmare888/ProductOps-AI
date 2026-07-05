import { Sidebar } from "@/components/layout/sidebar";
import { TopTelemetryBar } from "@/components/ai-thinking/top-telemetry";
import { BottomMetrics } from "@/components/ai-thinking/bottom-metrics";
import { PipelineStage } from "@/components/ai-thinking/pipeline-stage";
import { LiveReasoning } from "@/components/ai-thinking/live-reasoning";

export default function AiThinkingPage() {
  return (
    <>
      {/* Backgrounds */}
      <div className="bg-aurora"></div>
      <div className="bg-grid"></div>

      {/* Global Sidebar */}
      <Sidebar />

      <main className="relative z-10 pl-0 md:pl-64 flex flex-col min-h-screen">
        {/* Specific Top Telemetry Bar */}
        <TopTelemetryBar />

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Center Stage: Pipeline Visualization */}
          <div className="flex-1 flex flex-col relative px-margin-desktop overflow-y-auto custom-scrollbar pr-[320px]">
            <PipelineStage />
          </div>

          {/* Right Panel: Live AI Thinking */}
          <LiveReasoning />
        </div>

        {/* Bottom Metrics Panel */}
        <div className="pr-[320px]">
          <BottomMetrics />
        </div>
      </main>
    </>
  );
}
