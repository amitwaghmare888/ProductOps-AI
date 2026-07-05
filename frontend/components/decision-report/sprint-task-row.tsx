"use client";

import { cn } from "@/lib/utils";

interface SprintTaskRowProps {
  icon: string;
  iconColorClass: string;
  title: string;
  description: string;
  assignee: string;
  assigneeRole: string;
  duration: string;
  status: "Ready" | "Draft";
}

export function SprintTaskRow({
  icon,
  iconColorClass,
  title,
  description,
  assignee,
  assigneeRole,
  duration,
  status
}: SprintTaskRowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all duration-200 hover:scale-[1.01] hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-4">
        <span className={cn("material-symbols-outlined mt-0.5", iconColorClass)} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <div>
          <h4 className="font-body-lg text-body-lg text-on-surface font-medium">{title}</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 md:min-w-[300px] justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
          <span className="font-label-mono text-label-mono text-on-surface">{assignee} ({assigneeRole})</span>
        </div>
        <span className="font-label-mono text-label-mono text-on-surface-variant">{duration}</span>
        {status === "Ready" ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps border border-primary/20">
            Ready
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-label-caps border border-white/5">
            Draft
          </span>
        )}
      </div>
    </div>
  );
}
