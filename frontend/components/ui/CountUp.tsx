'use client';

import React, { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CountUpProps {
  /** Target numeric value to count to. */
  to: number;
  /** Starting value. @default 0 */
  from?: number;
  /** Animation duration in milliseconds. @default 1200 */
  duration?: number;
  /** Number of decimal places. @default 0 */
  decimals?: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "ms", "%"). */
  suffix?: string;
  /** Easing function — 'linear' | 'easeOut' | 'easeInOut'. @default 'easeOut' */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  /**
   * Start counting when the element enters the viewport.
   * Uses IntersectionObserver when available. @default true
   */
  onVisible?: boolean;
  /** Additional className applied to the <span> wrapper. */
  className?: string;
}

// ─── Easing ───────────────────────────────────────────────────────────────────

function ease(type: CountUpProps['easing'], t: number): number {
  switch (type) {
    case 'linear':    return t;
    case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'easeOut':
    default:          return 1 - Math.pow(1 - t, 3);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CountUp
 *
 * Animates a number from `from` to `to` using requestAnimationFrame.
 * Respects `prefers-reduced-motion`: renders the final value instantly when
 * the user has opted into reduced motion.
 *
 * @example
 * <CountUp to={2847} suffix=" items" duration={1500} className="text-2xl font-bold" />
 */
export function CountUp({
  to,
  from = 0,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing = 'easeOut',
  onVisible = true,
  className = '',
}: CountUpProps) {
  const [value, setValue] = useState<number>(from);
  const [started, setStarted] = useState<boolean>(!onVisible);
  const wrapperRef  = useRef<HTMLSpanElement>(null);
  const rafRef      = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check reduced-motion preference once at mount
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // IntersectionObserver — triggers animation when card scrolls into view
  useEffect(() => {
    if (!onVisible || started) return;

    const el = wrapperRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, started]);

  // Animation loop
  useEffect(() => {
    if (!started) return;

    // Skip animation if reduced-motion is preferred
    if (prefersReduced) {
      setValue(to);
      return;
    }

    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;

      const elapsed  = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedT   = ease(easing, progress);
      const current  = from + (to - from) * easedT;

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(to); // guarantee exact final value
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [started, to, from, duration, easing, prefersReduced]);

  const formatted = value.toFixed(decimals);

  return (
    <span ref={wrapperRef} className={className} aria-live="polite" aria-atomic="true">
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default CountUp;
