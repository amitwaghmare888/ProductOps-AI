"use client";

import { cn } from "@/lib/utils";

interface AssetCardProps {
  icon: string;
  title: string;
  subtitle: string;
  colSpan?: 1 | 2 | 3 | 4;
  isGlow?: boolean;
  type?: "standard" | "download" | "external";
}

export function AssetCard({
  icon,
  title,
  subtitle,
  colSpan = 1,
  isGlow = false,
  type = "standard"
}: AssetCardProps) {
  const colSpanClass = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
  }[colSpan];

  if (type === "download") {
    return (
      <a href="#" className={cn(
        "bg-surface-container border border-white/5 hover:border-primary/30 rounded-xl p-5 flex items-center justify-between relative overflow-hidden magnetic-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
        colSpanClass
      )}>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant transition-colors">{icon}</span>
          <div className="text-left">
            <h4 className="font-body-md text-body-md font-medium text-on-surface">{title}</h4>
            <span className="font-label-caps text-label-caps text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">download</span>
      </a>
    );
  }

  if (type === "external") {
    return (
      <a href="#" className={cn(
        "bg-surface-container border border-white/5 hover:border-primary/30 rounded-xl p-5 flex items-center justify-between relative overflow-hidden magnetic-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        colSpanClass,
        isGlow && "shadow-[0_0_20px_rgba(124,92,255,0.15)] shadow-primary/20"
      )}>
        {isGlow && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-tertiary/5 opacity-50"></div>}
        <div className="flex items-center gap-4 relative z-10">
          <span className={cn("material-symbols-outlined text-3xl transition-colors", isGlow ? "text-primary" : "text-on-surface-variant")}>{icon}</span>
          <div className="text-left">
            <h4 className="font-body-md text-body-md font-medium text-on-surface">{title}</h4>
            <span className="font-label-caps text-label-caps text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        <span className={cn("material-symbols-outlined relative z-10", isGlow ? "text-primary" : "text-on-surface-variant")}>open_in_new</span>
      </a>
    );
  }

  // Standard centered type
  return (
    <a href="#" className={cn(
      "bg-surface-container border border-white/5 hover:border-primary/30 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden magnetic-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
      colSpanClass
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
      <span className="material-symbols-outlined text-4xl text-on-surface-variant transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <div>
        {colSpan > 1 ? (
          <>
            <h4 className="font-body-md text-body-md font-medium text-on-surface">{title}</h4>
            <span className="font-label-caps text-label-caps text-on-surface-variant">{subtitle}</span>
          </>
        ) : (
          <h4 className="font-label-mono text-label-mono text-on-surface">{title}</h4>
        )}
      </div>
    </a>
  );
}
