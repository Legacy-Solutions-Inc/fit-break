# FitBreak clone — builder brief (shared by every page builder)

Goal: recreate fitbreak.ph pages **1:1** inside this Next.js 15 app so that
**no link ever points to fitbreak.ph**. Same text, same structure, same look,
same behaviour — with data from this app's own mock-first service layer.

The homepage (`/`) is already done — read it first, it is the reference for
every convention below: `src/app/(fitbreak)/(site)/page.tsx` and
`src/components/sites/fitbreak/*` (hero.tsx, programs.tsx, pricing.tsx, …).

## Evidence (read-only)

- Source HTML of every page: `docs/research/fitbreak/source/pages/*.html`
  (`calapan1/about.html` for the coach page). Header/footer are injected by
  `/components/loader.js` and already exist as React components.
- Source scripts (behaviour, data rules): `docs/research/fitbreak/source/scripts/`
  (schedule.js, bookings.js, payments.js, dashboard.js, profile.js, settings.js,
  programs.js, referral.js, onboarding-tour.js, member-sidebar.js, auth.js,
  chatbot.js, styles.css = the source's compiled Tailwind v3 CSS).
- Top-of-page desktop screenshots (1470px wide, 0.5 scale):
  `docs/research/fitbreak/source/screens/*.top.jpg`.
- Homepage notes: `docs/research/fitbreak/app.md`.

## Where things go

- Pages: `src/app/(fitbreak)/(site)/<route>/page.tsx` — this group's layout
  already renders the site header, `<main>`, footer and chatbot. Render only the
  source's main content. `/login` is the exception (full-screen, no chrome):
  `src/app/(fitbreak)/login/page.tsx`.
- Members-only pages: `src/app/(fitbreak)/(site)/member/<name>/page.tsx`. The
  member layout (`member/layout.tsx`, sidebar) is owned by the booking builder.
- Components: `src/components/sites/fitbreak/<area>/…` (one folder per page/area
  you own, e.g. `content/`, `blog/`, `member/`, `schedule/`, `auth/`).
- Server Actions: next to the route as `actions.ts` (`"use server"`, zod-validated).
- Assets: `public/sites/fitbreak/images/…` already holds the source photos and
  logos (fitbreak1–8/11/12, iren_new.jpg, stretching-lady.jpg, logos, …). If a
  page needs a file that is missing, download it from `https://fitbreak.ph/…`
  into `public/sites/fitbreak/…` and check its real type with `file`.

## Routes — always link through `routes` (src/components/sites/fitbreak/links.ts)

`routes.home /how-it-works /pricing /schedule /our-story /calapan1/about
/fitbreakers /club-rules /corporate /blog routes.blogPost(id) /privacy-policy
/terms-of-service /login routes.signup(/login?mode=signup)` and
`routes.member.{dashboard,bookings,payments,profile,settings,trainers,programs,workoutTracker,statistics}`,
`routes.admin` (staff only). Map every source `href="/x.html"` to its route.
External links that are not fitbreak.ph (Facebook, Instagram, Google Maps,
fusionict.com, `mailto:`/`tel:`) stay as they are. In-page `#anchors` stay.

## Data & auth

- Signed-in member: `getMember()` (null for guests) / `requireMember()` (redirects
  guests to /login; returns a demo member in dev when Supabase isn't configured)
  from `@/lib/fitbreak/member`.
- Catalogue: `@/services/fitbreak/catalog` (PROGRAMS, TIME_SLOTS, PACKAGES,
  ANNUAL_MEMBERSHIP_FEE_PHP, PAYMENT_DETAILS, formatTime, upcomingClassDates, …).
- Member data: `@/services/fitbreak/members` (getAccount, listBookings,
  getBookingCounts, bookClass, cancelBooking, listPayments, submitPayment,
  updateProfile, updateSettings). In-memory mock; mutate only via Server Actions.
- Never call Firebase/Firestore or any fitbreak.ph endpoint at runtime.

## Tailwind v3 (source) → v4 (this app) — translate every class

Everything inside `.fb-site` already has the source's exact v3 hex palettes
(gray, red, orange, amber, yellow, green, emerald, teal, cyan, blue, indigo,
purple, pink, rose, plus `brand-*`/`accent-*`) and v3 radii for
`rounded-md/lg/xl`. Do **not** edit `globals.css`.

| v3 source                       | write in v4                        |
| ------------------------------- | ---------------------------------- |
| `shadow-sm`                     | `shadow-xs`                        |
| `shadow` (bare)                 | `shadow-sm`                        |
| `bg-gradient-to-r` etc.         | `bg-linear-to-r` etc.              |
| `rounded` (bare)                | `rounded-[4px]`                    |
| `rounded-sm`                    | `rounded-[2px]`                    |
| `outline-none`                  | `outline-hidden`                   |
| `ring` (bare)                   | `ring-3`                           |
| `blur` / `backdrop-blur` (bare) | `blur-sm` / `backdrop-blur-sm`     |
| `flex-shrink-0` / `flex-grow`   | `shrink-0` / `grow` (either works) |
| input placeholder               | add `placeholder:text-gray-400`    |

Cascade traps (v3 ≠ v4): in v3 a **responsive** font-size (`md:text-2xl`) also
resets line-height and beats an explicit `leading-*`; in v4 `leading-*` wins. If
the source combines `leading-*` with a responsive `text-*`, add the size's v3
line-height at that breakpoint (e.g. `lg:text-5xl` → also `lg:leading-none`;
`md:text-2xl` → `md:leading-8`). In v4 `hover:scale-*`/`translate-*` use the
`scale`/`translate` properties — a CSS `@keyframes transform` no longer
overrides them.

**Dead classes:** the source's prebuilt CSS omits some classes its markup uses
(e.g. `md:text-right` on the homepage), so they do nothing on the live site and
must be dropped. When a class looks surprising, check it exists:
`grep -cF '.md\:text-right' docs/research/fitbreak/source/scripts/styles.css`
(escape `:`, `/`, `[`, `]`, `.` with a backslash as CSS does).

## Code conventions

- Server Components by default; `"use client"` only for interactive pieces.
- `next/image` (`fill` + `sizes`, or width/height) for photos and logos.
- Icons: copy the source's inline SVG paths. `Icon` from `../icons` has common
  Heroicons; for anything else write a local SVG in your own folder (do not
  edit `icons.tsx`).
- `cn()` from `@/lib/utils`. Per-page `export const metadata` with the source's
  `<title>` (use `title: { absolute: "…" }`) and description.
- No `alert()`/`confirm()` — use inline messages or the `sonner` toast.
- Accessibility: real `<button>`s, labels for inputs, `alt` text from the source.

## Shared files — read-only for builders

`globals.css`, `links.ts`, `icons.tsx`, `site-header.tsx`, `site-footer.tsx`,
`chatbot.tsx`, the `(fitbreak)` layouts, `next.config.ts`, `src/middleware.ts`,
`src/lib/fitbreak/member.ts`, `src/services/fitbreak/catalog.ts`. Only the
booking builder may change `src/services/fitbreak/members.ts`. If you need a
change in a shared file, describe it in your final report instead.

## Verify (no browser unless your brief says so)

- `pnpm type:check` and `pnpm lint` must pass for your files.
- A preview dev server is already running at **http://localhost:3124** (hot
  reload). Check each route with
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3124/<route>` (expect 200) and grep the HTML for key headings/text.
- Do **not** run `pnpm build`, delete `.next*`, start/stop servers, run `pnpm add`,
  or commit. Another builder works in parallel on other files.

## Report back

Routes built, files created, every deviation from the source (and why), and any
shared-file change you need.
