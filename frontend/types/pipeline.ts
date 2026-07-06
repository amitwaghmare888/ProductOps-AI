import type { PipelineStatus } from './api';

/**
 * Pipeline run list item (summary view)
 */
export interface PipelineRun {
  run_id: string;
  status: PipelineStatus;
  created_at: string;
  input_source: string;
  duration_ms: number | null;
}

/**
 * Full pipeline result with all stage outputs
 */
export interface PipelineResult {
  run_id: string;
  status: string;
  created_at: string;
  input_source: string;
  analysis: AnalysisOutput | null;
  prioritization: PrioritizationOutput | null;
  planning: PlanningOutput | null;
  duration_ms: number | null;
  error_message: string | null;
}

/**
 * Analysis stage output from Feedback Analyzer agent
 */
export interface AnalysisOutput {
  summary: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sentiment: string;
  sentiment_score: number;
  category_confidence: number;
  entities: string[];
  platforms: string[];
  needs_review: boolean;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Prioritization stage output from Business Prioritizer agent
 */
export interface PrioritizationOutput {
  prioritized_items: PrioritizedItem[];
  ranking_rationale: string;
  [key: string]: unknown;
}

export interface PrioritizedItem {
  feedback_id: string;
  urgency: string;
  rice_score: number;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  business_justification: string;
  revenue_risk: boolean;
  retention_risk: boolean;
  recommended_action: string;
  business_impact: string;
  [key: string]: unknown;
}

/**
 * Planning stage output from Engineering Planner agent
 */
export interface PlanningOutput {
  tasks: EngineeringTask[];
  total_story_points: number;
  sprint_recommendation: string;
  release_notes: string;
  release_summary: string;
  [key: string]: unknown;
}

export interface EngineeringTask {
  task_id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  title: string;
  description: string;
  technical_approach: string;
  story_points: number;
  effort_estimate: string;
  acceptance_criteria: string[];
  [key: string]: unknown;
}

/**
 * Request body for creating a new pipeline run
 */
export interface CreatePipelineRequest {
  feedback_text: string;
  source: string;
}

/**
 * Response from creating a new pipeline run
 */
export interface CreatePipelineResponse {
  run_id: string;
  status: PipelineStatus;
}
