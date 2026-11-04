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
 * The source's `.category-btn` pills (white / gray-200 border, gray-100 hover;
 * active = brand-500 fill, which also wins on hover). Links instead of buttons
 * so the filter is shareable via `?category=`.
 */
export function CategoryFilter({ active }: { active: BlogCategory | null | undefined }) {
  return (
    <nav aria-label="Blog categories" className="mb-8 flex flex-wrap justify-center gap-2">
      {CATEGORY_PILLS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <Link
            key={label}
            href={blogListHref(value)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              isActive
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
