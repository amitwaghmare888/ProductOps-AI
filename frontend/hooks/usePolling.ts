import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling data at a fixed interval
 * Prevents overlapping requests by tracking in-flight state
 * 
 * @param callback - Async function to call on each poll
 * @param interval - Polling interval in milliseconds
 * @param enabled - Whether polling is enabled (defaults to true)
 * 
 * @example
 * ```tsx
 * const fetchData = useCallback(async () => {
 *   const data = await api.getData();
 *   setData(data);
 * }, []);
 * 
 * usePolling(fetchData, 3000, shouldPoll);
 * ```
 */
export function usePolling(
  callback: () => void | Promise<void>,
  interval: number,
  enabled = true
) {
  const callbackRef = useRef(callback);
  const isFetchingRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Wrapper that prevents overlapping requests
    const poll = async () => {
      // Skip if previous request still in flight
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Call immediately on mount/enable
    poll();

    // Set up polling interval
    const id = setInterval(poll, interval);

    // Cleanup on unmount
    return () => {
      clearInterval(id);
    };
  }, [interval, enabled]);
}
