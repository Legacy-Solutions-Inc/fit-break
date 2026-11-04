# Spec: FitBreak motion redesign

Status: implemented (2026-11-04) · Source of truth: this spec + [CONTEXT.md](../../CONTEXT.md) +
[ADR 0004](../adr/0004-rsc-server-actions-first.md) · Decided in a grilling session on 2026-11-04

> **Amended 2026-11-05** by [the editorial redesign](2026-11-05-editorial-redesign.md): Programs is no
> longer a pinned sideways scene (rows reveal once instead), and the pricing tilt and shine are dropped.

## Problem Statement

The FitBreak **Information Site** is a faithful 1:1 clone of fitbreak.ph. It is
correct but static: apart from a few hover colour changes, a bouncing promo
banner, a pulsing promo button, staggered pricing cards and the chatbot's typing
dots, nothing moves. The owner is about to present the site to the studio, and a
static copy of the old site does not feel like a step forward. They want the site
to feel alive and premium — "award-site" motion — without changing what it says,
what it shows, or how a visitor makes a **Booking Enquiry**.

Most visitors arrive from Facebook or Messenger on mid-range Android phones over
mobile data, so the motion must not make the site slow, stuttery, heavy to
download, or uncomfortable for people who are sensitive to motion.

## Solution

A deliberate departure from the 1:1 clone, in motion only. Text, photos,
colours, layout and every link stay as they are; the site gains a motion layer:

- **The homepage gets a showcase storyboard** — a load-in hero, two pinned,
  scroll-scrubbed scenes (Video and Programs), parallax in About, a tilted
  staggered entrance and shine sweep in Pricing, and a calm finish.
- **Every other public page gets a light, consistent layer** — headings, cards
  and images ease in as they scroll into view.
- **Moving between pages** fades and lifts the new page in; the header and
  footer stay put.
- **Small interactions** sitewide — the header slims and gains a shadow on
  scroll, buttons press, cards lift, and the "Message Us" button nudges
  occasionally until clicked.
- **Phones** get the same story without pinning: each scene plays once as it
  enters the screen.
- **Visitors with "Reduce motion" turned on** get a calm version of the same
  site: no pinning, no word splitting, no parallax, no scrubbing, no loops —
  only short fades. All content is present and readable.
- **The Video scene** plays a short silent loop (about 1–2 MB) as a backdrop
  while the video grows to full screen; pressing play still opens the full
  intro video with sound and the existing controls.

There is no runtime on/off switch. The work is built directly on the
`feat-clone` branch; the 1:1 clone remains recoverable from git history
(commit `8b712c9`).

## User Stories

### Homepage — showcase

1. As a first-time visitor, I want the hero headline to appear word by word when the page loads, so that the site immediately feels polished and alive.
2. As a first-time visitor, I want the hero studio photo to slowly settle from a slight zoom, so that the opening feels cinematic rather than static.
3. As a first-time visitor, I want the hero bullets and buttons to arrive in sequence after the headline, so that my eye is guided from the promise to the action.
4. As a visitor, I want the existing promo banner bounce and button pulse to keep working, so that the current offer still draws attention.
5. As a desktop visitor, I want the Video section to hold in place while I scroll and the intro video to grow from a rounded card to fill the screen, so that the studio tour becomes a memorable moment.
6. As a desktop visitor, I want the Video section's big heading to fade back as the video grows, so that the focus shifts from words to the studio itself.
7. As a visitor, I want a short silent loop of the studio to play inside the growing video frame, so that the scene feels alive without me pressing anything.
8. As a visitor on mobile data, I want the backdrop loop to be a small file rather than the full intro video, so that the homepage doesn't use up my data.
9. As a visitor, I want pressing play to open the full intro video with sound and the familiar controls (seek, mute, fullscreen, replay), so that I can still watch the whole tour.
10. As a visitor, I want the full intro video to pause when I scroll it mostly off screen, as it does today, so that it doesn't keep playing out of sight.
11. As a visitor, I want the two About photos to drift at different speeds as I scroll, so that the section has depth.
12. As a visitor, I want the About text to appear line by line, so that the story reads like it is being told to me.
13. As a desktop visitor, I want the Programs section to hold in place while the program cards slide past sideways as I scroll, so that each class format gets its own moment.
14. As a desktop visitor, I want to be able to scroll back up through the Programs scene and see it reverse cleanly, so that the page never feels stuck or broken.
15. As a visitor, I want the Club House Rules card and the schedule links in Programs to stay reachable and clickable during and after the scene, so that motion never hides a link.
16. As a visitor, I want the pricing cards to rise in one after another with a slight tilt, so that comparing packages feels engaging.
17. As a visitor, I want the "most popular" pricing card to get a light shine sweep, so that the recommended package stands out.
18. As a visitor, I want Newsletter and Contact to fade in simply, so that the page ends calmly where I take action.
19. As a visitor who scrolls quickly to the bottom (or jumps there via an in-page link), I want every section's content to end up fully visible, so that nothing is ever left invisible because I skipped its animation.
20. As a visitor who reloads mid-page, I want the content around me to be visible and the scenes to be in the right state for my scroll position, so that the page doesn't look broken after a refresh.

