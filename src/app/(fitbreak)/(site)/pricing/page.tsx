import type { Metadata } from "next";

import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { PricingPage } from "@/components/sites/fitbreak/pricing-page/pricing-page";
import { PRICING_FAQS } from "@/components/sites/fitbreak/pricing-page/pricing-faqs";
import { config, memberAreaEnabled } from "@/config";
import { getMember } from "@/lib/fitbreak/member";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs, buildFaqPage, buildOffers } from "@/lib/seo/structured-data";
import { PACKAGES } from "@/services/fitbreak/catalog";

export const metadata: Metadata = {
  ...pageMetadata(PAGE_SEO.pricing),
  keywords: ["fitness pricing", "gym membership", "Calapan gym", "class packages", "women fitness"],
};

export default async function Page() {
  // Information Site (Member Area parked): prices are public, no help tour.
  const signedIn = memberAreaEnabled && Boolean(await getMember());
  const showPrices = !memberAreaEnabled || signedIn;
  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.pricing), config.site.url)} />
      {/* Offers and FAQ only where the page shows the prices and questions. */}
      {showPrices && <JsonLd data={buildOffers(PACKAGES, config.site.url)} />}
      {showPrices && <JsonLd data={buildFaqPage(PRICING_FAQS)} />}
      <PricingPage signedIn={showPrices} />
      {/* The live pricing page loads onboarding-tour.js (floating "Need Help?" button). */}
      {memberAreaEnabled && <OnboardingTour page="pricing" />}
    </>
  );
}
