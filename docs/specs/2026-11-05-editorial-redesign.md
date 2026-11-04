# FitBreak editorial redesign

Date: 2026-11-05 · Status: implemented (homepage approved at the checkpoint, then rolled out)

## Problem Statement

The FitBreak Information Site reads as AI-generated. It inherits the template
look of fitbreak.ph, which we cloned 1:1: Inter everywhere; a centred heading,
grey subtitle and grid of identical rounded white cards in every section; pill
badges, stat tiles, icons in tinted circles, gradient cards with corner ribbons;
and five competing accent colours (crimson, pink washes, teal, yellow, green,
purple, navy). The owner wants the site to look like a real studio's site
before showing it.

## Solution

A deliberate visual departure from the clone. Content, facts, photos and section
order stay. Typography, colour, layout and component styling change, using one
sports-poster editorial language across every public page.

## Decisions (from the grilling session)

1. **Scope: re-skin plus re-layout.** Sections may change shape. Section order,
   photos and the studio's facts and copy stay. Copy is trimmed only where
   listed below. Casing may change through CSS; the text itself does not.
2. **Colour: one brand red on warm neutrals.** Crimson (`#d71e49`, from the
   logo) is the only accent, used sparingly for primary buttons and a few key
   words. The base is warm off-white "paper" and warm near-black "ink", plus one
   warm grey family. Pink washes, gradients, teal, yellow, green, purple and
   navy are removed from public pages.
3. **Type: athletic.** Headings use Archivo at a condensed width and heavy
   weight, echoing the slanted logo. Body text uses Instrument Sans. Both are
   self-hosted through `next/font`.
4. **Layout language: sports-poster editorial.** Headings are left-aligned on an
   asymmetric grid. Hairline rules and numbered rows replace boxed cards.
   Corners are sharp and decorative shadows are dropped. Boxes remain only where
   visitors compare options (pricing).
5. **Programs: numbered rows, no pin.** Six full-width rows with the name in
   large condensed type. Each rule draws across and each name slides in once.
   The intro video is now the homepage's only pinned scene. This amends the
   motion spec (`2026-11-04-motion-redesign.md`) and ADR 0008.
6. **Pricing.**
   - The three packs sit side by side in flat columns, compared by price per
     class.
   - Discounts become plain text ("Save 29%").
   - Standard is the single highlighted pack: an ink column with a crimson
     button. Power keeps a "Best value" text label.
   - Guest Drop-In becomes one line above the packs.
7. **Hero: full-bleed poster.**
   - The photo runs edge to edge with a dark scrim, and the headline is huge
     condensed type in white with "Choose Yourself" in crimson.
   - A small all-caps line carries the location and "Now open".
   - The five bullets become one line: coach-led, air-conditioned, circuit
     training. Booking and payment facts stay in the pricing and contact
     sections.
   - One crimson button plus a text link. The tilted sticker goes.
8. **Small pieces.**
   - The stat tiles become one oversized line of type.
   - Class times become a timetable strip.
   - The Club House Rules banner becomes a single text link.
   - The newsletter moves onto paper with an underlined field.
   - The footer becomes solid ink with a large motto.
   - The assistant's chat bubble is restyled.
9. **Reach.** Every public page (`/`, pricing, schedule, our story, coach, blog
   and posts, corporate, how it works, fitbreakers, club rules, legal) gets the
   new system. The parked Member Area (`/member/*`, `/login`) is left as is,
   including its Inter type.
10. **Checkpoint.** The shared base and the homepage are built first. The owner
    reviews desktop and phone screenshots, then the remaining pages follow.
11. **Branch.** Work lands on `feat-clone`. This spec and ADR 0009 record the
    reasoning.

## User Stories

1. As a visitor, I want the site to feel like a real local studio and not a
   template, so that I trust it enough to message them.
2. As a visitor on a phone, I want the hero to show the studio's photo and one
   clear "Book your first class" action, so that I know what to do next.
3. As a visitor, I want to scan the six class formats quickly by name, so that I
   can find the one I want.
4. As a visitor, I want to compare packs by price per class, so that I can see
   which pack is worth it.
5. As a first-timer, I want the Drop-In option stated plainly, so that I know I
   can try one class without committing.
6. As a visitor, I want the class times readable at a glance, so that I can see
   if one fits my day.
7. As a visitor, I want pricing and schedule pages to match the homepage, so
   that the site feels like one place.
8. As a visitor who prefers reduced motion, I want the redesign to stay calm,
   so that nothing pins or slides.
9. As the owner, I want the Member Area untouched for now, so that it can be
   redesigned once its real flow is confirmed.

## Implementation Decisions

- **Tokens.** `ink`, `paper`, `bone`, `rule`, `mute` and `crimson` are global
  Tailwind theme colours. `font-display` (Archivo) and `font-sans` (Instrument
  Sans) are scoped to `.fb-ed`.
- **Scope classes.**
  - The public site's chrome and pages render inside `.fb-ed`.
  - Member Area screens opt out with `.fb-legacy`, which restores Inter.
  - The `.fb-site` v3 palette pins stay for the Member Area.
- **Shared components.**
  - Small editorial primitives in the FitBreak component folder: a section
    eyebrow/heading block, buttons (primary crimson, ink, text link with an
    arrow), and the timetable strip.
  - The pack pricing (Drop-In line, pack columns, corporate block) lives in
    its own module, shared by the homepage and `/pricing`. It is kept free of
    the homepage's GSAP scenes so `/pricing` never loads that animation code.
- **Motion.** The GSAP Programs scene changes from a pinned sideways track to a
  once-only row reveal. The pricing rise-in keeps its stagger but drops the tilt
  and shine. The hero and video scenes keep their behaviour; the video frame
  stays square-cornered throughout.

## Testing Decisions

- The existing Playwright motion and a11y suites are the seam. Tests check what
  a visitor sees, not class names.
- Update `e2e/motion.spec.ts`:
  - Desktop pins only the video scene: one pin, not two.
  - Program rows still end up visible in every mode.
- The axe a11y gate now covers every public page, plus one blog post, with
  every rule enabled. It waits for entrance animations to settle first, so
  contrast is measured on settled text.
- The axe a11y gate must stay green. Contrast is a real risk with grey-on-paper
  text and white-on-photo text, so tones are chosen to pass AA.
- Lint, type-check, unit tests, build and e2e must stay green.

## Out of Scope

- Copy rewrites beyond the trims listed above.
- New photography or new brand colours.
- The Member Area and `/login`.
- A dark-mode variant.

## Further Notes

The 1:1 clone remains recoverable from git (`8b712c9`; motion added in
`b32fbd7`).
