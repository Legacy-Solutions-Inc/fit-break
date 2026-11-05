import type { Metadata } from "next";

import { ClubRules } from "@/components/sites/fitbreak/content/club-rules";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/structured-data";

export const metadata: Metadata = pageMetadata(PAGE_SEO.clubRules);

export default function Page() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.clubRules), config.site.url)} />
      <ClubRules />
    </>
  );
}
