import type { MetadataRoute } from "next";

import { routes } from "@/components/sites/fitbreak/links";
import { getSiteURL } from "@/lib/get-site-url";
import { buildSitemap } from "@/lib/seo";
import { listPostIds } from "@/services/fitbreak/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postIds = await listPostIds();
  return buildSitemap(
    getSiteURL(),
    new Date(),
    postIds.map((id) => routes.blogPost(id)),
  );
}
