"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, inView } from "motion";

import { cn } from "@/lib/utils";

import { getMotionMode } from "./policy";

/**
 * The light motion layer: wraps page content and eases its blocks in (fade +
 * small lift, staggered when several arrive together) as they scroll into view.
 *
 * Targets are found automatically — headings, images, video/iframes and card
 * blocks (rounded-xl/2xl/3xl) — taking only the outermost match, so a card's
 * contents move with the card. Homepage scenes (`[data-scene]`, driven by GSAP)
 * and anything inside `[data-no-reveal]` are left alone.
 *
 * Content is never hidden by server CSS: only blocks that are still below the
 * fold when this runs are hidden, by client code, right before they animate.
 * Blocks already on screen (and every block after a back/forward navigation)
 * are left exactly as rendered.
 */
const TARGETS =
  "h1, h2, h3, img, video, iframe, [class*='rounded-xl'], [class*='rounded-2xl'], [class*='rounded-3xl'], [data-reveal]";
const SKIP =
  "[data-scene], [data-no-reveal], .fb-card-in, form, button, input, select, textarea, label, nav";
const EASE = [0.22, 1, 0.36, 1] as const;

let firstMount = true;

function collect(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(TARGETS));
  return all.filter((el) => {
    if (el.closest(SKIP)) return false;
    if (!el.getClientRects().length) return false; // display: none
    // Outermost match only.
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      if (p.matches(TARGETS) && !p.closest(SKIP)) return false;
    }
    return true;
  });
}

export function RevealScope({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const restored =
      firstMount &&
      (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
        ?.type === "back_forward";
    firstMount = false;
    if (restored) return;

    const calm = getMotionMode() === "calm";
    const fold = window.innerHeight;
    const pending = collect(root).filter((el) => el.getBoundingClientRect().top > fold);

    const keyframes = calm ? { opacity: [0, 1] } : { opacity: [0, 1], y: [24, 0] };
    for (const el of pending) {
      el.style.opacity = "0";
      if (!calm) el.style.transform = "translateY(24px)";
    }

    let batch: HTMLElement[] = [];
    let frame = 0;
    const flush = () => {
      batch.forEach((el, i) => {
        void animate(el, keyframes, {
          duration: calm ? 0.3 : 0.6,
          delay: calm ? 0 : i * 0.08,
          ease: EASE,
        }).then(() => {
          el.style.removeProperty("transform");
          el.style.removeProperty("opacity");
        });
      });
      batch = [];
    };

    const stops = pending.map((el) =>
      inView(
        el,
        () => {
          batch.push(el);
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(flush);
          // Returning nothing: reveal once, then stop observing this element.
        },
        { margin: "0px 0px -8% 0px" },
      ),
    );

    return () => {
      cancelAnimationFrame(frame);
      stops.forEach((stop) => stop());
      for (const el of pending) {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      }
    };
  }, []);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
