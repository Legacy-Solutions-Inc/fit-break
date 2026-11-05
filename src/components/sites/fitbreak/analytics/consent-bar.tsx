"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import {
  applyConsentChoice,
  readConsentChoice,
  subscribeConsent,
} from "@/lib/analytics/ga-consent";

import { routes } from "../links";
import { CONSENT_REOPEN_EVENT } from "./consent-events";

/** Unknown on the server: the bar only ever renders after hydration. */
const serverSnapshot = () => null;

/**
 * GA4 consent bar (ADR 0010), editorial style. Shown only when GA is
 * configured and this device has no stored choice. Accept and Decline carry
 * equal weight. Bottom-left on wider screens; on phones it spans the width
 * just above the assistant button, so it never covers it.
 */
export function ConsentBar() {
  const choice = useSyncExternalStore(subscribeConsent, readConsentChoice, serverSnapshot);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const focusOnShow = useRef(false);

  useEffect(() => {
    // Already showing ⇒ focus now; otherwise focus once it re-renders.
    const onReopen = () => {
      if (acceptRef.current) acceptRef.current.focus();
      else focusOnShow.current = true;
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, onReopen);
  }, []);

  useEffect(() => {
    if (choice === "none" && focusOnShow.current) {
      focusOnShow.current = false;
      acceptRef.current?.focus();
    }
  }, [choice]);

  if (choice !== "none") return null;

  const button = "fb-btn fb-btn--line min-h-11 w-full px-4 text-sm";

  return (
    <section
      aria-label="Cookie choice"
      className="fixed inset-x-3 bottom-[9rem] z-[9990] border border-ink/20 bg-paper p-5 text-ink shadow-[0_18px_50px_-12px_rgba(23,19,15,0.35)] motion-safe:animate-[fb-fade-in_0.3s_ease_backwards] sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md"
    >
      <p className="fb-label text-mute">Cookies</p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed">
        We use Google Analytics to see which pages help people find the studio.{" "}
        <a
          href={routes.privacy}
          className="font-semibold underline underline-offset-2 hover:text-crimson-deep"
        >
          Privacy policy
        </a>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          ref={acceptRef}
          type="button"
          className={button}
          onClick={() => applyConsentChoice("accept")}
        >
          Accept
        </button>
        <button type="button" className={button} onClick={() => applyConsentChoice("decline")}>
          Decline
        </button>
      </div>
    </section>
  );
}
