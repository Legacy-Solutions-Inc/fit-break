import { expect, test, type Page } from "@playwright/test";

import { PUBLIC_PAGES } from "./public-pages";

// SEO and GEO/AEO (docs/specs/2026-11-05-seo-geo-analytics.md): what search
// engines and AI answer engines read must be the approved wording and must equal
// what the page shows. Share images (og:image) are covered elsewhere.

type PublicPage = (typeof PUBLIC_PAGES)[number];

/** Approved titles and descriptions (docs/research/fitbreak/seo-drafts.md). */
const APPROVED: Record<PublicPage, { title: string; description: string }> = {
  "/": {
    title: "Women-Only Bootcamp Gym in Calapan City | FitBreak",
    description:
      "Women-only, coach-led one-hour bootcamp classes in Calapan City, Monday to Saturday. Drop-in ₱350, packs from ₱1,800. Message us on Messenger to book.",
  },
  "/pricing": {
    title: "FitBreak Prices: Drop-In ₱350, Packs from ₱1,800",
    description:
      "Guest drop-in ₱350. Starter 6 classes ₱1,800, Standard 12 for ₱3,300, Power 20 for ₱5,000, plus a ₱500 annual fee. Pay by GCash or BPI bank transfer.",
  },
  "/schedule": {
    title: "Class Schedule, Monday to Saturday | FitBreak Calapan",
    description:
      "FitBreak classes run Monday to Saturday at 6:30 AM, 9:00 AM, 4:30 PM, 6:00 PM and 7:30 PM. Closed Sundays. All classes led by Coach Iren.",
  },
  "/our-story": {
    title: "Our Story: Why FitBreak Was Born | Calapan City",
    description:
      "Discover the story behind FitBreak - a women-only fitness studio born from understanding what women truly need in their fitness journey.",
  },
  "/calapan1/about": {
    title: "Coach Iren San Buenaventura, Head Coach | FitBreak",
    description:
      "Iren San Buenaventura is FitBreak's owner and head coach in Calapan City: a certified personal trainer with more than 7 years in the fitness industry.",
  },
  "/fitbreakers": {
    title: "Who Are the FitBreakers? | FitBreak Calapan",
    description:
      "FitBreakers are women who choose themselves. Discover the meaning behind the name and join our empowering community.",
  },
  "/club-rules": {
    title: "Club House Rules | FitBreak Women-Only Studio, Calapan",
    description:
      "The 10 club house rules at FitBreak, Calapan City's women-only fitness studio: no class video recording, women's space only, payment before class and more.",
  },
  "/corporate": {
    title: "Corporate Group Fitness for Women, ₱200 a Class | FitBreak",
    description:
      "₱200 per class (42% off) for organizations with 5 or more women on 12- or 20-class packs. Coach-led, women-only bootcamp classes in Calapan City.",
  },
  "/blog": {
    title: "Fitness Tips for Women in Calapan | FitBreak Blog",
    description:
      "Workout, nutrition and motivation articles for women from FitBreak, the women-only bootcamp studio in Calapan City.",
  },
  // Blog posts keep their own titles; the description is the post's excerpt.
  "/blog/kdHl9EbopUVKOpyfAc4e": {
    title: "Stay Pumped at FitBreak: Your Ultimate Motivation Guide — FitBreak Blog",
    description:
      "Feeling your fitness fire fading? Reignite your drive with FitBreak's motivation guide! Conquer plateaus, find your spark, and crush every goal.",
  },
  "/privacy-policy": {
    title: "Privacy Policy - FitBreak",
    description:
      "Privacy Policy for FitBreak - How we collect, use, and protect your personal information.",
  },
  "/terms-of-service": {
    title: "Terms of Service - FitBreak",
    description: "Terms of Service for FitBreak - Women-only fitness studio in Calapan City.",
  },
};

type Node = Record<string, unknown> & { "@type"?: string };

/** Every JSON-LD block on the page, parsed (a parse error fails the test). */
async function jsonLd(page: Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((raw) => JSON.parse(raw) as Node);
}

