# FitBreak homepage clone — source brief

Source: <https://fitbreak.ph/app.html> (build comment `2026-01-09`, fetched 2026-11-04).
Raw source snapshots live in [`source/`](source) (page HTML, header/footer
components, chatbot widget). Side-by-side screenshots are in
[`comparison/`](comparison).

## Route map

| Source                          | Local                                                   |
| ------------------------------- | ------------------------------------------------------- |
| `https://fitbreak.ph/app.html`  | `/` — `src/app/(fitbreak)/page.tsx`                     |
| `/app.html` (logo + legacy URL) | permanent redirect → `/` (`next.config.ts`)             |
| In-page `#pricing`, `#programs` | same anchors on `/`                                     |
| Header "Sign In"                | `/auth/sign-in` (template Supabase auth)                |
| Header "Get Started"            | `/auth/sign-up`                                         |
| All other `/*.html` pages       | **out of scope** — still link to `https://fitbreak.ph/` |

## File ownership

- `src/app/(fitbreak)/layout.tsx` — `.fb-site` wrapper, header, footer, chatbot
- `src/app/(fitbreak)/page.tsx` — section order + metadata + JSON-LD
- `src/app/(fitbreak)/actions.ts` — newsletter Server Action
- `src/app/api/chatbot/route.ts` — server proxy to the source chatbot endpoint
- `src/components/sites/fitbreak/*` — all section components
- `src/services/newsletter.ts` — newsletter service seam (in-memory mock)
- `public/sites/fitbreak/**` — real source assets (images, logo, video, flyer)
- `src/app/globals.css` — `brand`/`accent` theme tokens + `.fb-site` v3 palette pins

## Design tokens (from the source's compiled Tailwind v3 CSS)

- Font: Inter 400–800 (Google Fonts) — template already loads Inter via `next/font`.
- `brand`: 50 #fff5f8 · 100 #ffe8f1 · 200 #ffd1e3 · 300 #ffaad0 · 400 #ff7db7 ·
  **500 #d71e49** · 600 #d83e7d · 700 #c1326d · 800 #9a2b58
- `accent`: 50 #effdfd · 100 #d8f5f4 · 200 #b3ecea · 500 #5ec3c1 · 600 #4aa5a3 ·
  700 #3b8886 · 800 #2c6a69
- Stock colours are Tailwind **v3** hex values (gray = cool gray). Tailwind v4
  ships oklch variants, so `.fb-site` re-pins the v3 values for exact colour.
- v3→v4 renames applied: `shadow-sm`→`shadow-xs`, `bg-gradient-to-*`→`bg-linear-to-*`,
  radius scale pinned by `--radius: 0.5rem` inside `.fb-site`.
- Scrollbar: 10px, track #f1f1f1, thumb #d71e49 (hover #c11a41), radius 5px.
- `html { scroll-behavior: smooth }`.

## Layout (desktop 1470 wide, guest state)

| Section          | top  | height | notes                                                    |
| ---------------- | ---- | ------ | -------------------------------------------------------- |
| Header (sticky)  | 0    | 65     | `bg-white/90 backdrop-blur-xl`, logo h-10                |
| Hero             | 65   | 700    | bg photo `fitbreak12.webp` object 75% center, white fade |
| Video            | 765  | 1168   | `#f5f5f7`, aspect-video card, custom controls            |
| About (`#about`) | 1933 | 518    | 2 photos + 4 stat cards                                  |
| Programs         | 2451 | 1227   | class times, club rules callout, 6 class cards           |
| Pricing          | 3678 | 888    | guest: sign-in gate; member: fee banner + 4 packs        |
| Newsletter       | 4566 | 284    | gray-900                                                 |
| Contact          | 4850 | 686    | info card + Google Maps iframe (min-h 450)               |
| Footer           | 5536 | 509    | 3 columns + bottom bar                                   |

## Behaviour

- **Time:** promo banner `banner-bounce` 2s loop (paused on hover), button
  `button-pulse` 1.5s; `animate-pulse` dot; on `load`, every `.bg-white.rounded-2xl`
  fades up (opacity 0 → 1, translateY 20px → 0, 0.5s) staggered `index × 100ms`
  in document order (header dropdown 0, metrics 1–4, stats 5–8, classes 9–14,
  pricing gate 15, packs 16–19).
