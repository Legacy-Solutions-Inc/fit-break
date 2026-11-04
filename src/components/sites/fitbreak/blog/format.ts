import type { BlogCategory } from "@/services/fitbreak/blog";

/**
 * The source prints `category.replace('-', ' ')` and lets CSS `capitalize` do
 * the rest ("fitness-tips" → "fitness tips" → "Fitness Tips").
 */
export function categoryText(category: BlogCategory): string {
  return category.replace("-", " ");
}

/** Filter pills, in source order. `null` = "All Posts". */
export const CATEGORY_PILLS: ReadonlyArray<{ value: BlogCategory | null; label: string }> = [
  { value: null, label: "All Posts" },
  { value: "fitness-tips", label: "Fitness Tips" },
  { value: "nutrition", label: "Nutrition" },
  { value: "motivation", label: "Motivation" },
  { value: "wellness", label: "Wellness" },
];

// `publishedAt` is a calendar date; format it in UTC so it never shifts a day.
function format(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

/** List cards: "Apr 20, 2026". */
export const shortDate = (date: string) =>
  format(date, { month: "short", day: "numeric", year: "numeric" });

/** Post hero: "April 20, 2026". */
export const longDate = (date: string) =>
  format(date, { month: "long", day: "numeric", year: "numeric" });

/** Related cards: "Apr 13". */
export const monthDay = (date: string) => format(date, { month: "short", day: "numeric" });