### Phones

21. As a phone visitor, I want the same storyboard in the same order without sections that pin, so that my scrolling is never hijacked or stuck.
22. As a phone visitor, I want the Video scene to play once (the frame grows, the heading fades) when it enters the screen, so that I still get the moment without pinning.
23. As a phone visitor, I want the Programs cards to animate in once when they enter the screen instead of scrolling sideways, so that I can read every program normally.
24. As a phone visitor, I want the hero word-by-word reveal kept, so that the first impression is the same as on desktop.
25. As a phone visitor on a mid-range Android, I want animations to stay smooth while the address bar shows and hides, so that the site never feels janky.
26. As a tablet visitor, I want the desktop scenes, so that larger screens get the full showcase.

### Reduce motion

27. As a visitor with "Reduce motion" turned on, I want no pinned sections, so that scrolling behaves normally and doesn't make me dizzy.
28. As a visitor with "Reduce motion" turned on, I want headlines shown whole rather than split into flying words, so that text is calm and readable.
29. As a visitor with "Reduce motion" turned on, I want no parallax, scrubbing, tilt, shine sweeps or looping animations, so that nothing moves continuously on screen.
30. As a visitor with "Reduce motion" turned on, I want the Video section to show the still photo instead of the silent loop, so that nothing plays on its own.
31. As a visitor with "Reduce motion" turned on, I want only short, gentle fades, so that the site still feels finished rather than abrupt.
32. As a visitor with "Reduce motion" turned on, I want page changes to be instant or a brief fade, so that navigation is comfortable.
33. As a visitor with "Reduce motion" turned on, I want the "Message Us" button not to nudge, so that nothing tugs at my attention.

### Other public pages — light layer

34. As a visitor on Pricing, Schedule, Our Story, the Coach page, FitBreakers, Club Rules, Corporate, the Blog, a blog post, Privacy or Terms, I want headings, cards and images to ease in as they scroll into view, so that the whole site feels consistent with the homepage.
35. As a reader of a long page (a blog post, Privacy, Terms, Club Rules), I want body text to be readable immediately without waiting on animation, so that motion never gets in the way of reading.
36. As a visitor on the Schedule page, I want the weekly timetable cards to ease in, so that the timetable feels part of the same site.
37. As a visitor on the Blog, I want post cards to ease in as I scroll, and filtering by category to still work instantly, so that browsing is lively but responsive.
38. As a visitor using the browser's back button, I want the page I return to to show its content immediately, so that going back never replays a wall of animations or shows a blank page.

### Page transitions

39. As a visitor, I want the new page's content to fade and lift in (about 0.3 s) when I follow an internal link, so that moving around the site feels smooth.
40. As a visitor, I want the header and footer to stay put during a page change, so that the site feels like one place.
41. As a visitor, I want link clicks to respond immediately (no waiting for the old page to animate out), so that navigation never feels slow.
42. As a visitor following a legacy `.html` link, I want to land on the right page with the same transition, so that redirects feel seamless.

### Small interactions

43. As a visitor, I want the header to get slimmer and gain a soft shadow once I scroll, so that it stays out of the way but is always there.
44. As a visitor, I want buttons to press in slightly when I tap or click them, so that I get feedback that my tap registered.
45. As a desktop visitor, I want cards to lift slightly on hover, so that I can tell what is interactive.
46. As a visitor, I want the "Message Us" button to give a small nudge every so often, so that I notice the way to make a Booking Enquiry.
47. As a visitor who has already clicked "Message Us", I want the nudge to stop, so that the site doesn't keep pestering me.
48. As a keyboard user, I want focus outlines and focus order unchanged by any animation, so that I can still navigate everything.

### Quality and trust

