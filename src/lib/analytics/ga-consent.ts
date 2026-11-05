// Google Analytics 4 Consent Mode for FitBreak (ADR 0010). Pure mapping from the
// visitor's stored choice to Consent Mode signals, plus device storage that
// never throws (private mode / blocked storage reads as "no choice yet").

/** The visitor's cookie choice. `none` = not chosen yet (or withdrawn). */
export type ConsentChoice = "none" | "accept" | "decline";

type Signal = "granted" | "denied";

/** The Consent Mode v2 signals this site sets. */
export interface ConsentSignals {
  analytics_storage: Signal;
  ad_storage: Signal;
  ad_user_data: Signal;
  ad_personalization: Signal;
}

/** localStorage key holding the choice. Read by the inline GA bootstrap too. */
export const CONSENT_STORAGE_KEY = "fitbreak_analytics_consent";

/**
 * Choice → Consent Mode signals. Only Accept grants anything, and only
 * analytics storage: FitBreak runs no advertising, so every ad signal stays
 * denied whatever the visitor picks.
 */
export function consentSignals(choice: ConsentChoice): ConsentSignals {
  return {
    analytics_storage: choice === "accept" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

/** A raw stored value → choice. Anything unexpected counts as no choice. */
export function parseConsentChoice(raw: string | null | undefined): ConsentChoice {
  return raw === "accept" || raw === "decline" ? raw : "none";
}

/** The choice stored on this device (`none` if absent or storage is unavailable). */
export function readConsentChoice(): ConsentChoice {
  try {
    return parseConsentChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return "none";
  }
}

/** Store a choice on this device; `none` clears it. Silently skips if storage is blocked. */
export function writeConsentChoice(choice: ConsentChoice): void {
  try {
    if (choice === "none") window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    else window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
}

// ── Live choice (browser only) ────────────────────────────────────────────────
// A tiny external store so the consent bar and the privacy policy's "Change
// cookie choice" control stay in sync (useSyncExternalStore), including across
// tabs via the `storage` event.

const listeners = new Set<() => void>();

/** Subscribe to choice changes. Returns the unsubscribe function. */
export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CONSENT_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Delete GA's first-party cookies (`_ga`, `_ga_<stream>`) on every parent domain. */
function clearGaCookies(): void {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0]?.trim() ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  if (!names.length) return;
  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

/**
 * Record the visitor's choice: store it on the device, update Consent Mode,
 * and tell the UI. `decline` and `none` (withdrawn, bar reopens) also remove
 * any analytics cookies set by an earlier Accept.
 */
export function applyConsentChoice(choice: ConsentChoice): void {
  writeConsentChoice(choice);
  window.gtag?.("consent", "update", consentSignals(choice));
  if (choice !== "accept") clearGaCookies();
  for (const listener of listeners) listener();
}
