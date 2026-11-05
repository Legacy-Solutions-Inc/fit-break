"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { routes } from "../links";

// Clone of the source's onboarding-tour.js (v2.0): floating "?" help button
// above the chat bubble, its help menu, the step-by-step spotlight tour, the
// first-visit welcome modal (dashboard) and the contextual hover tooltips.
// "Seen" state is persisted exactly like the source, in localStorage.

const TOUR_STORAGE_KEY = "fitbreak_tour_completed";
const TOUR_VERSION = "2.0"; // Increment to show the tour again after updates

export type TourPage =
  "schedule" | "dashboard" | "bookings" | "payments" | "profile" | "settings" | "pricing";
type Position = "top" | "bottom" | "left" | "right";

interface TourStep {
  /** Comma-separated selectors, tried in order (as the source). */
  target: string;
  title: string;
  content: string;
  position: Position;
}

// Per-page steps from the source; its `/x.html` hrefs are mapped to local routes.
// Pages without an entry in the source (settings) get no "Tour This Page".
const tourSteps: Record<TourPage, TourStep[]> = {
  pricing: [
    {
      target: '.package-card:first-child, [data-tour="package"]',
      title: "Choose a Package",
      content:
        "Compare packages based on your fitness goals. Bigger packs offer better value per class!",
      position: "bottom",
    },
    {
      target: '[data-tour="best-value"], .bg-brand-500',
      title: "Best Value",
      content: "This package offers the best savings per class. Recommended for regular gym-goers!",
      position: "top",
    },
    {
      target: '.cta-button, [data-tour="buy-now"]',
      title: "Get Started",
      content: "Click to proceed with payment. You can pay via GCash or BPI bank transfer.",
      position: "top",
    },
  ],
  dashboard: [
    {
      target: '#credits-card, .credits-card, [data-tour="credits"]',
      title: "Your Credits",
      content:
        "This shows how many class credits you have. 1 credit = 1 class session. Credits expire within 30-45 days based on your package.",
      position: "bottom",
    },
    {
      target: '#upcoming-classes, .upcoming-bookings, [data-tour="upcoming"]',
      title: "Upcoming Classes",
      content:
        "Your booked classes appear here. You'll see the class name, time, and a QR code for check-in.",
      position: "bottom",
    },
    {
      target: '#credit-expiry-alert, [data-tour="expiry"]',
      title: "Credit Alerts",
      content: "We'll notify you when your credits are running low or about to expire.",
      position: "bottom",
    },
    {
      target: `[href="${routes.schedule}"], [data-tour="schedule-link"]`,
      title: "Book Classes",
      content: "Click here to browse the weekly schedule and book available classes.",
      position: "right",
    },
    {
      target: `[href="${routes.member.payments}"], [data-tour="payments-link"]`,
      title: "Buy Credits",
      content: "Need more credits? Purchase class packages here via GCash or BPI.",
      position: "right",
    },
  ],
  schedule: [
    {
      target: '#week-range, [data-tour="week-nav"]',
      title: "Weekly Schedule",
      content: "This shows the current week's schedule. All classes run Monday to Saturday.",
      position: "bottom",
    },
    {
      target: '#credits-banner, [data-tour="credits-display"]',
      title: "Your Credits",
      content: "Your available credits are shown here. Each class costs 1 credit.",
      position: "bottom",
    },
    {
      target: '#schedule-container .bg-white, [data-tour="class-card"]',
      title: "Class Sessions",
      content:
        "Click on any available time slot to book. Green means available, gray means full or already booked.",
      position: "bottom",
    },
  ],
  payments: [
    {
      target: '[data-tour="payment-status"], .payment-status-card',
      title: "Payment Status",
      content:
        "Track the status of your payments here. Pending payments are usually verified within 24 hours.",
      position: "bottom",
    },
    {
      target: '[data-tour="credit-history"], #credit-usage-section',
      title: "Credit History",
      content:
        "See how you've used your credits over time - purchases, classes attended, and more.",
      position: "bottom",
    },
    {
      target: `[data-tour="buy-credits"], [href="${routes.pricing}"]`,
      title: "Need More Credits?",
      content: "Click here to purchase additional class packages.",
      position: "right",
    },
  ],
  profile: [
    {
      target: '[data-tour="profile-info"], .profile-card',
      title: "Your Profile",
      content: "Manage your account details here. Keep your info updated for class notifications!",
      position: "bottom",
    },
    {
      target: '[data-tour="referral"], #referral-section',
      title: "Refer Friends",
      content:
        "Share your referral code with friends. When they sign up and book, you both get bonus credits!",
      position: "bottom",
    },
    {
      target: `[data-tour="settings"], [href="${routes.member.settings}"]`,
      title: "Settings",
      content: "Customize your notification preferences and account settings.",
      position: "right",
    },
  ],
  bookings: [
    {
      target: '#weekly-schedule, [data-tour="weekly-schedule"]',
      title: "Weekly Classes",
      content: "Browse all available classes for the week. Click on any class to book your spot.",
      position: "bottom",
    },
    {
      target: '#my-bookings-list, [data-tour="my-bookings"]',
      title: "Your Bookings",
      content:
        "All your upcoming and past bookings appear here. You can cancel bookings up to 2 hours before class.",
      position: "top",
    },
  ],
  settings: [],
};

