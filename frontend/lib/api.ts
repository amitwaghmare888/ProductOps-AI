/**
 * Shared API configuration for the ProductOps AI frontend.
 *
 * Single source of truth for all backend URLs used across:
 *   - Client components (page.tsx files — browser-side fetch)
 *   - Server-side API routes (app/api/ — Node.js server-side fetch)
 *
 * Environment variables:
 *   NEXT_PUBLIC_API_URL  — Full API base URL including /api/v1 prefix.
 *                          Used by client components (exposed to the browser).
 *   BACKEND_URL          — Backend origin without path prefix.
 *                          Used by Next.js API routes (server-side only, never
 *                          sent to the browser).
 *
 * Fallback:
 *   Both default to 127.0.0.1 (IPv4 loopback) — NOT localhost.
 *   On Windows, localhost often resolves to [::1] (IPv6) while uvicorn
 *   binds to 127.0.0.1 (IPv4), causing ERR_CONNECTION_REFUSED.
 */

/**
 * Client-side API base URL (browser fetch).
 *
 * Includes the /api/v1 prefix so callers can append endpoint paths directly:
 *   `${API_BASE}/pipeline`
 *   `${API_BASE}/evaluate`
 *
 * Set NEXT_PUBLIC_API_URL in .env.local to override.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Server-side backend origin (Next.js API routes only).
 *
 * Does NOT include any path prefix — API routes append /api/v1/... themselves:
 *   `${BACKEND_URL}/api/v1/pipeline`
 *
 * This variable is NOT prefixed with NEXT_PUBLIC_ and is therefore
 * never exposed to the browser.
 *
 * Set BACKEND_URL in .env.local to override.
 */
export const BACKEND_URL =
  process.env.BACKEND_URL || 'http://127.0.0.1:8000';
