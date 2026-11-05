# 9. FitBreak departs visually from the fitbreak.ph clone

Date: 2026-11-05

## Status

Accepted. Amends [0008](0008-fitbreak-motion-two-libraries.md): the clone is no
longer the reference for layout, and Programs is no longer a pinned scene.

## Context

The Information Site was built as a 1:1 clone of fitbreak.ph, and a motion layer
was added on top (ADR 0008). The owner found that the result still reads as
AI-generated, and most of that look comes from the source site itself:

- Inter everywhere
- a centred heading over a grid of identical rounded cards in every section
- pill badges and stat tiles
- gradient cards with corner ribbons
- several competing accent colours

Spec: `docs/specs/2026-11-05-editorial-redesign.md`.

## Decision

The public site stops matching fitbreak.ph visually. Content, facts, photos and
section order still come from the source. The look is now our own:

- **Colour:** one crimson accent on warm paper and ink neutrals.
- **Type:** Archivo condensed for headings and Instrument Sans for body text.
- **Layout:** sports-poster editorial — hairline rules, numbered rows, sharp
  corners, and boxes only for pricing.

The parked Member Area keeps the cloned look until its real flow is confirmed.

## Consequences

- Do not "fix" public pages back to match fitbreak.ph. Differences in layout,
  colour and type are intentional. Differences in facts (prices, times,
  address) are bugs.
- Two visual languages coexist until the Member Area is redesigned:
  - `.fb-ed` marks the public site.
  - `.fb-legacy` marks the Member Area, which also keeps the `.fb-site` v3
    palette pins.
- The homepage now has one pinned scene (the video). Programs reveal row by row.
- The clone's look is recoverable from git (`8b712c9`, motion in `b32fbd7`).
- Alternatives considered:
  - A re-skin only, keeping the layouts. Rejected: the card-grid layouts are
    the main tell.
  - Full art direction, including copy and palette. Deferred: copy changes need
    the studio's sign-off.