interface HoverTip {
  title: string;
  content: string;
  position: Position;
}

/** Hover tooltips for `[data-tooltip="<id>"]` elements (source `hoverTooltips`). */
const hoverTooltips: Record<string, HoverTip> = {
  "credits-count": {
    title: "Available Credits",
    content: "1 credit = 1 class. Credits expire within 30-45 days based on your package.",
    position: "bottom",
  },
  "book-class-btn": {
    title: "Book a Class",
    content: "Browse the schedule and reserve your spot in upcoming classes.",
    position: "bottom",
  },
  "buy-credits-btn": {
    title: "Buy Credits",
    content: "Purchase class packages. Bigger packs = better savings!",
    position: "bottom",
  },
  "class-slot-available": {
    title: "Available",
    content: "Click to book this class. Uses 1 credit.",
    position: "top",
  },
  "class-slot-full": {
    title: "Class Full",
    content: "This session is at capacity. Try another time slot.",
    position: "top",
  },
  "class-slot-booked": {
    title: "Already Booked",
    content: "You've already booked this class. See you there!",
    position: "top",
  },
  "payment-pending": {
    title: "Pending Verification",
    content: "We're reviewing your payment. Usually takes less than 24 hours.",
    position: "right",
  },
  "payment-approved": {
    title: "Payment Approved",
    content: "Credits have been added to your account!",
    position: "right",
  },
};

const creditsTip: HoverTip = {
  title: "Your Credits",
  content: "1 credit = 1 class. Credits expire within 30-45 days based on your package.",
  position: "bottom",
};

function shouldShowTour(): boolean {
  try {
    const raw = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return true;
    return (JSON.parse(raw) as { version?: string }).version !== TOUR_VERSION;
  } catch {
    return true;
  }
}

function markTourComplete() {
  try {
    localStorage.setItem(
      TOUR_STORAGE_KEY,
      JSON.stringify({ version: TOUR_VERSION, completedAt: new Date().toISOString() }),
    );
  } catch {
    // Storage unavailable (private mode): the tour simply shows again next time.
  }
}

/** First visible match, trying each selector in order. */
function findTarget(selectorList: string): HTMLElement | null {
  for (const selector of selectorList.split(",").map((s) => s.trim())) {
    let nodes: NodeListOf<HTMLElement>;
    try {
      nodes = document.querySelectorAll<HTMLElement>(selector);
    } catch {
      continue;
    }
    for (const el of nodes) if (el.getClientRects().length > 0) return el;
  }
  return null;
}

function place(
  rect: DOMRect,
  box: { width: number; height: number },
  position: Position,
  gap: number,
) {
  let top: number;
  let left: number;
  switch (position) {
    case "top":
      top = rect.top - box.height - gap;
      left = rect.left + rect.width / 2 - box.width / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - box.height / 2;
      left = rect.left - box.width - gap;
      break;
    case "right":
      top = rect.top + rect.height / 2 - box.height / 2;
      left = rect.right + gap;
      break;
    default:
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - box.width / 2;
  }
  // Keep on screen.
  top = Math.max(gap, Math.min(window.innerHeight - box.height - gap, top));
  left = Math.max(gap, Math.min(window.innerWidth - box.width - gap, left));
  return { top, left };
}

const HIGHLIGHT_PROPS = ["position", "z-index", "box-shadow", "isolation"] as const;

function clearHighlights() {
  document.querySelectorAll<HTMLElement>(".tour-highlighted").forEach((el) => {
    el.classList.remove("tour-highlighted");
    HIGHLIGHT_PROPS.forEach((p) => el.style.removeProperty(p));
  });
}

