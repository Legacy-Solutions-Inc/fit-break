import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/services/fitbreak/blog";

import { Arrow, wrap } from "../editorial";
import { routes } from "../links";
import styles from "./article.module.css";
import { ChevronLeftIcon } from "./blog-icons";
import { categoryText, longDate, monthDay } from "./format";
import { ShareButtons } from "./share-buttons";

/**
 * A blog post as a long-form article (ADR 0009): condensed headline, sharp
 * hero photo, a ~65ch reading column with the byline in a side rail, then an
 * ink call-to-action band and ruled related posts.
 */
export function PostView({
  post,
  related,
  shareUrl,
}: {
  post: BlogPost;
  related: BlogPost[];
  shareUrl: string;
}) {
  return (
    <div>
      <PostHero post={post} />

      <article className={`${wrap} pb-20 lg:pb-28`}>
        {post.image && (
          <div className="relative aspect-[16/9] overflow-hidden bg-bone">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1440px) 1344px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12">
          {/* Byline: a side rail on wide screens, above the text on phones. */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28 lg:border-t lg:border-ink/20 lg:pt-5">
              <p className="font-semibold text-ink">FitBreak Team</p>
              <p className="text-sm text-mute">Fitness &amp; Wellness Experts</p>
            </div>
          </aside>

          <div className="max-w-[47rem] min-w-0 lg:col-span-8 lg:col-start-5">
            <div
              className={styles.prose}
              // Sanitized at extraction (semantic tags only, no attributes but
              // a[href]/img[src|alt]) — see src/services/fitbreak/blog-data.ts.
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Keywords */}
            <div className="mt-14 border-t border-ink/20 pt-6">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {post.keywords.map((keyword) => (
                  <li key={keyword} className="fb-label text-mute">
                    {`#${keyword.replace(/\s+/g, "")}`}
                  </li>
                ))}
              </ul>
            </div>

            <ShareButtons url={shareUrl} title={post.title} />
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-28">
        <div className={`${wrap} relative z-[2] grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <h2 className="fb-display text-[clamp(2.2rem,4.35vw,3.75rem)] lg:col-span-7">
            Ready to Start Your Fitness Journey?
          </h2>
          <div className="lg:col-span-4 lg:col-start-9 lg:pb-2">
            <p className="mb-8 max-w-md text-lg text-paper/80">
              Join FitBreak today and experience the supportive, women-only environment you deserve.
            </p>
            <Link href={routes.pricing} className="fb-btn fb-btn--paper">
              View Our Packages
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className={wrap}>
            <h2 className="fb-display text-[clamp(1.9rem,3.6vw,2.9rem)]">
              More Articles You Might Like
            </h2>
            <ul className="mt-10 grid border-t border-ink/20 md:grid-cols-2 md:gap-x-10 lg:mt-14">
              {related.map((r) => (
                <li key={r.id} data-reveal className="border-b border-ink/15">
                  <Link
                    href={routes.blogPost(r.id)}
                    className="group block py-8 transition-colors hover:bg-bone/60"
                  >
                    <p className="fb-label flex gap-3 text-mute">
                      <span className="text-ink">{categoryText(r.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="fb-num">{monthDay(r.publishedAt)}</span>
                    </p>
                    <h3 className="fb-display mt-4 text-[clamp(1.75rem,2.8vw,2.5rem)] transition-colors group-hover:text-crimson-deep">
                      {r.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 max-w-xl text-mute">{r.excerpt}</p>
                    <span className="fb-label mt-5 inline-flex items-center gap-2 text-ink">
                      Read More
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function PostHero({ post }: { post: BlogPost }) {
  return (
    <header className={`${wrap} pt-10 pb-12 lg:pt-14 lg:pb-16`}>
      <Link
        href={routes.blog}
        className="fb-label inline-flex items-center gap-2 text-mute transition-colors hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Blog
      </Link>

      <h1 className="fb-display mt-12 max-w-[18ch] text-[clamp(2.35rem,4.75vw,4.55rem)] lg:mt-16">
        {post.title}
      </h1>

      <p className="fb-label mt-8 flex flex-wrap gap-x-3 gap-y-1 text-mute">
        <span className="text-ink">{categoryText(post.category)}</span>
        <span aria-hidden="true">·</span>
        <span className="fb-num">{longDate(post.publishedAt)}</span>
        <span aria-hidden="true">·</span>
        <span className="fb-num">{post.readMinutes} min read</span>
      </p>
    </header>
  );
}
