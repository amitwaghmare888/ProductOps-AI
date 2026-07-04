'use client';

import React, { Children, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StaggerDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface StaggerChildrenProps {
  /**
   * Delay between each child animation in milliseconds.
   * @default 80
   */
  staggerMs?: number;
  /**
   * Duration of each child's entrance animation.
   * @default 400
   */
  durationMs?: number;
  /**
   * Direction the children appear from.
   * @default 'up'
   */
  direction?: StaggerDirection;
  /**
   * Distance to translate from. Ignored when direction is 'none'.
   * @default 16
   */
  distance?: number;
  /**
   * Delay before the first child starts animating (ms).
   * @default 0
   */
  initialDelayMs?: number;
  /**
   * Whether to trigger only when the container enters the viewport.
   * @default true
   */
  onVisible?: boolean;
  /** Additional className applied to the outer wrapper div. */
  className?: string;
  children: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIRECTION_TRANSFORM: Record<StaggerDirection, string> = {
  up:    'translateY(VALpx)',
  down:  'translateY(-VALpx)',
  left:  'translateX(VALpx)',
  right: 'translateX(-VALpx)',
  none:  'none',
};

function getInitialTransform(direction: StaggerDirection, distance: number): string {
  if (direction === 'none') return 'none';
  return DIRECTION_TRANSFORM[direction].replace('VAL', String(distance));
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StaggerChildren
 *
 * Wraps any set of children and applies a sequential entrance animation to each.
 * Uses pure CSS transitions (no external dependencies).
 * Respects `prefers-reduced-motion`.
 *
 * @example
 * <StaggerChildren staggerMs={100} direction="up">
 *   <Card />
 *   <Card />
 *   <Card />
 * </StaggerChildren>
 */
export function StaggerChildren({
  staggerMs = 80,
  durationMs = 400,
  direction = 'up',
  distance = 16,
  initialDelayMs = 0,
  onVisible = true,
  className = '',
  children,
}: StaggerChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!onVisible);

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Intersection observer
  useEffect(() => {
    if (!onVisible || visible) return;

    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, visible]);

  const childArray = Children.toArray(children);
  const initialTransform = getInitialTransform(direction, distance);

  return (
    <div ref={containerRef} className={className}>
      {childArray.map((child, index) => {
        // Instant display when reduced-motion is preferred
        const isVisible = visible || prefersReduced;
        const delay = prefersReduced ? 0 : initialDelayMs + index * staggerMs;

        return (
          <div
            key={index}
            style={{
              opacity:    isVisible ? 1 : 0,
              transform:  isVisible ? 'none' : initialTransform,
              transition: prefersReduced
                ? 'none'
                : `opacity ${durationMs}ms ease-out ${delay}ms, transform ${durationMs}ms ease-out ${delay}ms`,
              willChange: isVisible ? 'auto' : 'opacity, transform',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default StaggerChildren;
