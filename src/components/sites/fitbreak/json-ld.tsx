import { serializeJsonLd } from "@/lib/seo/structured-data";

/**
 * Renders structured data built by `@/lib/seo/structured-data`. A data block,
 * not a script the browser runs, so the CSP nonce isn't needed; `<` is escaped
 * so no value can close the tag.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
