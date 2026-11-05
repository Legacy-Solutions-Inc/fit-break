import type { PageSeo } from "@/lib/seo/metadata";

import { routes } from "./links";

/*
 * Search titles and descriptions for every public page, as approved in
 * docs/research/fitbreak/seo-drafts.md ("keep current" rows keep the earlier
 * wording). `crumb` names the page in its breadcrumb trail. Prices and times
 * here are checked against the catalogue by src/lib/seo/metadata.test.ts.
 */

export interface PageSeoEntry extends PageSeo {
  crumb: string;
}

export const PAGE_SEO = {
  home: {
    path: routes.home,
    crumb: "Home",
    title: "Women-Only Bootcamp Gym in Calapan City | FitBreak",
    description:
      "Women-only, coach-led one-hour bootcamp classes in Calapan City, Monday to Saturday. Drop-in ₱350, packs from ₱1,800. Message us on Messenger to book.",
  },
  pricing: {
    path: routes.pricing,
    crumb: "Pricing",
    title: "FitBreak Prices: Drop-In ₱350, Packs from ₱1,800",
    description:
      "Guest drop-in ₱350. Starter 6 classes ₱1,800, Standard 12 for ₱3,300, Power 20 for ₱5,000, plus a ₱500 annual fee. Pay by GCash or BPI bank transfer.",
  },
  schedule: {
    path: routes.schedule,
    crumb: "Class Schedule",
    title: "Class Schedule, Monday to Saturday | FitBreak Calapan",
    description:
      "FitBreak classes run Monday to Saturday at 6:30 AM, 9:00 AM, 4:30 PM, 6:00 PM and 7:30 PM. Closed Sundays. All classes led by Coach Iren.",
  },
  ourStory: {
    path: routes.ourStory,
    crumb: "Our Story",
    title: "Our Story: Why FitBreak Was Born | Calapan City",
    description:
      "Discover the story behind FitBreak - a women-only fitness studio born from understanding what women truly need in their fitness journey.",
  },
  coach: {
    path: routes.coach,
    crumb: "Coach Iren",
    title: "Coach Iren San Buenaventura, Head Coach | FitBreak",
    description:
      "Iren San Buenaventura is FitBreak's owner and head coach in Calapan City: a certified personal trainer with more than 7 years in the fitness industry.",
  },
  fitbreakers: {
    path: routes.fitbreakers,
    crumb: "The FitBreakers",
    title: "Who Are the FitBreakers? | FitBreak Calapan",
    description:
      "FitBreakers are women who choose themselves. Discover the meaning behind the name and join our empowering community.",
  },
  clubRules: {
    path: routes.clubRules,
    crumb: "Club Rules",
    title: "Club House Rules | FitBreak Women-Only Studio, Calapan",
    description:
      "The 10 club house rules at FitBreak, Calapan City's women-only fitness studio: no class video recording, women's space only, payment before class and more.",
  },
  corporate: {
    path: routes.corporate,
    crumb: "Corporate Program",
    title: "Corporate Group Fitness for Women, ₱200 a Class | FitBreak",
    description:
      "₱200 per class (42% off) for organizations with 5 or more women on 12- or 20-class packs. Coach-led, women-only bootcamp classes in Calapan City.",
  },
  blog: {
    path: routes.blog,
    crumb: "Blog",
    title: "Fitness Tips for Women in Calapan | FitBreak Blog",
    description:
      "Workout, nutrition and motivation articles for women from FitBreak, the women-only bootcamp studio in Calapan City.",
  },
  privacy: {
    path: routes.privacy,
    crumb: "Privacy Policy",
    title: "Privacy Policy - FitBreak",
    description:
      "Privacy Policy for FitBreak - How we collect, use, and protect your personal information.",
  },
  terms: {
    path: routes.terms,
    crumb: "Terms of Service",
    title: "Terms of Service - FitBreak",
    description: "Terms of Service for FitBreak - Women-only fitness studio in Calapan City.",
  },
} as const satisfies Record<string, PageSeoEntry>;

/** Home → `page` (→ `extra`, e.g. a blog post) for BreadcrumbList. */
export function crumbsFor(
  page: PageSeoEntry,
  ...extra: ReadonlyArray<{ name: string; path: string }>
): Array<{ name: string; path: string }> {
  return [
    { name: PAGE_SEO.home.crumb, path: PAGE_SEO.home.path },
    { name: page.crumb, path: page.path },
    ...extra,
  ];
}
