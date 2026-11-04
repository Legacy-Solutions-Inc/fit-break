import Link from "next/link";

import type { PostList } from "@/services/fitbreak/blog";

import { NewspaperIcon } from "./blog-icons";
import { blogListHref, CategoryFilter } from "./category-filter";
import { PostCard } from "./post-card";

/** blog.html "Blog Posts Grid" section: filter pills, cards, empty state, load more. */
export function PostGrid({ list }: { list: PostList }) {
  const active = list.unknownCategory ? undefined : list.category;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <CategoryFilter active={active} />

        {list.posts.length === 0 ? (
          <div className="py-12 text-center">
            <NewspaperIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No posts yet</h3>
            <p className="mt-2 text-gray-600">
              Check back soon for fitness tips and wellness articles!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {list.posts.map((post, i) => (
              <PostCard key={post.id} post={post} priority={i < 3} />
            ))}
          </div>
        )}

        {list.hasMore && (
          <div className="mt-8 text-center">
            <Link
              href={blogListHref(list.category, list.page + 1)}
              scroll={false}
              className="inline-block rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600"
            >
              Load More Posts
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
