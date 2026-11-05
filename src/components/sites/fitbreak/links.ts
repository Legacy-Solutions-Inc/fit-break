import type { CSSProperties } from "react";

/**
 * Every FitBreak page, cloned locally. Link through this map — never to the
 * live fitbreak.ph site. The live `.html` paths permanently redirect to these
 * (see `legacyRedirects` and next.config.ts).
 */
export const routes = {
  home: "/",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  schedule: "/schedule",
  ourStory: "/our-story",
  coach: "/calapan1/about",
  fitbreakers: "/fitbreakers",
  clubRules: "/club-rules",
  corporate: "/corporate",
  blog: "/blog",
  blogPost: (id: string) => `/blog/${encodeURIComponent(id)}`,
  privacy: "/privacy-policy",
  terms: "/terms-of-service",
  login: "/login",
  signup: "/login?mode=signup",
  member: {
    dashboard: "/member/dashboard",
    bookings: "/member/bookings",
    payments: "/member/payments",
    profile: "/member/profile",
    settings: "/member/settings",
    trainers: "/member/trainers",
    programs: "/member/programs",
    workoutTracker: "/member/workout-tracker",
    statistics: "/member/statistics",
  },
  /** Staff area: the template's role-gated admin dashboard. */
  admin: "/dashboard",
} as const;

/** Live-site paths → local routes. Consumed by next.config.ts redirects. */
export const legacyRedirects: ReadonlyArray<readonly [string, string]> = [
  ["/app.html", routes.home],
  ["/index.html", routes.home],
  ["/how-it-works.html", routes.howItWorks],
  ["/pricing.html", routes.pricing],
  ["/schedule.html", routes.schedule],
  ["/our-story.html", routes.ourStory],
  ["/calapan1/about.html", routes.coach],
  ["/fitbreakers.html", routes.fitbreakers],
  ["/club-rules.html", routes.clubRules],
  ["/corporate.html", routes.corporate],
  ["/blog.html", routes.blog],
  ["/privacy-policy.html", routes.privacy],
  ["/terms-of-service.html", routes.terms],
  ["/login.html", routes.login],
  ["/dashboard.html", routes.member.dashboard],
  ["/bookings.html", routes.member.bookings],
  ["/payments.html", routes.member.payments],
  ["/profile.html", routes.member.profile],
  ["/settings.html", routes.member.settings],
  ["/trainers.html", routes.member.trainers],
  ["/programs.html", routes.member.programs],
  ["/workout-tracker.html", routes.member.workoutTracker],
  ["/statistics.html", routes.member.statistics],
  ["/admin.html", routes.admin],
];

/** A cloned asset served from `public/sites/fitbreak`. */
export function asset(path: string): string {
  return `/sites/fitbreak${path}`;
}

/**
 * Stagger index for the page-load card entrance (`.fb-card-in`). Indices mirror
 * the source's document order of `.bg-white.rounded-2xl` — see
 * docs/research/fitbreak/app.md → Behaviour.
 */
export function cardIn(index: number): CSSProperties {
  return { "--fb-i": index } as CSSProperties;
}

export const contact = {
  email: "calapan1@fitbreak.ph",
  phoneDisplay: "0965 944 1194",
  phoneHref: "tel:+639659441194",
  facebook: "https://facebook.com/FitBreakPhilippines/",
  /** Booking Enquiry channel (CONTEXT.md): Messenger chat with the Facebook page. */
  messenger: "https://m.me/FitBreakPhilippines",
  instagram: "https://instagram.com/FitBreakPhilippines/",
} as const;

export const classTimes = [
  "6:30 - 7:30 AM",
  "9:00 - 10:00 AM",
  "4:30 - 5:30 PM",
  "6:00 - 7:00 PM",
  "7:30 - 8:30 PM",
] as const;
