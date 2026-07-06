'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { AgentCard } from '@/components/ui/AgentCard';
import { motion } from 'framer-motion';

const agents = [
  {
    name: 'Feedback Analyzer',
    type: 'alpha' as const,
    icon: 'psychology',
    status: 'idle' as const,
    description: 'Analyzes customer feedback, extracts entities, sentiment, and categorizes issues',
    metrics: {
      latency: '1.2s',
      tokens: '~1.5K',
      confidence: '94%',
      lastActive: '2 min ago',
    },
  },
  {
    name: 'Business Prioritizer',
    type: 'network' as const,
    icon: 'analytics',
    status: 'idle' as const,
    description: 'Scores feedback using RICE framework, ranks by business impact and urgency',
    metrics: {
      latency: '0.8s',
      tokens: '~2K',
      confidence: '91%',
      lastActive: '2 min ago',
    },
  },
  {
    name: 'Engineering Planner',
    type: 'system' as const,
    icon: 'engineering',
    status: 'idle' as const,
    description: 'Generates implementation tasks, estimates effort, creates acceptance criteria',
    metrics: {
      latency: '2.1s',
      tokens: '~3K',
      confidence: '89%',
      lastActive: '2 min ago',
    },
  },
  {
    name: 'Architecture Agent',
    type: 'alpha' as const,
    icon: 'account_tree',
    status: 'idle' as const,
    description: 'Maps system architecture, identifies dependencies, suggests integration patterns',
    metrics: {
      latency: '1.5s',
      tokens: '~2.5K',
      confidence: '92%',
      lastActive: '5 min ago',
    },
  },
  {
    name: 'Evaluation Agent',
    type: 'network' as const,
    icon: 'science',
    status: 'idle' as const,
    description: 'LLM-as-judge framework for quality assurance across all pipeline stages',
    metrics: {
      latency: '3.2s',
      tokens: '~4K',
      confidence: '96%',
      lastActive: '10 min ago',
    },
  },
];

export default function AgentsPage() {
  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="AI Agent Swarm"
        subtitle="Autonomous agents orchestrated for intelligent product operations"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <AgentCard
                name={agent.name}
                type={agent.type}
                icon={agent.icon}
                status={agent.status}
              >
                <div className="space-y-4">
                  <p className="text-body-base text-on-surface-variant leading-relaxed">
                    {agent.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">LATENCY</p>
                      <p className="font-body-bold text-on-surface">{agent.metrics.latency}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">TOKENS</p>
                      <p className="font-body-bold text-on-surface">{agent.metrics.tokens}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">CONFIDENCE</p>
                      <p className="font-body-bold text-on-surface">{agent.metrics.confidence}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">LAST ACTIVE</p>
                      <p className="font-body-bold text-on-surface">{agent.metrics.lastActive}</p>
                    </div>
                  </div>
                </div>
              </AgentCard>
            </motion.div>
          ))}
        </div>

        <BentoCard className="mt-gutter">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">hub</span>
            </div>
            <div className="flex-1">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-2">
                Agent Orchestration
              </p>
              <p className="text-body-base text-on-surface-variant leading-relaxed mb-4">
                All agents are coordinated by the Orchestrator, which manages workflow execution, 
                handles retries, and ensures data consistency across stages. Agents communicate 
                through a shared memory layer powered by Mem0.
              </p>
              <div className="flex items-center gap-2">
                <span className="dot-success" />
                <span className="text-body-base text-on-surface-variant">All systems operational</span>
              </div>
            </div>
          </div>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}
