"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PipelineVisual } from "@/components/pipeline/pipeline-visual";
import { MagneticBtn } from "@/components/ui/magnetic-btn";
import { BorderBeamBtn } from "@/components/ui/border-beam-btn";

export default function MissionControlHero() {
  return (
    <>
      <div className="bg-aurora"></div>
      <div className="bg-grid"></div>
      
      <Sidebar />
      <Topbar />
      
      <main className="relative z-10 pt-24 pl-0 md:pl-64 min-h-screen">
        <div className="container mx-auto px-gutter max-w-7xl h-[calc(100vh-6rem)] flex items-center">
          <div className="grid lg:grid-cols-2 gap-unit-16 items-center w-full">
            
            {/* Hero Content */}
            <div className="flex flex-col space-y-unit-8">
              <div>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full glass-panel text-primary/60 font-label-mono text-label-caps border border-primary/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  ProductOps AI: Operating System
                </span>
              </div>
              <h1 className="font-headline-lg text-[64px] leading-[1.05] tracking-tighter text-white font-extrabold">
                Turn Customer Feedback <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                  into Product Decisions.
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
                A multi-agent autonomous system that transforms unstructured feedback into engineering-ready execution paths in real-time.
              </p>
              
              {/* Mission Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="glass-panel p-3 rounded-xl border-white/5">
                  <div className="text-primary text-lg font-bold">92%</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label-caps">Confidence</div>
                </div>
                <div className="glass-panel p-3 rounded-xl border-white/5">
                  <div className="text-white text-lg font-bold">18</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label-caps">Processed</div>
                </div>
                <div className="glass-panel p-3 rounded-xl border-white/5">
                  <div className="text-secondary text-lg font-bold">6</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label-caps">AI Agents</div>
                </div>
                <div className="glass-panel p-3 rounded-xl border-white/5">
                  <div className="text-tertiary text-lg font-bold">2.8s</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label-caps">Runtime</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-4 items-center">
                <MagneticBtn className="group px-8 py-4 bg-primary text-on-primary rounded-xl font-bold glow-primary hover:scale-105">
                  Launch System
                </MagneticBtn>
                
                {/* Cinematic Watch AI Think CTA */}
                <BorderBeamBtn>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                  <span className="font-semibold text-white tracking-wide">Watch AI Think</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </BorderBeamBtn>
              </div>
            </div>
            
            {/* AI Pipeline Visual */}
            <PipelineVisual />
          </div>
        </div>
      </main>
    </>
  );
}
