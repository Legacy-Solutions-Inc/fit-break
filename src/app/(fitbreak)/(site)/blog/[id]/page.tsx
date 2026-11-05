import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostView } from "@/components/sites/fitbreak/blog/post-view";
import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { routes } from "@/components/sites/fitbreak/links";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import { config } from "@/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBlogPosting, buildBreadcrumbs } from "@/lib/seo/structured-data";
import { getPost, getRelatedPosts, listPostIds } from "@/services/fitbreak/blog";

type Params = Promise<{ id: string }>;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateStaticParams() {
  return (await listPostIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(safeDecode(id));
  // The source's default <head> before a post loads (also its not-found state).
  if (!post) {
    return {
      title: { absolute: "Blog Post — FitBreak" },
      description: "Read this fitness article from FitBreak.",
    };
  }

  const title = `${post.title} — FitBreak Blog`;
  return {
    ...pageMetadata(
      { path: routes.blogPost(post.id), title, description: post.excerpt || post.title },
      { type: "article", publishedTime: post.publishedAt },
    ),
    keywords: post.keywords,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPost(safeDecode(id));
  if (!post) notFound();

  const related = await getRelatedPosts(post.id);
  const shareUrl = new URL(routes.blogPost(post.id), config.site.url).toString();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbs(
          crumbsFor(PAGE_SEO.blog, { name: post.title, path: routes.blogPost(post.id) }),
          config.site.url,
        )}
      />
      <JsonLd data={buildBlogPosting(post, STUDIO, config.site.url)} />
      <PostView post={post} related={related} shareUrl={shareUrl} />
    </>
  );
}
