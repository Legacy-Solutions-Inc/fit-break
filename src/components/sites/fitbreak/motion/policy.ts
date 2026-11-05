/**
 * The one decision point for how much the FitBreak site moves.
 *
 * - `full`    — tablet/desktop, no reduced-motion preference: pinned, scrubbed scenes.
 * - `compact` — phone width (below Tailwind `md`): the same story, nothing pins;
 *               each scene plays once as it enters the screen.
 * - `calm`    — the visitor asked the OS to reduce motion: no pinning, word
 *               splitting, parallax, scrubbing or loops — short fades at most.
 *
 * GSAP scenes pass these queries to `gsap.matchMedia()`; Motion code reads the
 * same queries through `getMotionMode()` / `useMotionMode()`.
 */
export const MOTION_QUERIES = {
  full: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  compact: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  calm: "(prefers-reduced-motion: reduce)",
} as const;

export type MotionMode = keyof typeof MOTION_QUERIES;
export type MotionConditions = Record<MotionMode, boolean>;

/** Client-only: the mode that applies right now. */
export function getMotionMode(): MotionMode {
  if (window.matchMedia(MOTION_QUERIES.calm).matches) return "calm";
  return window.matchMedia(MOTION_QUERIES.full).matches ? "full" : "compact";
}
