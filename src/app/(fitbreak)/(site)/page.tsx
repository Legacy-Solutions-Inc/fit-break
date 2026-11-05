import type { Metadata } from "next";

import { About } from "@/components/sites/fitbreak/about";
import { Contact } from "@/components/sites/fitbreak/contact";
import { Hero } from "@/components/sites/fitbreak/hero";
import { HomeFaq } from "@/components/sites/fitbreak/home-faq";
import { HOME_FAQS } from "@/components/sites/fitbreak/home-faq-content";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { MemberMetrics } from "@/components/sites/fitbreak/member-metrics";
import { Newsletter } from "@/components/sites/fitbreak/newsletter";
import { PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { Pricing } from "@/components/sites/fitbreak/pricing";
import { Programs } from "@/components/sites/fitbreak/programs";
import { VideoSection } from "@/components/sites/fitbreak/video-section";
import { homepageFaqEnabled, memberAreaEnabled } from "@/config";
import { getMember } from "@/lib/fitbreak/member";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildFaqPage } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  ...pageMetadata(PAGE_SEO.home),
  keywords: [
    "women-only gym",
    "bootcamp calapan",
    "fitness classes oriental mindoro",
    "gcash payment gym",
    "women fitness calapan",
    "bootcamp workout",
    "coach-led fitness",
    "small group training",
  ],
};

// The business record (with the five class times) is rendered for every page
// by the (fitbreak) layout.
export default async function HomePage() {
  // Information Site (Member Area parked): prices are public, no member stats.
  const signedIn = memberAreaEnabled && Boolean(await getMember());

  return (
    <>
      {homepageFaqEnabled && <JsonLd data={buildFaqPage(HOME_FAQS)} />}
      <Hero />
      <VideoSection />
      {signedIn && <MemberMetrics />}
      <About />
      <Programs />
      <Pricing showPrices={!memberAreaEnabled || signedIn} />
      <Newsletter />
      {homepageFaqEnabled && <HomeFaq />}
      <Contact />
    </>
  );
}
