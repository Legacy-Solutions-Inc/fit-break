import type { Metadata } from "next";

import { routes } from "@/components/sites/fitbreak/links";
import { PricingPage } from "@/components/sites/fitbreak/pricing-page/pricing-page";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { getMember } from "@/lib/fitbreak/member";

export const metadata: Metadata = {
  title: { absolute: "Membership & Pricing - FitBreak" },
  description:
    "Choose the perfect fitness package for your goals. Starter, Standard, and Power packages with flexible pricing. Pay via GCash or bank transfer.",
  keywords: ["fitness pricing", "gym membership", "Calapan gym", "class packages", "women fitness"],
  alternates: { canonical: routes.pricing },
};

export default async function Page() {
  const signedIn = Boolean(await getMember());
  return (
    <>
      <PricingPage signedIn={signedIn} />
      {/* The live pricing page loads onboarding-tour.js (floating "Need Help?" button). */}
      <OnboardingTour page="pricing" />
    </>
  );
}
