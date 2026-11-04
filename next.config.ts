import type { NextConfig } from "next";

import { legacyRedirects } from "./src/components/sites/fitbreak/links";

// Static security response headers applied to every route. CSP is intentionally
// NOT here — it needs a per-request nonce and is set in src/middleware.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Deny-by-default for unused powerful features.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()",
  },
  // Cross-origin isolation hardening. COOP severs opener ties to cross-origin
  // popups; CORP limits who may embed our resources. COEP/require-corp is
  // intentionally NOT set — it would break legitimate cross-origin resources.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // HSTS only in production (never send it over plain http in local dev).
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Opt-in separate build dir (e.g. NEXT_DIST_DIR=.next-preview) so a second
  // dev/preview server never clobbers the main `.next` of a running `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Payment proof uploads (member/payments) are validated to ≤5 MB in the action;
  // allow that through the Server Action body limit (default 1 MB).
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // Don't advertise the framework via the X-Powered-By header.
  poweredByHeader: false,
  // PostHog same-origin reverse proxy. `/relay` is ONE base path that MUST stay
  // identical in THREE places: (1) these rewrites, (2) the client `api_host` in
  // src/instrumentation-client.ts, (3) the middleware matcher exclusion in
  // src/middleware.ts. US hosts shown — swap `us-`→`eu-` and `us.i`→`eu.i` for
  // EU. Order matters: specific routes before the catch-all.
  async rewrites() {
    return [
      {
        source: "/relay/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      { source: "/relay/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // The live site's homepage path; keep old links and bookmarks working.
  // Old fitbreak.ph URLs (`/schedule.html`, `/blog-post.html?id=…`, …) map onto
  // the cloned routes so existing links and bookmarks keep working.
  async redirects() {
    return [
      ...legacyRedirects.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      {
        source: "/blog-post.html",
        has: [{ type: "query" as const, key: "id", value: "(?<id>.+)" }],
        destination: "/blog/:id",
        permanent: true,
      },
      { source: "/blog-post.html", destination: "/blog", permanent: true },
    ];
  },
  // PostHog's ingestion API relies on trailing slashes (/e/, /s/) — don't redirect.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
