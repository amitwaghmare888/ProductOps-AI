import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ExecutionPipeline } from "@/components/pipeline/execution-pipeline";
import { AiReasoningLog } from "@/components/pipeline/ai-reasoning-log";

export default function PipelinePage() {
  return (
    <>
      <div className="bg-aurora"></div>
      <div className="bg-grid"></div>

      <Sidebar />
      <Topbar />

      <main className="relative z-10 pt-16 pl-0 md:pl-64 flex min-h-screen overflow-hidden">
        {/* Main Pipeline Canvas */}
        <div className="flex-1 overflow-y-auto px-gutter pt-8 pb-32 custom-scrollbar pr-[400px]">
          <ExecutionPipeline />
        </div>
        
        {/* Fixed Right Sidebar */}
        <AiReasoningLog />
      </main>
    </>
  );
}