function highlight(target: HTMLElement) {
  clearHighlights();
  target.classList.add("tour-highlighted");
  if (window.getComputedStyle(target).position === "static") target.style.position = "relative";
  target.style.zIndex = "10000";
  target.style.boxShadow = "0 0 0 4px rgba(215, 30, 73, 0.4), 0 0 30px rgba(215, 30, 73, 0.3)";
  target.style.isolation = "isolate";
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

// The source injects these rules at runtime (addTourStyles).
const tourCss = `
.tour-highlighted { transition: box-shadow 0.3s ease; }
#tour-tooltip { transition: opacity 0.2s ease, transform 0.2s ease; }
@keyframes fbTooltipFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fbModalIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes fbModalOut { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }
@keyframes fbFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes fbBounceGentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes fbPulseSubtle { 0%, 100% { box-shadow: 0 4px 15px rgba(215, 30, 73, 0.3); } 50% { box-shadow: 0 4px 25px rgba(215, 30, 73, 0.5); } }
.fb-tooltip-in { animation: fbTooltipFadeIn 0.15s ease-out; }
.fb-modal-in { animation: fbModalIn 0.3s ease-out; }
.fb-modal-out { animation: fbModalOut 0.2s ease-in forwards; }
.fb-fade-in { animation: fbFadeIn 0.2s ease; }
#floating-help-btn { animation: fbPulseSubtle 2s infinite; }
#floating-help-btn.fb-bounce-gentle { animation: fbBounceGentle 1s ease-in-out 3; }
#floating-help-btn:hover { animation: none; }
#floating-help-btn:focus { outline: 2px solid #d71e49; outline-offset: 2px; }
[data-tooltip] { cursor: help; }
.fb-tip-arrow { position: absolute; width: 0; height: 0; }
.fb-tip-top .fb-tip-arrow { bottom: -6px; left: 50%; transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #1f2937; }
.fb-tip-bottom .fb-tip-arrow { top: -6px; left: 50%; transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid #1f2937; }
.fb-tip-left .fb-tip-arrow { right: -6px; top: 50%; transform: translateY(-50%); border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 6px solid #1f2937; }
.fb-tip-right .fb-tip-arrow { left: -6px; top: 50%; transform: translateY(-50%); border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 6px solid #1f2937; }
`;

function Svg({ d, className }: { d: string | string[]; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {(Array.isArray(d) ? d : [d]).map((p) => (
        <path key={p} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p} />
      ))}
    </svg>
  );
}

const QUESTION =
  "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

