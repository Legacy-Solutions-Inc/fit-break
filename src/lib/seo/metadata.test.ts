import { describe, expect, it } from "vitest";

import { PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import {
  ANNUAL_MEMBERSHIP_FEE_PHP,
  CORPORATE_RATE_PHP,
  formatPhp,
  formatTime,
  PACKAGES,
  TIME_SLOTS,
} from "@/services/fitbreak/catalog";

import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  const meta = pageMetadata({
    path: "/pricing",
    title: "A title",
    description: "A description",
  });

  it("sets an absolute title, the description and a canonical path", () => {
    expect(meta.title).toEqual({ absolute: "A title" });
    expect(meta.description).toBe("A description");
    expect(meta.alternates).toEqual({ canonical: "/pricing" });
  });

  it("gives share previews the same title and description, but no images", () => {
    expect(meta.openGraph).toMatchObject({
      url: "/pricing",
      title: "A title",
      description: "A description",
      siteName: "FitBreak",
    });
    expect(meta.twitter).toMatchObject({ title: "A title", description: "A description" });
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
  });
});

describe("PAGE_SEO", () => {
  const pages = Object.values(PAGE_SEO);

  it("keeps titles within 60 characters", () => {
    for (const p of pages) expect(p.title.length, p.title).toBeLessThanOrEqual(60);
  });

  it("never claims online booking or accounts", () => {
    for (const p of pages) expect(`${p.title} ${p.description}`).not.toMatch(/online|account/i);
  });

  it("quotes prices and times that equal the catalogue", () => {
    for (const pkg of PACKAGES)
      expect(PAGE_SEO.pricing.description).toContain(formatPhp(pkg.pricePhp));
    expect(PAGE_SEO.pricing.description).toContain(formatPhp(ANNUAL_MEMBERSHIP_FEE_PHP));
    for (const t of TIME_SLOTS) expect(PAGE_SEO.schedule.description).toContain(formatTime(t));
    expect(PAGE_SEO.corporate.title).toContain(formatPhp(CORPORATE_RATE_PHP));
  });
});
