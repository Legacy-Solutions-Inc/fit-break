// ─────────────────────────────────────────────────────────────────────────────
// Share-image facts (docs/specs/2026-11-05-seo-geo-analytics.md → Share images).
// Pure: per public page, the title (the page's visible H1), at most one Studio
// Fact, and the photo the page already shows. Prices, days, times, place and
// the coach come from the studio data so a share card can't drift from the page.
// ─────────────────────────────────────────────────────────────────────────────

import { coach } from "@/components/sites/fitbreak/coach/coach-data";
import { asset } from "@/components/sites/fitbreak/links";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import {
  addMinutesToTime,
  CLASS_DAYS,
  CLASS_MINUTES,
  CORPORATE_RATE_PHP,
  formatPhp,
  formatTime,
  PACKAGES,
  TIME_SLOTS,
  type ClassPackage,
} from "@/services/fitbreak/catalog";

export interface ShareCard {
  /** The page's visible H1 text. */
  title: string;
  /** Trailing words of the title the page sets in crimson. */
  accent?: string;
  /** At most one Studio Fact. */
  fact?: string;
  /** Public path of the page's photo (under /sites/fitbreak). */
  imagePath?: string;
  /** Which side of the photo to keep when it is cropped to the card (default centre). */
  photoAlign?: "left" | "right";
}

export type SharePage =
  | "home"
  | "pricing"
  | "schedule"
  | "ourStory"
  | "coach"
  | "fitbreakers"
  | "clubRules"
  | "corporate"
  | "blog"
  | "privacy"
  | "terms";

/** "Drop-in ₱350 · packs from ₱1,800" from the drop-in and the cheapest pack. */
export function pricingFact(packages: readonly ClassPackage[]): string {
  const dropIn = packages.find((p) => p.id === "drop-in");
  const packPrices = packages.filter((p) => p.id !== "drop-in").map((p) => p.pricePhp);
  const parts: string[] = [];
  if (dropIn) parts.push(`Drop-in ${formatPhp(dropIn.pricePhp)}`);
  if (packPrices.length > 0) parts.push(`packs from ${formatPhp(Math.min(...packPrices))}`);
  return parts.join(" · ");
}

/** "Mon–Sat · 6:30 AM–8:30 PM": the class days, first start to the end of the last class. */
export function scheduleFact(
  days: readonly string[],
  slots: readonly string[],
  classMinutes: number,
): string {
  const short = (day: string) => day.slice(0, 3);
  const firstDay = days[0];
  const lastDay = days.at(-1);
  const dayRange =
    firstDay && lastDay && firstDay !== lastDay
      ? `${short(firstDay)}–${short(lastDay)}`
      : short(firstDay ?? "");
  const sorted = [...slots].sort();
  const first = sorted[0];
  const last = sorted.at(-1);
  if (!first || !last) return dayRange;
  const end = addMinutesToTime(last, classMinutes);
  return `${dayRange} · ${formatTime(first)}–${formatTime(end)}`;
}

/** "₱200 a class" */
export function corporateFact(ratePhp: number): string {
  return `${formatPhp(ratePhp)} a class`;
}

/** "Iren San Buenaventura · Owner & Head Coach" */
export function coachFact(person: { name: string; jobTitle: string }): string {
  return `${person.name} · ${person.jobTitle.replace(/^FitBreak\s+/, "")}`;
}

export const SHARE_CARDS: Readonly<Record<SharePage, ShareCard>> = {
  home: {
    title: "FitBreak: For Every Moment You Choose Yourself",
    accent: "Choose Yourself",
    fact: `Women-only · ${STUDIO.address.addressLocality}`,
    imagePath: asset("/images/fitbreak12.webp"),
    photoAlign: "right",
  },
  pricing: {
    title: "Membership & Pricing",
    fact: pricingFact(PACKAGES),
    imagePath: asset("/images/stretching-lady.jpg"),
  },
  schedule: {
    title: "Class Schedule",
    fact: scheduleFact(CLASS_DAYS, TIME_SLOTS, CLASS_MINUTES),
    imagePath: asset("/images/fitbreak7.jpg"),
  },
  ourStory: {
    title: "Our Story",
    imagePath: asset("/images/fitbreak5.jpg"),
  },
  coach: {
    title: "Meet Coach Iren",
    accent: "Iren",
    fact: coachFact(coach),
    imagePath: coach.image,
  },
  fitbreakers: { title: "Who Are the FitBreakers?" },
  clubRules: { title: "Club House Rules" },
  corporate: {
    title: "Stronger Women. Healthier Teams.",
    accent: "Healthier Teams.",
    fact: corporateFact(CORPORATE_RATE_PHP),
  },
  blog: { title: "FitBreak Blog" },
  privacy: { title: "Privacy Policy" },
  terms: { title: "Terms of Service" },
};

const LOCAL_ASSET = /^\/sites\/fitbreak\/[\w/.-]+$/;

/** A blog post's card: its own title and cover image (local assets only), no fact. */
export function blogPostShareCard(post: { title: string; image: string }): ShareCard {
  const local = LOCAL_ASSET.test(post.image) && !post.image.includes("..");
  return local ? { title: post.title, imagePath: post.image } : { title: post.title };
}

/** Alt text for a share image: "FitBreak — Title. Fact" (brand once). */
export function shareImageAlt(card: ShareCard): string {
  const base = /^FitBreak\b/.test(card.title) ? card.title : `FitBreak — ${card.title}`;
  if (!card.fact) return base;
  return `${/[.?!]$/.test(base) ? base : `${base}.`} ${card.fact}`;
}

const TITLE_SIZES = [150, 136, 124, 112, 100, 90, 80, 72, 64, 56, 48] as const;
/** Average advance of Archivo Narrow Bold caps, in em (tight tracking included). */
const CAP_WIDTH_EM = 0.52;
const WORD_GAP_EM = 0.18;
/** Display line height, in em. */
export const TITLE_LINE_HEIGHT = 0.92;

/** Lines a greedy word wrap needs for `title` at `size` px in `width` px. */
function wrappedLines(title: string, size: number, width: number): number {
  let lines = 1;
  let used = 0;
  for (const word of title.split(/\s+/)) {
    const w = word.length * CAP_WIDTH_EM * size;
    if (w > width) return Number.POSITIVE_INFINITY;
    const next = used === 0 ? w : used + WORD_GAP_EM * size + w;
    if (next <= width) used = next;
    else {
      lines += 1;
      used = w;
    }
  }
  return lines;
}

/**
 * Largest display size (px) at which `title`, wrapped to `width` px, stays
 * within `height` px. Titles that cannot fit get the smallest size.
 */
export function titleFontSize(title: string, width: number, height: number): number {
  const fits = TITLE_SIZES.find(
    (size) => wrappedLines(title, size, width) * size * TITLE_LINE_HEIGHT <= height,
  );
  return fits ?? TITLE_SIZES[TITLE_SIZES.length - 1]!;
}
