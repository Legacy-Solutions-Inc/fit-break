import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/services/fitbreak/blog";

import { Icon } from "../icons";
import { routes } from "../links";
import styles from "./article.module.css";
import { ChevronLeftIcon } from "./blog-icons";
import { categoryText, longDate, monthDay } from "./format";
import { ShareButtons } from "./share-buttons";

/** blog-post.html `#post-content`: gradient hero, article card, CTA, related posts. */
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
    // The source's `font-sans` is Inter, which the app body already sets.
    <div>
      <PostHero post={post} />

      <article className="mx-auto -mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10 md:p-12">
          {post.image && (
            <div className="-mx-2 -mt-2 mb-8 sm:-mx-4 md:-mx-6">
              <Image
                src={post.image}
                alt={post.title}
                width={1200}
                height={675}
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                className="h-auto w-full rounded-xl"
              />
            </div>
          )}

          {/* Author */}
          <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-brand-600">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">FitBreak Team</p>
              <p className="text-sm text-gray-500">Fitness &amp; Wellness Experts</p>
            </div>
          </div>

          <div
            className={styles.prose}
            // Sanitized at extraction (semantic tags only, no attributes but
            // a[href]/img[src|alt]) — see src/services/fitbreak/blog-data.ts.
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Keywords */}
          <div className="mt-10 border-t border-gray-100 pt-8">
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {`#${keyword.replace(/\s+/g, "")}`}
                </span>
              ))}
            </div>
          </div>

          <ShareButtons url={shareUrl} title={post.title} />
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-8 text-center text-white md:p-10">
          <h3 className="mb-3 text-2xl font-bold md:text-3xl">
            Ready to Start Your Fitness Journey?
          </h3>
          <p className="mx-auto mb-6 max-w-lg text-white/90">
            Join FitBreak today and experience the supportive, women-only environment you deserve.
          </p>
          <Link
            href={routes.pricing}
            className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-brand-600 shadow-lg transition-colors hover:bg-brand-50"
          >
            View Our Packages
          </Link>
        </div>

        {related.length > 0 && (
          <div className="mt-12 mb-16">
            <h3 className="mb-6 text-xl font-bold text-gray-900">More Articles You Might Like</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={routes.blogPost(r.id)}
                  className="group block rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 capitalize">
                      {categoryText(r.category)}
                    </span>
                    <span>•</span>
                    <span>{monthDay(r.publishedAt)}</span>
                  </div>
                  <h4 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
                    {r.title}
                  </h4>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function PostHero({ post }: { post: BlogPost }) {
  return (
    <div className="bg-linear-to-br from-brand-500 via-brand-600 to-brand-500">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={routes.blog}
            className="inline-flex items-center font-medium text-white/80 transition-colors hover:text-white"
          >
            <ChevronLeftIcon className="mr-2 h-5 w-5" />
            Back to Blog
          </Link>
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white capitalize backdrop-blur-xs">
            {categoryText(post.category)}
          </span>
        </div>

        {/* v3: responsive text-* also reset line-height and beat leading-tight. */}
        <h1 className="mb-6 text-3xl leading-tight font-bold text-white md:text-4xl md:leading-10 lg:text-5xl lg:leading-none">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-white/80">
          <div className="flex items-center gap-2">
            <Icon name="calendar" className="h-5 w-5" />
            <span>{longDate(post.publishedAt)}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Icon name="clock" className="h-5 w-5" />
            <span>{post.readMinutes} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
}
