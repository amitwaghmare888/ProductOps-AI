/**
 * Evaluation system types for LLM-as-judge framework
 */

/**
 * Evaluation history item (summary view)
 */
export interface EvalHistory {
  eval_id: string;
  created_at: string;
  overall_score: number | null;
  analysis_score: number | null;
  prioritization_score: number | null;
  planning_score: number | null;
  test_cases_total: number;
  test_cases_passed: number;
}

/**
 * Full evaluation result with all test details
 */
export interface EvalResult {
  eval_id: string;
  test_cases_total: number;
  test_cases_passed: number;
  analysis_score: number | null;
  prioritization_score: number | null;
  planning_score: number | null;
  overall_score: number | null;
  details: TestDetail[];
}

/**
 * Individual test case result
 */
export interface TestDetail {
  test_id: string;
  description: string;
  input: string;
  passed: boolean;
  analysis_score: number;
  prioritization_score: number;
  planning_score: number;
  overall_score: number;
  analysis_details?: StageDetails;
  prioritization_details?: StageDetails;
  planning_details?: StageDetails;
  error?: string;
}

/**
 * Detailed feedback for a single stage
 */
export interface StageDetails {
  reasoning: string;
  [key: string]: unknown;
}

/**
 * Request body for running evaluation
 */
export interface RunEvaluationRequest {
  test_subset?: string[] | null;
}

/**
 * Upload feedback file request (multipart/form-data)
 */
export interface UploadFeedbackResponse {
  run_id: string;
  status: string;
  message?: string;
}
