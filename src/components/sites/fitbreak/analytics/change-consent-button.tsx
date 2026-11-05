"use client";

import { applyConsentChoice } from "@/lib/analytics/ga-consent";

import { CONSENT_REOPEN_EVENT } from "./consent-events";

/**
 * Privacy policy control: withdraws the stored choice (back to denied, GA
 * cookies removed) and reopens the consent bar with focus on it.
 */
export function ChangeConsentButton() {
  return (
    <button
      type="button"
      className="fb-btn fb-btn--line mb-6 min-h-11 px-5 text-sm"
      onClick={() => {
        applyConsentChoice("none");
        window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
      }}
    >
      Change cookie choice
    </button>
  );
}
