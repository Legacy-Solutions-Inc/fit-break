import { DEFINITION_SENTENCE } from "@/components/sites/fitbreak/home-faq-content";
import { PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import { config, homepageFaqEnabled } from "@/config";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import {
  ANNUAL_MEMBERSHIP_FEE_PHP,
  CORPORATE_ELIGIBLE_CREDITS,
  CORPORATE_MIN_MEMBERS,
  CORPORATE_RATE_PHP,
  PACKAGES,
} from "@/services/fitbreak/catalog";

// Built once from studio data; no request input.
export const dynamic = "force-static";

/** Key pages for AI answer engines, each with a one-line summary of what it holds. */
const pages = [
  {
    page: PAGE_SEO.home,
    title: "Home",
    summary: "Studio overview, class times, prices and contact",
  },
  { page: PAGE_SEO.pricing, title: "Pricing", summary: "Drop-in and pack prices, payment, FAQ" },
  { page: PAGE_SEO.schedule, title: "Class Schedule", summary: "Class times, Monday to Saturday" },
  {
    page: PAGE_SEO.coach,
    title: "Coach Iren",
    summary: "The owner and head coach and her certifications",
  },
  {
    page: PAGE_SEO.corporate,
    title: "Corporate Group Program",
    summary: "Group rate for organizations",
  },
  { page: PAGE_SEO.clubRules, title: "Club House Rules", summary: "The studio's 10 rules" },
  { page: PAGE_SEO.ourStory, title: "Our Story", summary: "Why FitBreak was started" },
  { page: PAGE_SEO.blog, title: "Blog", summary: "Workout, nutrition and motivation articles" },
].map(({ page, title, summary }) => ({ title, path: page.path, summary }));

export function GET() {
  const body = buildLlmsTxt(
    {
      studio: STUDIO,
      packages: PACKAGES,
      annualFeePhp: ANNUAL_MEMBERSHIP_FEE_PHP,
      corporate: {
        ratePhp: CORPORATE_RATE_PHP,
        minMembers: CORPORATE_MIN_MEMBERS,
        eligibleCredits: CORPORATE_ELIGIBLE_CREDITS,
      },
      pages,
      // The definition sentence goes out only once the studio approves it.
      definition: homepageFaqEnabled ? DEFINITION_SENTENCE : undefined,
    },
    config.site.url,
  );
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
