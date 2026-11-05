import type { Metadata } from "next";

export interface PageSeo {
  /** Site path, also the canonical (made absolute by the root `metadataBase`). */
  path: string;
  title: string;
  description: string;
}

/**
 * Pure: a page's title, description, canonical and share-preview text. Share
 * images are deliberately left out — the file-based `opengraph-image` routes
 * supply them, and an `images` key here would override those.
 */
export function pageMetadata(
  { path, title, description }: PageSeo,
  options: { type?: "website" | "profile" } | { type: "article"; publishedTime?: string } = {},
): Metadata {
  const shared = { url: path, title, description, siteName: "FitBreak", locale: "en_PH" };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph:
      options.type === "article"
        ? { ...shared, type: "article", publishedTime: options.publishedTime }
        : { ...shared, type: options.type ?? "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
