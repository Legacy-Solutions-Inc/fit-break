import Link from "next/link";

import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/services/fitbreak/blog";

import { routes } from "../links";
import { CATEGORY_PILLS } from "./format";

/** `/blog`, `/blog?category=nutrition`, `/blog?category=nutrition&page=2`. */
export function blogListHref(category: BlogCategory | null, page = 1): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${routes.blog}?${query}` : routes.blog;
}

/**
 * Category tabs: plain text on a hairline, the active one inked and underlined
 * (ADR 0009). Links instead of buttons so the filter is shareable via `?category=`.
 */
export function CategoryFilter({ active }: { active: BlogCategory | null | undefined }) {
  return (
    <nav aria-label="Blog categories" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-7 border-b border-ink/15 sm:gap-10">
        {CATEGORY_PILLS.map(({ value, label }) => {
          const isActive = active === value;
          return (
            <li key={label}>
              <Link
                href={blogListHref(value)}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "fb-label -mb-px block border-b-2 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson",
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-mute hover:border-ink/30 hover:text-ink",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
