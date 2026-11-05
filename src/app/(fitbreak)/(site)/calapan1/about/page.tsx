import type { Metadata } from "next";

import { certifications, coach } from "@/components/sites/fitbreak/coach/coach-data";
import { CoachProfile } from "@/components/sites/fitbreak/coach/coach-profile";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs, buildPerson } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  ...pageMetadata(PAGE_SEO.coach, { type: "profile" }),
  keywords: [
    "Iren San Buenaventura",
    "fitness coach",
    "personal trainer",
    "women fitness",
    "Calapan gym",
    "FitBreak owner",
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.coach), config.site.url)} />
      <JsonLd
        data={buildPerson(
          { ...coach, credentials: certifications.map((c) => c.title) },
          config.site.url,
        )}
      />
      <CoachProfile />
    </>
  );
}