function byType<T = Node>(nodes: Node[], type: string): T[] {
  return nodes.filter((n) => n["@type"] === type) as T[];
}

const meta = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute("content");

/** "18:00" → "6:00", plus "PM" for the suffix. */
function to12h(time: string): { clock: string; suffix: string } {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return {
    clock: `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")}`,
    suffix: h >= 12 ? "PM" : "AM",
  };
}

/** Opening hours as the pages print class times: "6:30 - 7:30 AM". */
function printed(h: { opens: string; closes: string }): string {
  return `${to12h(h.opens).clock} - ${to12h(h.closes).clock} ${to12h(h.closes).suffix}`;
}

const peso = (n: number) => `₱${n.toLocaleString("en-US")}`;

for (const path of PUBLIC_PAGES) {
  test(`${path} has the approved title/description, an absolute canonical and valid structured data`, async ({
    page,
  }) => {
    await page.goto(path);
    const { title, description } = APPROVED[path];

    await expect(page).toHaveTitle(title);
    expect(await meta(page, 'meta[name="description"]')).toBe(description);
    expect(await meta(page, 'meta[property="og:title"]')).toBe(title);
    expect(await meta(page, 'meta[property="og:description"]')).toBe(description);
    expect(await meta(page, 'meta[name="twitter:title"]')).toBe(title);
    expect(await meta(page, 'meta[name="twitter:description"]')).toBe(description);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\//);
    expect(new URL(canonical ?? "").pathname).toBe(path);

    const nodes = await jsonLd(page);
    // One business record per page, which other records refer to.
    const [business, ...extra] = byType<{ "@id": string; paymentAccepted: string }>(
      nodes,
      "SportsActivityLocation",
    );
    expect(extra).toHaveLength(0);
    expect(business?.["@id"]).toMatch(/\/#business$/);
    expect(business?.paymentAccepted).not.toMatch(/\bcash\b/i);

    if (path !== "/") {
      const [crumbs] = byType<{ itemListElement: Array<{ item: string }> }>(
        nodes,
        "BreadcrumbList",
      );
      const items = crumbs?.itemListElement ?? [];
      expect(items.length).toBeGreaterThanOrEqual(2);
      for (const i of items) expect(i.item).toMatch(/^https?:\/\//);
      expect(new URL(items.at(-1)?.item ?? "").pathname).toBe(path);
    }
  });
}

test("/pricing offers equal the prices shown on the page", async ({ page }) => {
  await page.goto("/pricing");
  const [catalog] = byType<{
    itemListElement: Array<{ name: string; price: number; priceCurrency: string }>;
  }>(await jsonLd(page), "OfferCatalog");
  const offers = catalog?.itemListElement ?? [];
  expect(offers.map((o) => o.name)).toEqual([
    "Guest Drop-In",
    "Starter Pack",
    "Standard Pack",
    "Power Pack",
  ]);

  for (const offer of offers) {
    expect(offer.priceCurrency).toBe("PHP");
    const shown =
      offer.name === "Guest Drop-In"
        ? page.locator('[data-placement="drop-in"]')
        : page.locator(`[data-placement="pricing-pack"][data-pack="${offer.name}"]`);
    await expect(shown, offer.name).toContainText(peso(offer.price));
  }
});

for (const path of ["/pricing", "/"] as const) {
  test(`${path} FAQ structured data equals the visible questions and answers`, async ({ page }) => {
    await page.goto(path);
    const faqPages = byType<{
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    }>(await jsonLd(page), "FAQPage");
    // The homepage FAQ waits for the studio's approval (homepageFaqEnabled).
    if (path === "/" && faqPages.length === 0) {
      await expect(page.getByRole("heading", { name: "Frequently Asked Questions" })).toHaveCount(
        0,
      );
      return;
    }
    const questions = faqPages[0]?.mainEntity ?? [];
    if (path === "/pricing") expect(questions).toHaveLength(6);
    await expect(page.locator("main details")).toHaveCount(questions.length);
    for (const q of questions) {
      const item = page.locator("main details").filter({ hasText: q.name });
      await expect(item, q.name).toHaveCount(1);
      await expect(item).toContainText(q.acceptedAnswer.text);
    }
  });
}

for (const path of ["/", "/schedule"] as const) {
  test(`${path} opening hours equal the five class times on the page`, async ({ page }) => {
    await page.goto(path);
    const [business] = byType<{
      openingHoursSpecification: Array<{ dayOfWeek: string[]; opens: string; closes: string }>;
    }>(await jsonLd(page), "SportsActivityLocation");
    const hours = business?.openingHoursSpecification ?? [];
    expect(hours).toHaveLength(5);
    for (const h of hours) {
      expect(h.dayOfWeek).toEqual([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]);
    }

    const text = (await page.locator("main").textContent()) ?? "";
    const visible = [...new Set(text.match(/\d{1,2}:\d{2} - \d{1,2}:\d{2} [AP]M/g) ?? [])];
    expect(visible.sort()).toEqual(hours.map(printed).sort());
  });
}

test("/corporate offers the ₱200 group rate it shows", async ({ page }) => {
  await page.goto("/corporate");
  const offers = byType<{ name: string; price: number; priceCurrency: string }>(
    await jsonLd(page),
    "Offer",
  );
  expect(offers).toHaveLength(1);
  expect(offers[0]).toMatchObject({ price: 200, priceCurrency: "PHP" });
  await expect(page.locator("main")).toContainText(peso(200));
});

test("/calapan1/about marks up Coach Iren with her nine listed certifications", async ({
  page,
}) => {
  await page.goto("/calapan1/about");
  const [person] = byType<{
    name: string;
    jobTitle: string;
    worksFor: { "@id": string };
    hasCredential: Array<{ name: string }>;
  }>(await jsonLd(page), "Person");
  expect(person?.name).toBe("Iren San Buenaventura");
  await expect(page.locator("main")).toContainText(person?.jobTitle ?? "—");
  expect(person?.worksFor["@id"]).toMatch(/\/#business$/);
  expect(person?.hasCredential).toHaveLength(9);
  const listed = await page.locator("#certifications h3").allTextContents();
  expect(person?.hasCredential.map((c) => c.name)).toEqual(listed.map((t) => t.trim()));
});

test("a blog post is marked up as a BlogPosting matching the page", async ({ page }) => {
  await page.goto("/blog/kdHl9EbopUVKOpyfAc4e");
  const [post] = byType<{ headline: string; datePublished: string; image: string }>(
    await jsonLd(page),
    "BlogPosting",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(post?.headline ?? "—");
  expect(post?.datePublished).toBe("2026-04-20");
  expect(post?.image).toMatch(/^https?:\/\/.+\.webp$/);
});

test("/llms.txt is plain text with the studio's key facts", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
  const text = await res.text();
  expect(text).toContain("2nd Floor Roxas Drive, Brgy Ilaya, Calapan City");
  expect(text).toContain("0965 944 1194");
  for (const t of ["6:30 AM", "9:00 AM", "4:30 PM", "6:00 PM", "7:30 PM"]) {
    expect(text).toContain(t);
  }
  for (const price of ["₱350", "₱1,800", "₱3,300", "₱5,000", "₱200", "₱500"]) {
    expect(text).toContain(price);
  }
  expect(text).not.toMatch(/account|online|sign[ -]?in|log[ -]?in/i);
});

test("robots.txt allows every crawler except in the parked areas", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/User-Agent: \*/i);
  expect(text).toMatch(/^Allow: \/$/m);
  for (const parked of ["/dashboard/", "/member/", "/login", "/auth/", "/how-it-works"]) {
    expect(text).toContain(`Disallow: ${parked}`);
  }
  expect(text).toMatch(/^Sitemap: https?:\/\/.+\/sitemap\.xml$/m);
  // No crawler-specific blocks.
  expect(text.match(/User-Agent:/gi)).toHaveLength(1);
});
