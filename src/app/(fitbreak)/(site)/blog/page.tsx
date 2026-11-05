import type { Metadata } from "next";

import { PostGrid } from "@/components/sites/fitbreak/blog/post-grid";
import { wrap } from "@/components/sites/fitbreak/editorial";
import { routes } from "@/components/sites/fitbreak/links";
import { Newsletter } from "@/components/sites/fitbreak/newsletter";
import { listPosts } from "@/services/fitbreak/blog";

const title = "Blog — FitBreak | Fitness Tips & Wellness Articles";
const description =
  "Read the latest fitness tips, wellness articles, and workout guides from FitBreak. Stay motivated and informed on your fitness journey.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: routes.blog },
  openGraph: { type: "website", url: routes.blog, title, description, siteName: "FitBreak" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const list = await listPosts({ category: first(params.category), page: first(params.page) });

  return (
    <>
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
