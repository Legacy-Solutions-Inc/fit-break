"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, SplitText, useGSAP } from "./gsap";
import { MOTION_QUERIES, type MotionConditions } from "./policy";

/**
 * Homepage storyboard (GSAP). Each scene wraps a server-rendered section and
 * drives the elements inside it by `data-*` hooks, per motion mode:
 *
 *   hero     — headline word by word, photo settles from a slight zoom, the rest
 *              follows in sequence; desktop adds a gentle photo parallax.
 *   video    — desktop pins the section while the intro video grows from a card
 *              to fill the screen and the heading falls back; phones play once.
 *   about    — photos drift at different speeds (desktop), text line by line.
 *   programs — each row's rule draws across and its name slides in, once
 *              (no pin since the editorial redesign, ADR 0009).
 *   pricing  — the pack columns rise in, staggered.
 *
 * In `calm` mode (reduced motion) the scenes do nothing — content is shown as
 * rendered. Everything a scene changes is reverted when the mode changes or
 * the component unmounts (gsap.matchMedia + useGSAP).
 */
type SceneKind = "hero" | "video" | "about" | "programs" | "pricing";
type Setup = (root: HTMLElement, mode: MotionConditions) => void | (() => void);

const EASE = "power3.out";

function select<T extends HTMLElement = HTMLElement>(root: HTMLElement, hook: string): T[] {
  return Array.from(root.querySelectorAll<T>(`[data-${hook}]`));
}

const setupHero: Setup = (root, { calm, full }) => {
  if (calm) {
    root.classList.remove("fb-pre");
    return;
  }
  const [title] = select(root, "hero-title");
  const photo = select(root, "hero-photo");
  const split = title ? SplitText.create(title, { type: "words", mask: "words" }) : null;

  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from(photo, { scale: 1.12, duration: 2.4, ease: "power2.out" }, 0);
  if (split) tl.from(split.words, { yPercent: 115, duration: 0.9, stagger: 0.07 }, 0.1);
  tl.from(select(root, "hero-in"), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.45);
  // Everything now has its "before" state — let the server-side pre-hide go.
  root.classList.remove("fb-pre");

  if (full) {
    gsap.to(photo, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
    });
  }
  return () => split?.revert();
};

const setupVideo: Setup = (root, { full, compact }) => {
  const [stage] = select(root, "video-stage");
  const [heading] = select(root, "video-heading");
  const [frame] = select(root, "video-frame");
  if (!stage || !heading || !frame) return;

  if (full) {
    stage.dataset.stage = "on";
    // Start: a card that fits below the heading. End: covers the whole stage.
    const metrics = () => {
      const sh = stage.clientHeight;
      const sw = stage.clientWidth;
      const w = frame.offsetWidth;
      const h = frame.offsetHeight;
      const top = heading.offsetTop + heading.offsetHeight + 28;
      const s0 = Math.max(0.35, Math.min(0.62, (sh - top - 32) / h));
      return { s0, y0: top + (h * s0) / 2 - sh / 2, cover: Math.max(sw / w, sh / h) * 1.002 };
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=140%",
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      frame,
      { scale: () => metrics().s0, y: () => metrics().y0 },
      { scale: () => metrics().cover, y: 0, ease: "power2.inOut", duration: 1 },
      0,
    );
    tl.to(heading, { autoAlpha: 0, y: -70, scale: 0.94, ease: "power1.in", duration: 0.5 }, 0);
    tl.to({}, { duration: 0.25 }); // hold the full-screen frame for a beat
    return () => {
      delete stage.dataset.stage;
    };
  }

  if (compact) {
    gsap.from(heading.children, {
      y: 30,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: EASE,
      scrollTrigger: { trigger: heading, start: "top 85%", once: true },
    });
    gsap.from(frame, {
      scale: 0.9,
      y: 40,
      autoAlpha: 0.3,
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: frame, start: "top 85%", once: true },
    });
  }
};

const setupAbout: Setup = (root, { calm, full }) => {
  if (calm) return;
  const photos = select(root, "about-photo");
  if (full) {
    photos.forEach((photo, i) => {
      gsap.fromTo(
        photo,
        { y: i ? 90 : 40 },
        {
          y: i ? -50 : -30,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  } else {
    gsap.from(photos, {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: EASE,
      scrollTrigger: { trigger: photos[0], start: "top 85%", once: true },
    });
  }

  gsap.from(select(root, "about-in"), {
    y: 24,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: EASE,
    scrollTrigger: { trigger: root, start: "top 75%", once: true },
  });

  const [copy] = select(root, "about-lines");
  const split = copy
    ? SplitText.create(copy, {
        type: "lines",
        // Whole lines stay readable as-is; aria-label is not allowed on <p>.
        aria: "none",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100,
            duration: 0.8,
            stagger: 0.08,
            ease: EASE,
            scrollTrigger: { trigger: copy, start: "top 80%", once: true },
          }),
      })
    : null;

  const [stats] = select(root, "about-stats");
  gsap.from(select(root, "about-stat"), {
    y: 40,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: EASE,
    clearProps: "transform,opacity,visibility",
    scrollTrigger: { trigger: stats, start: "top 85%", once: true },
  });
  return () => split?.revert();
};

// Opacity, not autoAlpha: rows are links, and visibility:hidden would drop
// them from the accessibility tree until they animate in.
const setupPrograms: Setup = (root, { calm }) => {
  if (calm) return;
  for (const card of select(root, "program-card")) {
    const row = card.parentElement;
    const rule = row?.querySelector<HTMLElement>("[data-program-rule]");
    const name = card.querySelector<HTMLElement>("[data-program-name]");
    const rest = Array.from(card.children).filter((el) => el !== name);
    const tl = gsap.timeline({
      defaults: { ease: EASE },
      scrollTrigger: { trigger: card, start: "top 88%", once: true },
    });
    if (rule) tl.from(rule, { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, 0);
    if (name) tl.from(name, { xPercent: -6, opacity: 0, duration: 0.8, clearProps: "all" }, 0.15);
    tl.from(rest, { y: 12, opacity: 0, duration: 0.6, stagger: 0.06, clearProps: "all" }, 0.3);
  }
};

const setupPricing: Setup = (root, { calm }) => {
  if (calm) return;
  gsap.from(select(root, "price-card"), {
    y: 48,
    opacity: 0, // not autoAlpha: links stay in the accessibility tree
    duration: 0.9,
    stagger: 0.12,
    ease: EASE,
    clearProps: "transform,opacity",
    scrollTrigger: { trigger: root, start: "top 82%", once: true },
  });
};

const setups: Record<SceneKind, Setup> = {
  hero: setupHero,
  video: setupVideo,
  about: setupAbout,
  programs: setupPrograms,
  pricing: setupPricing,
};

export function Scene({
  kind,
  className,
  children,
}: {
  kind: SceneKind;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES, (ctx) => setups[kind](root, ctx.conditions as MotionConditions));
      // Text reflows once the webfont arrives; re-measure pins and triggers.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-scene={kind} className={className}>
      {children}
    </div>
  );
}
