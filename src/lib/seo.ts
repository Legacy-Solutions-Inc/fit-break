import type { MetadataRoute } from "next";

/**
 * Public, indexable FitBreak Information Site routes. Account areas (the parked
 * Member Area, /login, the template's /auth and /dashboard) are excluded and
 * disallowed in robots. Blog posts are appended by app/sitemap.ts.
 */
export const SITEMAP_ROUTES = [
  "/",
  "/pricing",
  "/schedule",
  "/our-story",
  "/calapan1/about",
  "/fitbreakers",
  "/club-rules",
  "/corporate",
  "/blog",
  "/privacy-policy",
  "/terms-of-service",
] as const;

/** Private or parked areas crawlers must skip. */
export const DISALLOWED_PREFIXES = ["/dashboard/", "/member/", "/login", "/auth/", "/how-it-works"];

/**
 * Pure: build sitemap entries as absolute URLs against `baseUrl`. `lastModified`
 * is passed in (not read from the clock) so the builder stays deterministic and
 * testable. `new URL(route, baseUrl)` joins cleanly regardless of trailing slash.
 */
export function buildSitemap(
  baseUrl: string,
  lastModified: Date,
  extraRoutes: readonly string[] = [],
): MetadataRoute.Sitemap {
  return [...SITEMAP_ROUTES, ...extraRoutes].map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.5,
  }));
}

/** Pure: allow crawling everything except private/parked areas; link the sitemap. */
export function buildRobots(baseUrl: string): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PREFIXES,
    },
    sitemap: new URL("sitemap.xml", baseUrl).toString(),
    host: new URL(baseUrl).origin,
  };
}
