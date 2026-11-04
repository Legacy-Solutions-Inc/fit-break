import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/services/fitbreak/blog";

import { Icon } from "../icons";
import { routes } from "../links";
import { NewspaperIcon } from "./blog-icons";
import { categoryText, shortDate } from "./format";

/** blog.html `createPostCard()`. */
export function PostCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <article className="group fb-lift overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition-all hover:shadow-lg">
      <Link href={routes.blogPost(post.id)} className="block">
        <div className="relative aspect-video overflow-hidden bg-linear-to-br from-brand-100 to-accent-100">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 352px, (min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <NewspaperIcon className="h-16 w-16 text-brand-300" />
            </div>
          )}
          <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-600 capitalize backdrop-blur-xs">
            {categoryText(post.category)}
          </span>
        </div>
        <div className="p-6">
          <p className="mb-2 text-sm text-gray-500">{shortDate(post.publishedAt)}</p>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>
          <div className="mt-4 flex items-center text-sm font-semibold text-brand-600">
            Read More
            <Icon
              name="chevronRight"
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