- **Click:** About Us dropdown (outside click closes); mobile menu toggle
  (hamburger ↔ close); notifications bell does nothing for guests; video
  play/pause (first play unmutes), sound toggle, seek bar, fullscreen (two
  buttons), replay after end; video pauses when <30% visible; chatbot bubble
  toggles a 350×500 window, Enter/send posts to the Dialogflow proxy.
- **Hover:** cards lift (`-translate-y-1`, shadow-lg), CTA colour shifts.
- **Auth state:** signed in ⇒ header shows Book Class + avatar menu, metrics
  dashboard is shown, pricing packs replace the sign-in gate.
- **Mobile (<1024):** promo banner moves inline above the text with
  `animate-pulse`; chatbot sits at `bottom: 80px`; nav collapses at <768.

## Known source quirks (reproduced or noted)

- `md:text-right` on the corporate CTA column is absent from the source's
  compiled CSS, so the live site centres it — the clone centres it too.
- In v3, a responsive `lg:text-5xl` / `md:text-2xl` resets line-height and beats
  `leading-*`; v4 does the opposite. The clone adds `lg:leading-none` /
  `md:leading-8` to reproduce the v3 result.
- Footer year renders empty on the source (its inline script never runs after
  injection). The clone renders the current year.
- The chatbot Cloud Function currently returns HTTP 500 for every message, so
  the live widget always answers "Sorry, I'm having trouble connecting…". The
  clone proxies the same endpoint and shows the same message on failure.
- Accessibility (inherited, flagged in `e2e/a11y.spec.ts`): brand-600 text on
  white and gray-400 "Click to play" fail `color-contrast`; "Coach Iren" fails
  `link-in-text-block`.

## Verification (2026-11-04)

- Desktop 1470×801 and mobile 500×685: every section's top and height match the
  source exactly (document height 6045 / 8141).
- Checked by real input: About dropdown + outside-click close, mobile menu,
  hero anchor → `#pricing`, video play (unmutes) / mute / seek / auto-pause on
  scroll, newsletter submit states, chatbot open + send + failure message,
  members-only states (temporarily forced, since Supabase is not configured).
- No console errors, CSP violations, broken images or failed requests.

## Remaining differences

- Newsletter subscribers go to an in-memory mock (`src/services/newsletter.ts`),
  not the source's Firestore; errors show inline instead of `alert()`.
- Member metrics are the source's fixed sample figures, not real member data.
- Sign In / Get Started use the template's Supabase auth pages instead of the
  source's Firebase `/login.html` (Google/Facebook one-tap not reproduced).
- Card entrance animation starts at hydration rather than `window.load`, and
  cards stay hidden until their delay instead of flashing visible first.
- Hero heading is an `<h1>` (source: `<h2>`; the source's only `<h1>` is in the
  hidden member dashboard). Visual output is identical.

## Full-site clone (2026-11-04)

Every page the homepage links to is now cloned locally; nothing links to
fitbreak.ph. Old `.html` URLs permanently redirect (`legacyRedirects` in
`src/components/sites/fitbreak/links.ts`, wired in `next.config.ts`;
`/blog-post.html?id=X` → `/blog/X`). Builder conventions:
[`builders.md`](builders.md).

| Live page                                                                                         | Local route                                            |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| how-it-works, pricing, schedule                                                                   | `/how-it-works` `/pricing` `/schedule`                 |
| our-story, fitbreakers, club-rules, corporate                                                     | `/our-story` `/fitbreakers` `/club-rules` `/corporate` |
| calapan1/about                                                                                    | `/calapan1/about`                                      |
| blog, blog-post?id=                                                                               | `/blog`, `/blog/[id]` (24 posts, local images)         |
| privacy-policy, terms-of-service                                                                  | `/privacy-policy` `/terms-of-service`                  |
| login(?mode=signup)                                                                               | `/login` (Supabase auth)                               |
| dashboard, bookings, payments, profile, settings, trainers, programs, workout-tracker, statistics | `/member/*` (sign-in required)                         |
| admin                                                                                             | `/dashboard` (template admin, role-gated)              |

