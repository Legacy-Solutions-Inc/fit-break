import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/services/fitbreak/blog";

import { Arrow } from "../editorial";
import { routes } from "../links";
import { NewspaperIcon } from "./blog-icons";
import { categoryText, shortDate } from "./format";

/** Sharp image frame on bone; a quiet newspaper glyph when a post has no image. */
function Cover({
  post,
  priority,
  sizes,
  className,
}: {
  post: BlogPost;
  priority: boolean;
  sizes: string;
  className: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-bone ${className}`}>
      {post.image ? (
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <NewspaperIcon className="h-10 w-10 text-ink/25" />
        </div>
      )}
    </div>
  );
}

/** Date · category, set as small caps. */
function Meta({ post, stacked = false }: { post: BlogPost; stacked?: boolean }) {
  return (
    <p
      className={
        stacked
          ? "fb-label flex flex-wrap gap-x-3 text-mute lg:flex-col lg:gap-y-1"
          : "fb-label flex flex-wrap gap-x-3 text-mute"
      }
    >
      <span className="fb-num">{shortDate(post.publishedAt)}</span>
      <span aria-hidden="true" className={stacked ? "lg:hidden" : undefined}>
        ·
      </span>
      <span className="text-ink">{categoryText(post.category)}</span>
    </p>
  );
}

/** The newest post in the list: big photo and a big condensed title, 7/5 split. */
export function LeadPost({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <article>
      <Link
        href={routes.blogPost(post.id)}
        className="group grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10"
      >
        <Cover
          post={post}
          priority={priority}
          sizes="(min-width: 1440px) 790px, (min-width: 1024px) 56vw, 100vw"
          className="aspect-[3/2] lg:col-span-7"
        />
        <div className="lg:col-span-5 lg:pb-2">
          <Meta post={post} />
          <h2 className="fb-display mt-5 text-[clamp(2.2rem,3.75vw,3.45rem)] transition-colors group-hover:text-crimson-deep">
            {post.title}
          </h2>
          <p className="mt-6 line-clamp-3 max-w-lg text-lg leading-relaxed text-mute">
            {post.excerpt}
          </p>
          <span className="fb-link mt-8">
            Read More
            <Arrow />
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Every other post: a ruled row — meta, title and one-line excerpt, small photo on wide screens. */
export function PostRow({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <article>
      <Link
        href={routes.blogPost(post.id)}
        className="group grid gap-x-10 gap-y-3 py-8 transition-colors hover:bg-bone/60 sm:grid-cols-[1fr_9rem] lg:grid-cols-12 lg:items-start lg:py-9"
      >
        <div className="lg:col-span-2 lg:pt-1.5">
          <Meta post={post} stacked />
        </div>
        <div className="sm:col-start-1 sm:row-start-2 lg:col-span-7 lg:col-start-3 lg:row-start-1">
          <h2 className="fb-display text-[clamp(1.75rem,3.2vw,2.75rem)] transition-[color,translate] duration-300 group-hover:translate-x-1 group-hover:text-crimson-deep">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-2 max-w-2xl text-mute lg:line-clamp-1">{post.excerpt}</p>
        </div>
        <div className="hidden sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:block lg:col-span-2 lg:col-start-11 lg:row-span-1">
          <Cover
            post={post}
            priority={priority}
            sizes="(min-width: 1024px) 200px, 144px"
            className="aspect-[3/2] w-full"
          />
        </div>
      </Link>
    </article>
  );
}
