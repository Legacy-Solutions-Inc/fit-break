import { headers } from "next/headers";

import { buildGaBootstrap } from "@/lib/analytics/ga";

/**
 * GA4 bootstrap (ADR 0010). One inline script carrying the per-request CSP
 * nonce: Consent Mode defaults (all denied) → a stored Accept, if any → config
 * → then it injects gtag.js with the same nonce, so 'strict-dynamic' trusts it.
 * Rendered only when a measurement ID is configured.
 */
export async function GoogleAnalyticsScript({ measurementId }: { measurementId: string }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      id="fb-ga-bootstrap"
      nonce={nonce}
      // Browsers hide the nonce attribute after parsing; don't flag that as a mismatch.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: buildGaBootstrap(measurementId) }}
    />
  );
}
