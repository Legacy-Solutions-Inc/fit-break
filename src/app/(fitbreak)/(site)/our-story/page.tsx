import type { Metadata } from "next";

import { OurStory } from "@/components/sites/fitbreak/content/our-story";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/structured-data";

export const metadata: Metadata = pageMetadata(PAGE_SEO.ourStory);

export default function Page() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.ourStory), config.site.url)} />
      <OurStory />
    </>
  );
}
