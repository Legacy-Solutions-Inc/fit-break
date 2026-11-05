import { expect, test } from "@playwright/test";

import { PUBLIC_PAGES } from "./public-pages";

// Non-fact messages (docs/specs/2026-11-05-remove-non-fact-messages.md): every
// message a visitor meets is a Studio Fact, an honest description of the site,
// or plain navigation. These checks fail if a removed message comes back.

/** Section labels invented in the redesign — never written by the studio. */
const INVENTED_LABELS = [
  "Why we exist",
  "The studio, in motion",
  "Six formats, every day",
  "Packs & prices",
  "The FitBreak letter",
  "Journal",
  "Timetable",
  "Side by side",
];

/** Phrases that are contested, invented, or describe features that don't exist. */
const NON_FACT_PHRASES = [
  "4 classes a day",
  "4 sessions daily",
  "sound on",
  "support@fitbreak.ph",
  "live availability",
  "Thanks for subscribing",
];

for (const path of PUBLIC_PAGES) {
  test(`${path} shows no invented labels or non-fact messages`, async ({ page }) => {
    await page.goto(path);
    for (const label of INVENTED_LABELS) {
      await expect(page.getByText(label, { exact: true }), label).toHaveCount(0);
    }
    const text = (await page.locator("body").textContent()) ?? "";
    for (const phrase of NON_FACT_PHRASES) expect(text, phrase).not.toContain(phrase);
  });
}

test("no newsletter sign-up is offered while sign-ups go nowhere", async ({ page }) => {
  for (const path of ["/", "/blog"]) {
    await page.goto(path);
    await expect(page.getByRole("textbox", { name: "Email address" }), path).toHaveCount(0);
  }
});

test("search descriptions describe the real booking and schedule", async ({ page }) => {
  for (const path of ["/", "/schedule"]) {
    await page.goto(path);
    const descriptions = await page
      .locator(
        'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
      )
      .evaluateAll((els) => els.map((el) => el.getAttribute("content") ?? ""));
    expect(descriptions.length, path).toBeGreaterThan(0);
    for (const d of descriptions) {
      expect(d, path).not.toMatch(/online/i);
      expect(d, path).not.toMatch(/4 sessions/i);
    }
  }
});

test("search-engine data matches the payment methods and class times on the page", async ({
  page,
}) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw ?? "{}") as {
    paymentAccepted?: string;
    openingHoursSpecification?: Array<{ opens: string; closes: string }>;
  };
  // "GCash" is fine; cash as a payment method is not.
  expect(data.paymentAccepted).not.toMatch(/\bcash\b/i);
  expect(data.openingHoursSpecification?.map((h) => h.opens)).toEqual([
    "06:30",
    "09:00",
    "16:30",
    "18:00",
    "19:30",
  ]);
});

test.describe("FitBreak Assistant", () => {
  test("a failed reply points to the studio's published contacts", async ({ page, context }) => {
    await context.route("**/api/chatbot", (route) => route.abort());
    await page.goto("/");
    await page.getByRole("button", { name: "Open FitBreak Assistant" }).click();
    const chat = page.getByRole("dialog", { name: "FitBreak Assistant" });
    await chat.getByRole("textbox", { name: "Message" }).fill("Hello");
    await chat.getByRole("button", { name: "Send message" }).click();
    await expect(chat).toContainText("calapan1@fitbreak.ph");
    await expect(chat).toContainText("0965 944 1194");
    await expect(chat).not.toContainText("support@fitbreak.ph");
  });

  test("schedule answers send visitors to the timetable, not live availability", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open FitBreak Assistant" }).click();
    const chat = page.getByRole("dialog", { name: "FitBreak Assistant" });
    await chat.getByRole("textbox", { name: "Message" }).fill("What time are your classes?");
    await chat.getByRole("button", { name: "Send message" }).click();
    await expect(chat).toContainText("7:30 PM");
    await expect(chat).not.toContainText(/live availability/i);
  });
});
