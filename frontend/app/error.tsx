'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="card space-y-4 text-center">
          {/* Error icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#f0f0f8]">Something went wrong</h2>
            <p className="text-sm text-[#8b8baa] mt-2">
              An unexpected error occurred. This has been logged for investigation.
            </p>
          </div>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="text-xs text-[#4a4a6a] cursor-pointer hover:text-[#8b8baa] transition-colors">
                Error details (dev only)
              </summary>
              <pre className="mt-2 text-xs text-red-400 bg-[#09090f] rounded-lg p-3 border border-red-500/20 overflow-auto max-h-40">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={reset}
              className="btn-primary flex-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </button>
            <Link href="/" className="btn-ghost flex-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go home
            </Link>
          </div>
        </div>

        {/* Support info */}
        <div className="card-sm border-[#2a2a3a] text-center">
          <p className="text-xs text-[#4a4a6a]">
            If this problem persists, please contact support
            {error.digest && (
              <span className="block mt-1 font-mono text-[10px]">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
