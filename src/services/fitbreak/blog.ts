// ─────────────────────────────────────────────────────────────────────────────
// Blog Service Seam. The live fitbreak.ph blog reads its Firestore `blog_posts`
// collection (status "published", newest `publishedAt` first) in the browser;
// this clone serves a snapshot of those posts from ./blog-data (mock-first,
// docs/adr/0003). Swap the bodies below for a Drizzle/Supabase query — callers
// don't change.
// ─────────────────────────────────────────────────────────────────────────────

import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from "./blog-data";

export { BLOG_CATEGORIES, type BlogCategory, type BlogPost };

/** The source loads 9 posts per query and a "Load More Posts" button adds 9 more. */
export const POSTS_PER_PAGE = 9;

export interface ListPostsOptions {
  /** Category slug or label, case-insensitive ("nutrition", "Fitness Tips"). Omit for all. */
  category?: string | null;
  /** How many "pages" of 9 are loaded (the source's load-more is cumulative). */
  page?: number | string | null;
}

export interface PostList {
  posts: BlogPost[];
  /** Resolved category, `null` for "All Posts". */
  category: BlogCategory | null;
  /** True when the requested category is not one of BLOG_CATEGORIES. */
  unknownCategory: boolean;
  page: number;
  total: number;
  hasMore: boolean;
}

const newestFirst = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

/** Normalizes "Fitness Tips" / "fitness_tips" / "FITNESS-TIPS" to the slug. */
export function parseCategory(value: string | null | undefined): BlogCategory | null | undefined {
  if (!value) return null;
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  if (slug === "" || slug === "all") return null;
  return (BLOG_CATEGORIES as readonly string[]).includes(slug) ? (slug as BlogCategory) : undefined;
}

function parsePage(value: ListPostsOptions["page"]): number {
  const n = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** Published posts, newest first, filtered by category and paged cumulatively. */
export async function listPosts({ category, page }: ListPostsOptions = {}): Promise<PostList> {
  const resolved = parseCategory(category);
  const pageNumber = parsePage(page);
  const matching =
    resolved === undefined
      ? []
      : resolved === null
        ? newestFirst
        : newestFirst.filter((p) => p.category === resolved);
  const shown = matching.slice(0, pageNumber * POSTS_PER_PAGE);
  return {
    posts: shown,
    category: resolved ?? null,
    unknownCategory: resolved === undefined,
    page: pageNumber,
    total: matching.length,
    hasMore: shown.length < matching.length,
  };
}

export async function getPost(id: string): Promise<BlogPost | null> {
  return newestFirst.find((p) => p.id === id) ?? null;
}

/**
 * "More Articles You Might Like": like the source, the newest four published
 * posts minus the current one, capped at two (not category-matched).
 */
export async function getRelatedPosts(id: string, max = 2): Promise<BlogPost[]> {
  return newestFirst
    .slice(0, 4)
    .filter((p) => p.id !== id)
    .slice(0, max);
}

export async function listPostIds(): Promise<string[]> {
  return newestFirst.map((p) => p.id);
}
