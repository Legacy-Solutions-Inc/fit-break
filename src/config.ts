import { env } from "@/env";
import { AuthStrategy } from "@/lib/auth/strategy";
import { getSiteURL } from "@/lib/get-site-url";
import { LogLevel } from "@/lib/logger";

export interface Config {
  site: {
    name: string;
    description: string;
    url: string;
    version?: string;
  };
  logLevel: keyof typeof LogLevel;
  auth: { strategy: keyof typeof AuthStrategy };
  supabase: { url?: string; anonKey?: string };
}

export const config = {
  site: {
    name: "FitBreak",
    description:
      "FitBreak - Women only Fitness Studio in Calapan, Oriental Mindoro. Coach-led bootcamp classes. Book by Messenger or phone.",
    url: getSiteURL(),
    version: env.NEXT_PUBLIC_SITE_VERSION,
  },
  logLevel: env.NEXT_PUBLIC_LOG_LEVEL ?? LogLevel.ALL,
  auth: {
    strategy: env.NEXT_PUBLIC_AUTH_STRATEGY ?? AuthStrategy.SUPABASE,
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
} satisfies Config;

// Fact: are the Supabase env vars present? NEXT_PUBLIC_* vars are inlined at
// build time, so this is fixed for a given build.
export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Fact: is PostHog analytics configured? The project token is publishable and
// inlined at build time. Unset ⇒ the whole analytics integration is inert (no
// init, no network) — mirrors isSupabaseConfigured / isDatabaseConfigured. See
// docs/adr/0007-analytics-posthog.md.
export const isAnalyticsConfigured = Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);

// Toggle: is PostHog Session Replay enabled? OFF by default — replay is WIRED
// but off (the client sets `disable_session_recording: true`). Turning it on
// requires TWO coordinated edits: enable recording in
// src/instrumentation-client.ts AND set this true so the CSP gains
// `worker-src 'self' blob:` (the recorder spawns a `blob:` Web Worker, which
// `strict-dynamic` does NOT cover). Consumed by src/middleware.ts → buildCsp.
export const analyticsSessionReplay = false;

// Fact: is Google Analytics 4 configured for FitBreak? The measurement ID is
// publishable and inlined at build time. Unset ⇒ GA is inert: no script, no
// consent bar, no network, and the CSP gains no Google hosts. Consumed by the
// (site) layout, the privacy policy and src/middleware.ts → buildCsp. PostHog
// (above) stays dormant for FitBreak. See docs/adr/0010-fitbreak-google-analytics-4.md.
export const googleAnalyticsMeasurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const isGoogleAnalyticsConfigured = Boolean(googleAnalyticsMeasurementId);

/**
 * Toggle: is the FitBreak Member Area switched on? OFF while FitBreak runs as an
 * Information Site (see CONTEXT.md). When false, every account surface is
 * parked: /login, /member/*, /how-it-works, and the template's /auth/* and
 * /dashboard/* redirect to the homepage (src/middleware.ts), and the public
 * pages show Messenger "Booking Enquiry" calls to action instead of sign-in,
 * credits or online booking. Flip to true to bring the Member Area back.
 */
export const memberAreaEnabled = false;

/**
 * Toggle: is the FitBreak newsletter sign-up switched on? OFF until the studio
 * chooses where sign-ups go (fact sheet question 1.5) — until then the form
 * would confirm a sign-up that is never kept. When false, the newsletter
 * section renders nothing and the subscribe action refuses every submission.
 * Turn on once `src/services/newsletter.ts` stores sign-ups somewhere real.
 */
export const newsletterEnabled = false;

/**
 * Toggle: does the homepage show the FitBreak definition sentence and FAQ? OFF
 * until the studio approves the new wording on the fact sheet (see
 * docs/research/fitbreak/seo-drafts.md). The wording lives in one module
 * (src/components/sites/fitbreak/home-faq-content.ts); when true, the homepage
 * renders it with matching FAQPage structured data and /llms.txt includes the
 * definition sentence.
 */
export const homepageFaqEnabled = false;

/**
 * Policy: may the browsable "auth disabled" bypass apply? Only when Supabase is
 * unconfigured AND we are not in production. In production an unconfigured
 * Supabase fails CLOSED (protected routes redirect to sign-in), so a build that
 * ships without env vars can never silently open the app to anonymous users.
 * Pure and exported for testing — see config.test.ts.
 */
export function computeAuthDisabled(configured: boolean, nodeEnv: string | undefined): boolean {
  return !configured && nodeEnv !== "production";
}

// When Supabase env vars are absent in DEVELOPMENT only, auth is disabled and the
// whole app is browsable without a backend (useful for local UI work). Consumed
// by middleware.ts, the dashboard layout, requireRole, and RoleGuard.
export const authDisabled = computeAuthDisabled(isSupabaseConfigured, env.NODE_ENV);

// Loud fail-closed warning: a production build missing Supabase env vars still
// enforces auth, but no one can sign in until the vars are set.
if (env.NODE_ENV === "production" && !isSupabaseConfigured) {
  console.error(
    "[config] Supabase env vars missing in production — auth is enforced (fail-closed): " +
      "protected routes redirect to sign-in and no one can sign in until " +
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

// Loud warning: canonical links, the sitemap, structured data and share images
// all derive from the site URL. A production build still pointing at localhost
// would publish them with the wrong address (FitBreak lives at https://fitbreak.ph).
if (env.NODE_ENV === "production" && /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(config.site.url)) {
  console.error(
    `[config] NEXT_PUBLIC_SITE_URL is ${config.site.url} in production — set it to ` +
      "https://fitbreak.ph so canonical links, the sitemap and structured data are correct.",
  );
}
