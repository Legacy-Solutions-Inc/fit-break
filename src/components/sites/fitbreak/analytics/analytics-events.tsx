"use client";

import { useEffect } from "react";

import { linkEvent } from "@/lib/analytics/ga-events";

/**
 * One delegated click listener for GA4 events (ADR 0010):
 * - `booking_enquiry` (key event) for Messenger, phone and studio email links,
 *   with `method`, `placement` (nearest `[data-placement]`, else "other") and
 *   `pack` (nearest `[data-pack]`, pricing packs);
 * - `flyer_download` for the corporate flyer PDF;
 * - `assistant_open` when the assistant button opens the chat.
 * Capture phase, so it runs before navigation and before React toggles state.
 * Mounted only when GA is configured.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const opener = target.closest('[data-analytics="assistant-open"]');
      if (opener) {
        if (opener.getAttribute("aria-expanded") !== "true") {
          window.gtag?.("event", "assistant_open");
        }
        return;
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const mapped = linkEvent({
        href: link.href,
        placement: link.closest("[data-placement]")?.getAttribute("data-placement"),
        pack: link.closest("[data-pack]")?.getAttribute("data-pack"),
      });
      if (!mapped) return;
      const { event, ...params } = mapped;
      window.gtag?.("event", event, params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
