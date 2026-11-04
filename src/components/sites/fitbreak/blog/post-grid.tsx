import Link from "next/link";

import type { PostList } from "@/services/fitbreak/blog";

import { wrap } from "../editorial";
import { blogListHref, CategoryFilter } from "./category-filter";
import { LeadPost, PostRow } from "./post-card";

/**
 * The blog index (ADR 0009): category tabs, the first post as a large lead,
 * the rest as ruled rows, empty state, load more.
 */
export function PostGrid({ list }: { list: PostList }) {
  const active = list.unknownCategory ? undefined : list.category;
  const [lead, ...rest] = list.posts;

  return (
    <section className="pb-20 lg:pb-32">
      <div className={wrap}>
        <CategoryFilter active={active} />

        {!lead ? (
          <div className="py-20 lg:py-28">
            <h2 className="fb-display text-[clamp(2rem,4vw,3.25rem)]">No posts yet</h2>
            <p className="mt-4 max-w-md text-lg text-mute">
              Check back soon for fitness tips and wellness articles!
            </p>
          </div>
        ) : (
          <>
            <div className="pt-12 pb-16 lg:pt-16 lg:pb-24">
              <LeadPost post={lead} priority />
            </div>
            {rest.length > 0 && (
              <ol className="divide-y divide-ink/15 border-y border-ink/20">
                {rest.map((post, i) => (
                  <li key={post.id} data-reveal>
                    <PostRow post={post} priority={i < 2} />
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        {list.hasMore && (
          <div className="mt-12">
            <Link
              href={blogListHref(list.category, list.page + 1)}
              scroll={false}
              className="fb-btn fb-btn--ink"
            >
              Load More Posts
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