49. As a visitor on a slow connection, I want the homepage's animation code to load only on the homepage, so that other pages stay light.
50. As a visitor, I want content to be visible even if animation code fails or loads late, so that I can always read the site.
51. As a search engine or link-preview crawler, I want all text present in the server-rendered HTML, so that the site is indexed and previewed correctly.
52. As the studio owner, I want every Booking Enquiry path (Messenger and call) to work exactly as before, so that the redesign never costs us an enquiry.
53. As the site maintainer, I want the reasons for the two-library choice recorded, so that a future developer isn't surprised by it.
54. As the site maintainer, I want the existing tests, accessibility checks and production build to keep passing, so that the redesign doesn't regress the site.

## Implementation Decisions

**Scope and direction**

- This is an intentional departure from the 1:1 clone, in motion only. Text, images, colours, layout, routes, links and the Booking Enquiry flow are unchanged. The parked **Member Area** pages are out of scope and stay untouched.
- Built directly on `feat-clone` with **no runtime on/off switch**. The 1:1 clone stays recoverable from git history.

**Libraries**

- **GSAP** (with its ScrollTrigger and SplitText plugins, now free) drives the homepage storyboard only. It is loaded only by the homepage's scene components, never by the shared layout.
- **Motion** (the successor to Framer Motion) drives the light reveal layer sitewide. Page transitions and small interactions are plain CSS (see below) — lighter, and they run before JS.
- Two libraries is a conscious trade-off: GSAP is the stronger tool for pinned, scrubbed scenes; Motion is the more natural fit for React-level reveals and transitions. Record this in a new ADR (next number after 0007).
- The existing strict nonce CSP already allows inline styles (which both libraries write), so the CSP does not change. No new external origins.

**Architecture — respecting ADR 0004 (Server Components first)**

