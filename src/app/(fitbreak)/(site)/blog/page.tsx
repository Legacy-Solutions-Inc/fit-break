import type { Metadata } from "next";

import { PostGrid } from "@/components/sites/fitbreak/blog/post-grid";
import { wrap } from "@/components/sites/fitbreak/editorial";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { Newsletter } from "@/components/sites/fitbreak/newsletter";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/structured-data";
import { listPosts } from "@/services/fitbreak/blog";

export const metadata: Metadata = pageMetadata(PAGE_SEO.blog);

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const list = await listPosts({ category: first(params.category), page: first(params.page) });

  return (
    <>
      <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.blog), config.site.url)} />
      <div className={`${wrap} pt-16 pb-12 lg:pt-24 lg:pb-16`}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <h1 className="fb-display text-[clamp(3rem,8vw,7rem)]">FitBreak Blog</h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-mute lg:col-span-4 lg:pb-3">
            Fitness tips, wellness articles, and workout guides to keep you motivated
          </p>
        </div>
      </div>

      <PostGrid list={list} />

      {/* Same markup as the homepage signup (the source tags it source: "blog_page"). */}
      <Newsletter source="blog_page" />
    </>
  );
}
