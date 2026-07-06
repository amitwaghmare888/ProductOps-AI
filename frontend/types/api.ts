/**
 * Base API response types and error handling
 */

export interface ApiError {
  detail: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * Common status types used across endpoints
 */
export type PipelineStatus = 'running' | 'completed' | 'failed';

/**
 * Base pagination types (for future use)
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
