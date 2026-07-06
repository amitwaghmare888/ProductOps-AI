'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { motion } from 'framer-motion';

export default function ReportPage() {
  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Decision Report"
        subtitle="Executive summary and strategic recommendations"
      >
        <BentoCard>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">
                description
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline-md text-headline-md text-on-surface mb-2">
                Executive Summary
              </p>
              <p className="text-body-base text-on-surface-variant leading-relaxed">
                This report synthesizes insights from recent feedback analysis, prioritization decisions, 
                and engineering plans to provide strategic recommendations for product development.
              </p>
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BentoCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-error">
                    priority_high
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  High Priority
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-body-bold text-on-surface mb-1">
                    Critical Bug Fixes
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    3 high-severity issues requiring immediate attention
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-body-bold text-on-surface mb-1">
                    Performance Issues
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    Latency complaints from enterprise customers
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BentoCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-primary">
                    business_center
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  Business Impact
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-stat-lg text-stat-lg text-primary mb-1">
                    8.4
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    Average RICE score across prioritized items
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-stat-lg text-stat-lg text-emerald-400 mb-1">
                    +45%
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    Projected user satisfaction increase
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BentoCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-tertiary">
                    construction
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  Engineering Effort
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-stat-lg text-stat-lg text-tertiary mb-1">
                    34
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    Total story points estimated
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <p className="font-body-bold text-on-surface mb-1">
                    2–3 sprints
                  </p>
                  <p className="text-body-base text-on-surface-variant text-sm">
                    Recommended timeline
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>
        </div>

        <BentoCard>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-4">
            Strategic Recommendations
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'Prioritize Stability',
                description: 'Address critical bugs and performance issues before adding new features to maintain customer trust and satisfaction.',
                icon: 'verified',
                color: 'emerald-400',
              },
              {
                title: 'Incremental Rollout',
                description: 'Deploy high-priority fixes in smaller batches to reduce risk and enable faster feedback cycles.',
                icon: 'update',
                color: 'primary',
              },
              {
                title: 'Resource Allocation',
                description: 'Allocate 60% of engineering capacity to high-priority items, 30% to medium, and 10% to innovation.',
                icon: 'pie_chart',
                color: 'tertiary',
              },
              {
                title: 'Continuous Monitoring',
                description: 'Implement enhanced telemetry to track the impact of changes and identify emerging issues earlier.',
                icon: 'monitoring',
                color: 'amber-400',
              },
            ].map((rec, idx) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              >
                <div className={`w-10 h-10 rounded-lg bg-${rec.color}/10 flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-${rec.color}`}>
                    {rec.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-body-bold text-on-surface mb-1">{rec.title}</p>
                  <p className="text-body-base text-on-surface-variant leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">
                lightbulb
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-2">
                Next Steps
              </p>
              <ol className="space-y-2 text-body-base text-on-surface-variant">
                <li>1. Review and approve prioritized backlog with product leadership</li>
                <li>2. Assign engineering tasks to teams based on expertise and capacity</li>
                <li>3. Schedule sprint planning sessions to break down high-priority items</li>
                <li>4. Set up monitoring dashboards to track progress and impact</li>
                <li>5. Schedule retrospective after first sprint to refine process</li>
              </ol>
            </div>
          </div>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}
