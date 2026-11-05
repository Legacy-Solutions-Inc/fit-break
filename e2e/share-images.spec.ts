import { expect, test, type Page } from "@playwright/test";

import { PUBLIC_PAGES } from "./public-pages";

// Share previews (docs/specs/2026-11-05-seo-geo-analytics.md → Share images):
// every public page links a generated share image with alt text, for Open
// Graph and X/Twitter, and the image URL serves an image.

async function meta(page: Page, selector: string): Promise<string | null> {
  const el = page.locator(selector).first();
  return (await el.count()) > 0 ? el.getAttribute("content") : null;
}

/** Same-origin path for an absolute meta URL, so the check hits the server under test. */
function localPath(url: string): string {
  const u = new URL(url);
  return `${u.pathname}${u.search}`;
}

const squash = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

// Image routes render on first request in dev; give them room.
test.describe.configure({ timeout: 90_000 });

for (const path of PUBLIC_PAGES) {
  test(`${path} has a generated share image for Open Graph and X`, async ({ page, request }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });

    const og = await meta(page, 'meta[property="og:image"]');
    const ogAlt = await meta(page, 'meta[property="og:image:alt"]');
    const twitter = await meta(page, 'meta[name="twitter:image"]');

    expect(og, "og:image").toBeTruthy();
    expect(twitter, "twitter:image").toBeTruthy();
    expect(ogAlt?.trim(), "og:image:alt").toBeTruthy();

    // The generated card, not a raw photo or the generic site image.
    expect(new URL(og!).pathname, "og:image is the page's share card").toMatch(/\/opengraph-image/);
    expect(new URL(twitter!).pathname, "twitter:image is the page's share card").toMatch(
      /\/twitter-image/,
    );

    // The card is titled with the page's visible heading.
    const h1 = (await page.locator("h1").first().textContent()) ?? "";
    expect(squash(ogAlt!), "og:image:alt names the page heading").toContain(squash(h1));

    for (const url of [og!, twitter!]) {
      const res = await request.get(localPath(url));
      expect(res.status(), url).toBe(200);
      expect(res.headers()["content-type"], url).toMatch(/^image\//);
    }
  });
}
