import { apiGet, apiPost } from './client';
import type {
  EvalHistory,
  EvalResult,
  RunEvaluationRequest,
} from '@/types/evaluation';

/**
 * Get evaluation history
 */
export async function getEvaluationHistory(): Promise<EvalHistory[]> {
  return apiGet<EvalHistory[]>('/evaluate');
}

/**
 * Run a new evaluation
 */
export async function runEvaluation(
  request: RunEvaluationRequest = {}
): Promise<EvalResult> {
  return apiPost<EvalResult, RunEvaluationRequest>('/evaluate', request);
}