- Pages and sections stay Server Components and keep rendering all their text server-side. Motion is added through small client "island" wrappers that receive server-rendered children, not by converting sections to client components wholesale.
- **Reveal primitive (light layer):** one shared client wrapper that eases its children in when they scroll into view (fade + small lift, optional stagger for lists). Used on every public page except the parts of the homepage that have their own scene. Plays once per element per page view.
- **Homepage scenes:** one client component per storyboard beat (Hero, Video, About, Programs, Pricing), each owning its GSAP timeline and its ScrollTrigger instances and cleaning them up on unmount (GSAP's React context/cleanup pattern), so client navigation away from and back to the homepage leaves no stale pins or listeners.
- **Motion policy (a single shared decision point):** every animated component asks one shared source which mode applies — `full` (desktop/tablet, no reduced motion), `compact` (phone width, no reduced motion: no pinning, play-once scenes), or `calm` (reduced motion: fades only, no pin/split/parallax/scrub/loop). Phone vs desktop follows the existing Tailwind `md` breakpoint so motion and layout agree. GSAP scenes use `matchMedia` with the same conditions; Motion components use the same policy (Motion's reduced-motion support plus the breakpoint).
- **No-JS / late-JS safety:** content is never hidden by server-rendered CSS. Hidden "before" states are applied only by client code once it has decided to animate, so if scripts fail or load late, content is visible. Elements already in view (or above the viewport after a reload or jump) render in their final state.
- **Programs scene:** on desktop the section pins and the program cards translate horizontally with scroll; on reverse scroll it un-scrubs. The Club House Rules card and the schedule links stay in the DOM and in tab order throughout. On phones and in calm mode the cards are a normal stacked list with a play-once or fade reveal.
- **Video scene:** on desktop the section pins while the video frame scales from a rounded card to full viewport and the heading fades back. The frame plays a new **silent backdrop loop** (8–10 s, no audio track, roughly 1–2 MB, cut from the existing intro video with ffmpeg, plus a poster frame), autoplaying muted, inline and looping, only while on screen. Pressing play swaps to the existing full intro video and its custom player (sound, seek, mute, fullscreen, replay, auto-pause when under 30% visible). In calm mode the still photo shows instead of the loop.
- **Hero:** the headline is split into words (SplitText) and revealed on load; the photo eases from a slight scale to 1. The accessible name of the headline stays the full sentence (screen readers must not read word fragments). The existing promo bounce and pulse CSS animations are kept as they are.
- **About:** the two photos parallax at different rates (desktop only); text reveals by line.
- **Pricing:** cards rise with stagger and a slight tilt; the "most popular" card gets a one-time shine sweep. This supersedes the existing CSS staggered card entrance on the homepage pricing cards.
- **Page transitions:** an enter-only CSS keyframe (fade + small lift, about 0.45 s, `animation-fill-mode: backwards` so no transform lingers to break the pins) on the route template, which re-mounts per route, beneath the persistent header and footer. No exit animation (Next.js App Router does not support exit animations without a fragile frozen-router workaround). Calm mode: no lift, a brief fade or none.
- **Header:** slims and gains a soft shadow once the page is scrolled past a small threshold; keeps the existing desktop/mobile menus and the "Message Us" button.
- **Buttons and cards:** a press-scale on buttons and a hover lift on cards, applied as shared utility styles rather than per-component bespoke code where possible.
- **"Message Us" nudge:** a small periodic nudge on the header "Message Us" button; once the visitor clicks any Messenger link in the session, the nudge stops for the rest of that session (session-only memory, no cookies, no analytics). No nudge in calm mode.
- **Performance budget:** animate only `transform` and `opacity` (and the clip/scale of the video frame); no layout-triggering properties in scroll handlers. GSAP and SplitText code must not appear in the bundles of non-home pages. The backdrop loop must stay under about 2 MB.
- **Docs:** add a short note to the FitBreak research notes describing the motion layer as a deliberate deviation from the source. `CONTEXT.md` is unchanged (no new domain terms).

## Testing Decisions

- **One test point: Playwright browser tests of visible behaviour**, extending the existing `e2e` suite (prior art: the smoke spec that checks parked routes, legacy redirects and public pricing, and the a11y spec that runs axe on `/` and `/schedule` with documented inherited debt on `/`). No unit tests of animation internals; they would break whenever timings are tuned.
- A good test here asserts what a visitor can see or do — text visible, element pinned or not, which video source is playing, link works, no console errors — never class names, timeline internals or exact timings.
- Tests run in three motion modes, matching the shared policy:
  - **Calm:** emulate `prefers-reduced-motion: reduce`. After scrolling through, every homepage section's headings and key text are visible; no element is pinned at any scroll position; the Video section shows the still photo and no autoplaying video; the hero headline is one whole readable heading.
  - **Full (desktop viewport):** scroll the homepage top to bottom with real wheel input; at the end, every section's headings and key text are visible (nothing stuck at zero opacity or off screen); while scrolling through the Video and Programs sections, the section stays fixed in the viewport (it is pinned); the backdrop video is the small silent loop, and pressing play switches to the full intro video and shows the player controls.
  - **Compact (phone viewport, e.g. a Pixel-class device profile):** scroll top to bottom; nothing ever pins; all content ends up visible; every program card is readable.
- **Navigation:** following internal links between public pages keeps the header in place and shows the new page's heading; browser back shows content immediately; legacy `.html` redirects still land on the right page.
- **Interactions:** the header changes state (slimmer/shadow) after scrolling; the "Message Us" nudge stops after a Messenger link is clicked (asserted by visible state, not timers).
- **Safety:** every tested page loads without console errors; the no-fitbreak.ph-links and no-parked-links checks still pass.
- **Accessibility:** the axe checks on `/` and `/schedule` keep passing in both full and calm modes, with the existing documented inherited debt on `/` unchanged and no new violations.
- **Bundle check:** a test confirms a non-home page does not load the GSAP scene code (for example, by inspecting the scripts requested on that page).
- The existing unit tests, lint, type check, Prettier check and production build must stay green.

## Out of Scope

- Any change to content, copy, photos, colours, layout, routes or the Booking Enquiry flow.
- The parked Member Area pages, `/login`, and the template's `/auth/*` and `/dashboard/*`.
- A runtime switch between the motion version and the 1:1 clone.
- Exit page transitions and shared-element transitions between pages.
- Custom cursor, magnetic buttons and a scroll-progress bar.
- Smooth-scroll hijacking libraries (for example Lenis): native scrolling is kept.
- Replacing or re-encoding the full 26 MB intro video (flagged separately; only the new small loop is added).
- Fixing the inherited colour-contrast debt on the homepage.
- Analytics on animations or the nudge.

## Further Notes

- The site is being demoed to the studio on the owner's next call; the homepage storyboard is the priority, then the light layer and transitions, then small interactions.
- Pinned scenes on phones are the classic source of scroll stutter (the mobile address bar resizes the viewport); this is why phones get play-once scenes.
- The two pinned scenes are the only places where scroll position drives animation progress; everything else plays once when it enters view.
- The 1:1 clone notes in the FitBreak research folder remain the reference for content and layout; the motion layer sits on top of them.
