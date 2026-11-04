import type { Metadata } from "next";

import { PostGrid } from "@/components/sites/fitbreak/blog/post-grid";
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
      <section className="bg-linear-to-br from-brand-500 to-brand-700 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">FitBreak Blog</h1>
          <p className="mx-auto max-w-2xl text-xl text-white/90">
            Fitness tips, wellness articles, and workout guides to keep you motivated
          </p>
        </div>
      </section>

      <PostGrid list={list} />

      {/* Same markup as the homepage signup (the source tags it source: "blog_page"). */}
      <Newsletter source="blog_page" />
    </>
  );
}
