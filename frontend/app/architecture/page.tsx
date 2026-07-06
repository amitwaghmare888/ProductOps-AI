'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';
import { motion } from 'framer-motion';

const architectureComponents = [
  {
    name: 'Frontend',
    icon: 'web',
    color: 'primary',
    tech: 'Next.js 15, React, TypeScript, Tailwind',
    description: 'Modern web interface with real-time updates',
    connections: ['API Gateway'],
  },
  {
    name: 'API Gateway',
    icon: 'api',
    color: 'secondary',
    tech: 'FastAPI, Python 3.11+',
    description: 'RESTful API with async endpoints',
    connections: ['Orchestrator', 'Database'],
  },
  {
    name: 'Agent Swarm',
    icon: 'psychology',
    color: 'tertiary',
    tech: 'Gemini 2.0, LangChain',
    description: '5 specialized AI agents with tool calling',
    connections: ['Orchestrator', 'LLM', 'Memory'],
  },
  {
    name: 'Orchestrator',
    icon: 'hub',
    color: 'primary',
    tech: 'Python, Async Workflow',
    description: 'Coordinates agent execution and state',
    connections: ['Agent Swarm', 'Database'],
  },
  {
    name: 'LLM',
    icon: 'neurology',
    color: 'secondary',
    tech: 'Gemini 2.0 Flash Thinking',
    description: 'Large language model with extended reasoning',
    connections: ['Agent Swarm'],
  },
  {
    name: 'Memory Layer',
    icon: 'memory',
    color: 'tertiary',
    tech: 'Mem0, Vector Store',
    description: 'Persistent context and agent memory',
    connections: ['Agent Swarm', 'Vector DB'],
  },
  {
    name: 'Vector DB',
    icon: 'database',
    color: 'primary',
    tech: 'Chroma / Qdrant',
    description: 'Embeddings and semantic search',
    connections: ['Memory Layer'],
  },
  {
    name: 'Database',
    icon: 'storage',
    color: 'secondary',
    tech: 'SQLite / PostgreSQL',
    description: 'Pipeline runs, results, history',
    connections: ['API Gateway', 'Orchestrator'],
  },
];

export default function ArchitecturePage() {
  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="System Architecture"
        subtitle="End-to-end architecture of the ProductOps AI platform"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {architectureComponents.map((component, idx) => (
            <motion.div
              key={component.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <BentoCard className="hover:scale-[1.02] transition-transform">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${component.color}/10 border border-${component.color}/20 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-2xl text-${component.color}`}>
                      {component.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline-sm text-headline-sm text-on-surface mb-1">
                      {component.name}
                    </p>
                    <p className="font-code-block text-code-block text-on-surface-variant font-mono text-xs">
                      {component.tech}
                    </p>
                  </div>
                </div>
                
                <p className="text-body-base text-on-surface-variant mb-4 leading-relaxed">
                  {component.description}
                </p>
                
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                    CONNECTIONS
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {component.connections.map(conn => (
                      <span key={conn} className="badge-secondary text-xs">
                        {conn}
                      </span>
                    ))}
                  </div>
                </div>
              </BentoCard>
            </motion.div>
          ))}
        </div>

        <BentoCard className="mt-gutter">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">
                account_tree
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-2">
                Data Flow
              </p>
              <div className="space-y-3 text-body-base text-on-surface-variant leading-relaxed">
                <p>
                  <span className="font-body-bold text-on-surface">1. Ingestion:</span> Frontend uploads feedback CSV → API Gateway validates and stores
                </p>
                <p>
                  <span className="font-body-bold text-on-surface">2. Orchestration:</span> Orchestrator triggers sequential agent execution with retries
                </p>
                <p>
                  <span className="font-body-bold text-on-surface">3. Analysis:</span> Feedback Analyzer extracts entities, sentiment, category, severity
                </p>
                <p>
                  <span className="font-body-bold text-on-surface">4. Prioritization:</span> Business Prioritizer applies RICE scoring and ranks items
                </p>
                <p>
                  <span className="font-body-bold text-on-surface">5. Planning:</span> Engineering Planner generates tasks with effort estimates
                </p>
                <p>
                  <span className="font-body-bold text-on-surface">6. Delivery:</span> Results streamed back to frontend via polling, stored in database
                </p>
              </div>
            </div>
          </div>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}
