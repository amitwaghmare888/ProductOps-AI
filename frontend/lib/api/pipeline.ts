import { apiGet, apiPost, apiPostFormData } from './client';
import type {
  PipelineRun,
  PipelineResult,
  CreatePipelineRequest,
  CreatePipelineResponse,
} from '@/types/pipeline';
import type { UploadFeedbackResponse } from '@/types/evaluation';

/**
 * Get all pipeline runs
 * TODO: Add pagination support
 */
export async function getPipelineRuns(): Promise<PipelineRun[]> {
  return apiGet<PipelineRun[]>('/pipeline');
}

/**
 * Get a specific pipeline run by ID
 */
export async function getPipelineRun(runId: string): Promise<PipelineResult> {
  return apiGet<PipelineResult>(`/pipeline/${runId}`);
}

/**
 * Create a new pipeline run from text feedback
 */
export async function createPipelineRun(
  request: CreatePipelineRequest
): Promise<CreatePipelineResponse> {
  return apiPost<CreatePipelineResponse, CreatePipelineRequest>('/pipeline', request);
}

/**
 * Upload feedback file (CSV or JSON) and create pipeline run
 */
export async function uploadFeedbackFile(
  file: File
): Promise<UploadFeedbackResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostFormData<UploadFeedbackResponse>('/feedback/upload', formData);
}
