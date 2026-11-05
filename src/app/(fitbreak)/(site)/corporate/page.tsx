import type { Metadata } from "next";

import { Corporate } from "@/components/sites/fitbreak/content/corporate";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs, buildCorporateOffer } from "@/lib/seo/structured-data";
import {
  CORPORATE_ELIGIBLE_CREDITS,
  CORPORATE_MIN_MEMBERS,
  CORPORATE_RATE_PHP,
} from "@/services/fitbreak/catalog";

export const metadata: Metadata = pageMetadata(PAGE_SEO.corporate);

export default function Page() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.corporate), config.site.url)} />
      <JsonLd
        data={buildCorporateOffer(
          {
            ratePhp: CORPORATE_RATE_PHP,
            minMembers: CORPORATE_MIN_MEMBERS,
            eligibleCredits: CORPORATE_ELIGIBLE_CREDITS,
          },
          config.site.url,
        )}
      />
      <Corporate />
    </>
  );
}