Data: `src/services/fitbreak/` — `catalog.ts` (programs, slots, packages),
`members.ts` (credits, bookings, payments; in-memory mock, every account seeded
with 8 demo credits, payments stay "pending"), `fitness.ts` (workout log,
goals, body metrics), `blog.ts`/`blog-data.ts`, `assistant.ts` (local chatbot
answers — the live Dialogflow backend was returning HTTP 500).

Verified: crawl of 55 local pages → 0 links to fitbreak.ph, 0 broken links or
assets; page heights equal to the source for /our-story, /corporate, /blog,
/blog/[id]; booking by click (credits 8 → 7, "✓ Booked", listed in bookings).

Known differences:

- 9 live pages (club-rules, fitbreakers, how-it-works, pricing, privacy, programs,
  schedule, terms, calapan1/about) never load the Inter webfont and fall back to
  the system font; the clone uses Inter everywhere, so text there wraps
  slightly differently (e.g. /club-rules +24px, /fitbreakers +26px).
- Member pages could not be observed signed-in on the live site; they are built
  from the page HTML + scripts.
- The GCash number is not published on the live site; checkout says "Need our
  GCash number? Call or text 0965 944 1194" (placeholder wording — confirm).
- Mobile layouts were not re-checked visually for the new pages.

## Information Site mode (2026-11-04)

Decided with the owner: FitBreak runs as an **Information Site** for now; the
**Member Area** is parked (terms in `CONTEXT.md`). Switch: `memberAreaEnabled`
in `src/config.ts` (currently `false`).

While parked:

- `/login`, `/member/*`, `/how-it-works`, `/auth/*`, `/dashboard/*` redirect to
  `/` (middleware), as do the old `.html` URLs for those pages.
- Pricing is public on `/` and `/pricing`; the expired "January 2026 Special"
  banner is removed.
- Every booking/purchase button is a **Booking Enquiry**: Messenger
  (`m.me/FitBreakPhilippines`, `contact.messenger`) with "or call" where it fits.
- `/schedule` is a read-only weekly timetable (`schedule/weekly-timetable.tsx`).
- Account wording changed only where it would mislead (hero, pricing payment
  steps + FAQ, Visit Us card, chatbot). Package booking rules stay as studio
  policy. Privacy/Terms are verbatim.
- Header: no bell / Sign In / Get Started — one "Message Us" button; no help
  tour on `/pricing`.
- Sitemap lists the Information Site pages + blog posts; robots disallows the
  parked areas.

To bring accounts back: set `memberAreaEnabled = true`, then revisit
How It Works and the account wording against the real flow.

## Motion layer (2026-11-04)

A deliberate departure from the 1:1 clone, in motion only. Content, layout,
links and the Booking Enquiry flow are unchanged. Sources:
`docs/specs/2026-11-04-motion-redesign.md` (spec) and
`docs/adr/0008-fitbreak-motion-two-libraries.md` (why two libraries).

- Code: `src/components/sites/fitbreak/motion/`
  - `policy.ts`: the full / compact / calm modes
  - `home-scenes.tsx`: GSAP storyboard
  - `reveal-scope.tsx`: Motion reveal layer
- Page entrance plus reveal on every page: `(site)/template.tsx`.
- Homepage scenes: hero intro; Video pinned (the card grows to full screen);
  About parallax and lines; Programs pinned (sideways track); Pricing tilt and
  shine.
- Phones (below `md`) never pin. Reduce motion gives fades only, with no pins,
  split text, parallax or loops.
- Video backdrop: `public/sites/fitbreak/videos/intro-loop.mp4`, 9s, 848 KB,
  silent. It is cut from 0:45–0:49.5 and 0:54.5–0:59.5 of the intro, with the
  burned-in subtitles cropped off. Poster: `images/intro-loop-poster.jpg`. The
  full 26 MB intro now uses `preload="none"`, so it loads only on play.
- Header slims on scroll. The "Message Us" button nudges until a Messenger link
  is clicked (sessionStorage only). Pills press in; `.fb-lift` cards rise on
  hover.
- Tests: `e2e/motion.spec.ts` (all three modes). `e2e/a11y.spec.ts` now runs
  with and without reduced motion.
