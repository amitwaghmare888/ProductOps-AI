'use client';

import React, { useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlowVariant = 'default' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue';
export type GlowSize    = 'sm' | 'md' | 'lg';

interface GlowCardProps {
  /** Visual color accent for the glow. @default 'violet' */
  variant?: GlowVariant;
  /** Padding preset. @default 'md' */
  size?: GlowSize;
  /** Whether to show the glow effect. @default true */
  glow?: boolean;
  /** Additional className forwarded to the outer wrapper. */
  className?: string;
  children: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VARIANT_COLOR: Record<GlowVariant, string> = {
  default: 'rgba(139, 139, 170, 0.35)',
  violet:  'rgba(139, 92, 246, 0.45)',
  emerald: 'rgba(52, 211, 153, 0.40)',
  amber:   'rgba(251, 191, 36, 0.40)',
  red:     'rgba(248, 113, 113, 0.40)',
  blue:    'rgba(96, 165, 250, 0.40)',
};

const VARIANT_BORDER: Record<GlowVariant, string> = {
  default: 'border-[#2a2a3a]',
  violet:  'border-violet-500/30',
  emerald: 'border-emerald-500/30',
  amber:   'border-amber-500/30',
  red:     'border-red-500/30',
  blue:    'border-blue-500/30',
};

const SIZE_PADDING: Record<GlowSize, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GlowCard
 *
 * A production-quality card primitive that renders a subtle radial glow
 * following the mouse cursor on hover. Zero runtime dependencies beyond React.
 *
 * @example
 * <GlowCard variant="violet" size="md">
 *   <p>Content</p>
 * </GlowCard>
 */
export function GlowCard({
  variant = 'violet',
  size = 'md',
  glow = true,
  className = '',
  children,
}: GlowCardProps) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number | null>(null);

  const glowColor = VARIANT_COLOR[variant];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!glow || !cardRef.current || !glowRef.current) return;

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current || !glowRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glowRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${glowColor}, transparent 70%)`;
        glowRef.current.style.opacity = '1';
      });
    },
    [glow, glowColor],
  );

  const handleMouseLeave = useCallback(() => {
    if (!glowRef.current) return;
    glowRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        'relative overflow-hidden rounded-xl border bg-[#111118]',
        'transition-shadow duration-300',
        VARIANT_BORDER[variant],
        SIZE_PADDING[size],
        className,
      ].join(' ')}
    >
      {/* Glow overlay — pointer-events-none so it never blocks children */}
      {glow && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-300"
        />
      )}

      {/* Content sits above glow layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default GlowCard;