export function OnboardingTour({ page }: { page: TourPage }) {
  const steps = tourSteps[page];
  const [menuOpen, setMenuOpen] = useState(false);
  const [tour, setTour] = useState<{ steps: TourStep[]; index: number } | null>(null);
  const [tourClosing, setTourClosing] = useState(false);
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);
  const [welcome, setWelcome] = useState<"open" | "closing" | null>(null);
  const [bounce, setBounce] = useState(false);
  const [toast, setToast] = useState<{ text: string; fading: boolean } | null>(null);
  const [hover, setHover] = useState<{ tip: HoverTip; rect: DOMRect } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = useCallback(
    (text: string) => {
      setToast({ text, fading: false });
      later(() => setToast((t) => (t ? { ...t, fading: true } : t)), 4000);
      later(() => setToast(null), 4300);
    },
    [later],
  );

  const startTour = useCallback((target: TourPage) => {
    const list = tourSteps[target];
    if (!list.length) return;
    setMenuOpen(false);
    setTourClosing(false);
    setTour({ steps: list, index: 0 });
  }, []);

  const endTour = useCallback(() => {
    setTourClosing(true);
    clearHighlights();
    later(() => {
      setTour(null);
      setTourClosing(false);
      setTipPos(null);
    }, 200);
    markTourComplete();
    showToast("Tour complete! Click the help button anytime for assistance.");
  }, [later, showToast]);

  const startFullTour = useCallback(() => {
    setMenuOpen(false);
    if (page !== "dashboard") window.location.href = `${routes.member.dashboard}?tour=1`;
    else startTour("dashboard");
  }, [page, startTour]);

  // Init: ?tour=1 deep link, first-visit bounce and (dashboard) welcome modal.
  useEffect(() => {
    const firstTime = shouldShowTour();
    if (firstTime) {
      setBounce(true);
      later(() => setBounce(false), 5000);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1") {
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
      later(() => startTour(page), 500);
      return;
    }
    if (firstTime && page === "dashboard") later(() => setWelcome("open"), 800);
  }, [page, later, startTour]);

  // Help menu: close on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Current tour step: spotlight the target and place the tooltip beside it.
  const step = tour && !tourClosing ? tour.steps[tour.index] : undefined;
  useLayoutEffect(() => {
    if (!step) return;
    const target = findTarget(step.target);
    if (!target) {
      clearHighlights();
      setTipPos(null); // centred, as the source does when the target is missing
      return;
    }
    highlight(target);
    const reposition = () => {
      const box = tooltipRef.current?.getBoundingClientRect();
      if (!box) return;
      setTipPos(place(target.getBoundingClientRect(), box, step.position, 16));
    };
    const raf = requestAnimationFrame(reposition);
    // The smooth scroll moves the target; follow it.
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
    };
  }, [step]);

  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tour, endTour]);

  useEffect(() => () => clearHighlights(), []);

  // Contextual hover tooltips ([data-tooltip], #credits-count), re-bound as content changes.
  useEffect(() => {
    const bind = () => {
      const bindOne = (el: HTMLElement, tip: HoverTip) => {
        if (el.dataset.tooltipInit) return;
        el.dataset.tooltipInit = "true";
        const show = () => setHover({ tip, rect: el.getBoundingClientRect() });
        const hide = () => setHover(null);
        el.addEventListener("mouseenter", show);
        el.addEventListener("mouseleave", hide);
        el.addEventListener("focus", show);
        el.addEventListener("blur", hide);
      };
      document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach((el) => {
        const tip = hoverTooltips[el.dataset.tooltip ?? ""];
        if (tip) bindOne(el, tip);
      });
      document.querySelectorAll<HTMLElement>("#credits-count, .credits-count").forEach((el) => {
        el.style.cursor = "help";
        bindOne(el, creditsTip);
      });
    };
    bind();
    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!hover) {
      setHoverPos(null);
      return;
    }
    const box = hoverRef.current?.getBoundingClientRect();
    if (box) setHoverPos(place(hover.rect, box, hover.tip.position, 8));
  }, [hover]);

  function closeWelcome(takeTour: boolean) {
    setWelcome("closing");
    later(() => {
      setWelcome(null);
      if (takeTour) startTour("dashboard");
      else markTourComplete();
    }, 200);
  }

  const isLast = tour ? tour.index >= tour.steps.length - 1 : false;

  return (
    <>
      <style>{tourCss}</style>

      <button
        ref={buttonRef}
        id="floating-help-btn"
        type="button"
        aria-label="Help and support"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        className={cn(
          "group fixed right-6 bottom-40 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-brand-600 lg:bottom-20",
          bounce && "fb-bounce-gentle",
        )}
      >
        <Svg d={QUESTION} className="h-6 w-6" />
        <span className="pointer-events-none absolute right-14 rounded-lg bg-gray-900 px-3 py-1.5 text-sm whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
          Need Help?
        </span>
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          id="help-menu"
          className="fb-fade-in fixed right-6 bottom-56 z-50 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-2xl lg:bottom-36"
        >
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="font-semibold text-gray-900">Need Help?</p>
            <p className="text-xs text-gray-500">Learn how to use FitBreak</p>
          </div>
          {steps.length > 0 && (
            <button
              type="button"
              onClick={() => startTour(page)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <span className="text-xl" aria-hidden="true">
                🎯
              </span>
              <div>
                <p className="font-medium text-gray-900">Tour This Page</p>
                <p className="text-xs text-gray-500">Learn about {page} features</p>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={startFullTour}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <span className="text-xl" aria-hidden="true">
              🚀
            </span>
            <div>
              <p className="font-medium text-gray-900">Full App Tour</p>
              <p className="text-xs text-gray-500">Complete walkthrough from dashboard</p>
            </div>
          </button>
          <a
            href={`${routes.member.profile}#help-guide`}
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <span className="text-xl" aria-hidden="true">
              📖
            </span>
            <div>
              <p className="font-medium text-gray-900">User Guide</p>
              <p className="text-xs text-gray-500">Step-by-step instructions</p>
            </div>
          </a>
          <div className="mt-1 border-t border-gray-100 pt-1">
            <a
              href="mailto:support@fitbreak.ph"
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <span className="text-xl" aria-hidden="true">
                💬
              </span>
              <div>
                <p className="font-medium text-gray-900">Contact Support</p>
                <p className="text-xs text-gray-500">Email us your questions</p>
              </div>
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="w-full border-t border-gray-100 px-4 py-2 text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}

      {tour && (
        <>
          <div
            id="tour-overlay"
            className="pointer-events-none fixed inset-0 z-[10001] transition-opacity"
            style={{ opacity: tourClosing ? 0 : 1 }}
          >
            <div className="absolute inset-0 bg-black/50 transition-opacity" />
          </div>
          {step && (
            <div
              ref={tooltipRef}
              id="tour-tooltip"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-step-title"
              className="pointer-events-auto fixed z-[10002] max-w-sm rounded-xl bg-white shadow-2xl"
              style={
                tipPos
                  ? { top: tipPos.top, left: tipPos.left }
                  : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
              }
            >
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 id="tour-step-title" className="font-bold text-gray-900">
                    {step.title}
                  </h4>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                    {tour.index + 1}/{tour.steps.length}
                  </span>
                </div>
                <p className="mb-4 text-sm text-gray-600">{step.content}</p>
                <div className="mb-4 flex justify-center gap-1.5" aria-hidden="true">
                  {tour.steps.map((s, i) => (
                    <div
                      key={s.title}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        i === tour.index
                          ? "bg-brand-500"
                          : i < tour.index
                            ? "bg-brand-300"
                            : "bg-gray-200",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={endTour}
                    className="text-sm text-gray-500 transition hover:text-gray-700"
                  >
                    Skip
                  </button>
                  <div className="flex gap-2">
                    {tour.index > 0 && (
                      <button
                        type="button"
                        onClick={() => setTour({ ...tour, index: tour.index - 1 })}
                        className="rounded-lg px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      autoFocus
                      onClick={() =>
                        isLast ? endTour() : setTour({ ...tour, index: tour.index + 1 })
                      }
                      className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                      {isLast ? "Finish" : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {welcome && (
        <div
          id="welcome-modal"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => closeWelcome(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl",
              welcome === "closing" ? "fb-modal-out" : "fb-modal-in",
            )}
          >
            <div className="bg-linear-to-r from-brand-500 to-brand-600 px-6 py-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Svg
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  className="h-10 w-10 text-white"
                />
              </div>
              <h2 id="welcome-title" className="mb-2 text-2xl font-bold">
                Welcome to FitBreak!
              </h2>
              <p className="text-white/90">Your fitness journey starts here</p>
            </div>
            <div className="p-6">
              <p className="mb-6 text-center text-gray-600">
                We&apos;re excited to have you! Let us show you around so you can make the most of
                your FitBreak experience.
              </p>
              <div className="mb-6 space-y-3">
                {(
                  [
                    ["📅", "Book Classes", "Reserve your spot in bootcamp sessions"],
                    ["💳", "Buy Credits", "1 credit = 1 class session"],
                    ["🎁", "Refer Friends", "Earn bonus credits for referrals"],
                  ] as const
                ).map(([emoji, title, text]) => (
                  <div key={title} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <span className="text-2xl" aria-hidden="true">
                      {emoji}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => closeWelcome(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600"
                >
                  <Svg
                    d={[
                      "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
                      "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    ]}
                    className="h-5 w-5"
                  />
                  Take the Tour
                </button>
                <button
                  type="button"
                  onClick={() => closeWelcome(false)}
                  className="w-full py-3 font-medium text-gray-600 transition hover:text-gray-900"
                >
                  Maybe Later
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-gray-400">
                You can always restart the tour from the Help button
              </p>
            </div>
          </div>
        </div>
      )}

      {hover && (
        <div
          ref={hoverRef}
          id="hover-tooltip"
          role="tooltip"
          className={cn(
            "fb-tooltip-in pointer-events-none fixed z-[9999] max-w-xs rounded-lg bg-gray-900 text-white shadow-xl",
            `fb-tip-${hover.tip.position}`,
          )}
          style={
            hoverPos
              ? { top: hoverPos.top, left: hoverPos.left }
              : { top: 0, left: 0, visibility: "hidden" }
          }
        >
          <div className="p-3">
            <p className="mb-1 text-sm font-semibold">{hover.tip.title}</p>
            <p className="text-xs text-gray-300">{hover.tip.content}</p>
          </div>
          <div className="fb-tip-arrow" />
        </div>
      )}

      {toast && (
        <div
          id="tour-toast"
          role="status"
          className="fb-fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg transition-opacity duration-300"
          style={{ opacity: toast.fading ? 0 : 1 }}
        >
          {toast.text}
        </div>
      )}
    </>
  );
}
