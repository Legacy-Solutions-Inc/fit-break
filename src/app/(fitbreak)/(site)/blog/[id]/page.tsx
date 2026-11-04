import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostView } from "@/components/sites/fitbreak/blog/post-view";
import { routes } from "@/components/sites/fitbreak/links";
import { config } from "@/config";
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
  const description = post.excerpt || post.title;
  const url = routes.blogPost(post.id);
  return {
    title: { absolute: title },
    description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "FitBreak",
      publishedTime: post.publishedAt,
      images: [{ url: post.image, width: 1200, height: 675, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPost(safeDecode(id));
  if (!post) notFound();

  const related = await getRelatedPosts(post.id);
  const shareUrl = new URL(routes.blogPost(post.id), config.site.url).toString();

  return <PostView post={post} related={related} shareUrl={shareUrl} />;
}
