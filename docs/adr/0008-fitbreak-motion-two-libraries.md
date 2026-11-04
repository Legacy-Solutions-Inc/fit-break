# 8. FitBreak motion layer: GSAP for the homepage scenes, Motion for the rest

Date: 2026-11-04

## Status

Accepted

## Context

The FitBreak Information Site was a 1:1 clone of fitbreak.ph. Before showing it
to the studio, the owner chose a deliberate departure from the clone, in motion
only: a showcase homepage with two pinned, scroll-scrubbed scenes, and a lighter
layer on every other page (spec: `docs/specs/2026-11-04-motion-redesign.md`).
Most visitors are on mid-range Android phones, and the site must respect
"Reduce motion". The strict per-request nonce CSP allows inline styles, but not
inline scripts.

## Decision

- **GSAP** (ScrollTrigger + SplitText; free under GSAP's standard licence) drives
  the homepage storyboard only. It is imported only by the homepage scene
  components, so other pages never load it.
- **Motion** (the successor to Framer Motion; its small `animate`/`inView` DOM
  API) drives the light reveal layer on every page.
- Page entrances are a **CSS keyframe** on the route template. It runs before
  JS, needs no exit animation, and never leaves a transform behind that would
  break the pinned scenes.
- One **motion policy** (`full` / `compact` / `calm`, keyed to the Tailwind `md`
  breakpoint and `prefers-reduced-motion`) is shared by both libraries.
- Content is never hidden by server-rendered CSS, apart from the hero's opening
  state. That pre-hide applies only under `@media (scripting: enabled)` and
  clears itself after 2.5s if the script never takes over.

## Consequences

- Two animation libraries to keep up to date. Each is confined to its role:
  GSAP to the homepage scenes, Motion to the reveal layer.
- Pinned scenes rely on no ancestor carrying a `transform`. The page entrance
  therefore uses `animation-fill-mode: backwards`, and the sticky header slims
  without changing its footprint (height shrinks while a bottom margin grows).
- The 1:1 clone is no longer the visual reference for motion; content and
  layout still are. The 1:1 state is recoverable from git (`8b712c9`).
- Alternatives considered: Motion for everything (pinned, scrubbed scenes are
  clumsier in it), and GSAP for everything (more than the light layer needs, and
  less natural in React).
