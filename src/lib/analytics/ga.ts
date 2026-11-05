import { CONSENT_STORAGE_KEY, consentSignals } from "./ga-consent";

// Google Analytics 4 loader for FitBreak (ADR 0010): plain gtag.js, no Tag
// Manager, no npm dependency. The bootstrap runs as ONE nonce'd inline script
// so its order is fixed: Consent Mode defaults (all denied) → a stored Accept,
// if any → config → only then inject gtag.js, carrying the same nonce.

/** Where gtag.js is served from (also allowed in the CSP, see src/lib/csp.ts). */
export const GA_SCRIPT_ORIGIN = "https://www.googletagmanager.com";

/** How long gtag waits for a consent update before sending its first hit. */
export const CONSENT_WAIT_MS = 500;

const MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The inline bootstrap script for `measurementId`. Throws on a malformed ID
 * (it is embedded in script source; env validation already enforces this).
 */
export function buildGaBootstrap(measurementId: string): string {
  if (!MEASUREMENT_ID.test(measurementId)) {
    throw new Error(`Invalid GA4 measurement ID: ${JSON.stringify(measurementId)}`);
  }
  const id = JSON.stringify(measurementId);
  const defaults = JSON.stringify({ ...consentSignals("none"), wait_for_update: CONSENT_WAIT_MS });
  const accepted = JSON.stringify(consentSignals("accept"));
  const src = JSON.stringify(`${GA_SCRIPT_ORIGIN}/gtag/js?id=${measurementId}`);

  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){window.dataLayer.push(arguments);}",
    "window.gtag=gtag;",
    `gtag("consent","default",${defaults});`,
    `try{if(window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})==="accept"){gtag("consent","update",${accepted});}}catch(e){}`,
    'gtag("js",new Date());',
    `gtag("config",${id});`,
    "(function(){var s=document.createElement('script');",
    "var c=document.currentScript;if(c&&c.nonce){s.nonce=c.nonce;}",
    `s.async=true;s.src=${src};document.head.appendChild(s);})();`,
  ].join("");
}
