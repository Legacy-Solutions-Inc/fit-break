import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Google Analytics 4 + Consent Mode (docs/specs/2026-11-05-seo-geo-analytics.md,
// ADR 0010). These check what the page actually does: network requests, the
// consent bar a visitor sees, cookies, stored choice, and the events pushed to
// window.dataLayer — never component internals.
//
// The GA-on block runs only when the server under test was started with a
// test measurement ID, and this process is told so via the same variable:
//   PORT=3133 NEXT_DIST_DIR=.next-ga NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST123456 pnpm dev
//   PLAYWRIGHT_PORT=3133 NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST123456 npx playwright test e2e/analytics.spec.ts

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ANALYTICS = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com/;
const CONSENT_KEY = "fitbreak_analytics_consent";

/** window.dataLayer as plain arrays (gtag pushes `arguments` objects). */
function dataLayer(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).map((entry) =>
      Array.from(entry),
    ),
  );
}

const consentUpdates = (layer: unknown[][]) =>
  layer.filter((e) => e[0] === "consent" && e[1] === "update").map((e) => e[2]);

const consentBar = (page: Page) => page.getByRole("region", { name: "Cookie choice" });

/** Answer the bar so it can't sit over what a test clicks next. */
async function decline(page: Page) {
  await consentBar(page).getByRole("button", { name: "Decline" }).click();
  await expect(consentBar(page)).toHaveCount(0);
}

test.describe("GA off (no measurement ID)", () => {
  test.skip(Boolean(GA_ID), "server under test has a GA measurement ID");

  for (const path of ["/", "/pricing", "/privacy-policy"]) {
    test(`${path}: no Google Analytics request, script, consent bar or CSP host`, async ({
      page,
    }) => {
      const googleRequests: string[] = [];
      page.on("request", (r) => {
        if (GOOGLE_ANALYTICS.test(r.url())) googleRequests.push(r.url());
      });

      const response = await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(googleRequests).toEqual([]);
      expect(await page.locator("#fb-ga-bootstrap").count()).toBe(0);
      expect(await page.evaluate(() => "gtag" in window)).toBe(false);
      await expect(consentBar(page)).toHaveCount(0);
      expect(response?.headers()["content-security-policy"] ?? "").not.toMatch(GOOGLE_ANALYTICS);
    });
  }

  test("privacy policy has no Google Analytics section or cookie control", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: "Google Analytics" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Change cookie choice" })).toHaveCount(0);
  });
});

test.describe("GA on (test measurement ID)", () => {
  test.skip(!GA_ID, "set NEXT_PUBLIC_GA_MEASUREMENT_ID for a server started with a test ID");

  /** Keep the tests offline: Google and Messenger are blocked/stubbed. */
  async function isolate(context: BrowserContext) {
    await context.route(GOOGLE_ANALYTICS, (route) => route.abort());
    await context.route(/^https:\/\/m\.me\//, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>Messenger</title>" }),
    );
  }

  test.beforeEach(async ({ context }) => {
    await isolate(context);
  });

  test("loads gtag.js with Consent Mode denied by default and shows the bar", async ({ page }) => {
    const gtagRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("googletagmanager.com/gtag/js")) gtagRequests.push(r.url());
    });

    const response = await page.goto("/");
    await expect(consentBar(page)).toBeVisible();
    await expect(consentBar(page).getByRole("button", { name: "Accept" })).toBeVisible();
    await expect(consentBar(page).getByRole("button", { name: "Decline" })).toBeVisible();

    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(/script-src [^;]*https:\/\/www\.googletagmanager\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/\*\.google-analytics\.com/);

    const layer = await dataLayer(page);
    expect(layer[0]).toEqual([
      "consent",
      "default",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    ]);
    expect(layer).toContainEqual(["config", GA_ID]);
    expect(consentUpdates(layer)).toEqual([]);
    expect(gtagRequests).toEqual([`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`]);
  });

  test("the consent bar does not cover the assistant button", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const bar = await consentBar(page).boundingBox();
      const assistant = await page
        .getByRole("button", { name: "Open FitBreak Assistant" })
        .boundingBox();
      expect(bar && assistant).toBeTruthy();
      const overlap =
        bar!.x < assistant!.x + assistant!.width &&
        assistant!.x < bar!.x + bar!.width &&
        bar!.y < assistant!.y + assistant!.height &&
        assistant!.y < bar!.y + bar!.height;
      expect(overlap, `${viewport.width}px`).toBe(false);
    }
  });

  test("Decline keeps storage denied, stores the choice and sets no _ga cookie", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await consentBar(page).getByRole("button", { name: "Decline" }).click();
    await expect(consentBar(page)).toHaveCount(0);

    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe("decline");
    const updates = consentUpdates(await dataLayer(page));
    expect(updates.at(-1)).toMatchObject({ analytics_storage: "denied", ad_storage: "denied" });
    expect((await context.cookies()).filter((c) => c.name.startsWith("_ga"))).toEqual([]);
  });

  test("Accept grants analytics storage only; the choice persists across pages", async ({
    page,
  }) => {
    await page.goto("/");
    await consentBar(page).getByRole("button", { name: "Accept" }).click();
    await expect(consentBar(page)).toHaveCount(0);

    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe("accept");
    expect(consentUpdates(await dataLayer(page)).at(-1)).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    // A full page load: the bootstrap applies the stored Accept before config.
    await page.goto("/schedule");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(consentBar(page)).toHaveCount(0);
    const layer = await dataLayer(page);
    const grantedAt = layer.findIndex(
      (e) =>
        e[0] === "consent" &&
        e[1] === "update" &&
        (e[2] as { analytics_storage?: string }).analytics_storage === "granted",
    );
    expect(grantedAt).toBeGreaterThan(0);
    expect(grantedAt).toBeLessThan(layer.findIndex((e) => e[0] === "config"));
  });

  test("Change cookie choice on the privacy policy reopens the bar", async ({ page }) => {
    await page.goto("/privacy-policy");
    await consentBar(page).getByRole("button", { name: "Accept" }).click();
    await expect(consentBar(page)).toHaveCount(0);

    await expect(page.getByRole("heading", { name: "Google Analytics" })).toBeVisible();
    await page.getByRole("button", { name: "Change cookie choice" }).click();

    await expect(consentBar(page)).toBeVisible();
    await expect(consentBar(page).getByRole("button", { name: "Accept" })).toBeFocused();
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBeNull();
    expect(consentUpdates(await dataLayer(page)).at(-1)).toMatchObject({
      analytics_storage: "denied",
    });
  });

  test("a pricing-pack Messenger click records booking_enquiry with the pack", async ({ page }) => {
    await page.goto("/pricing");
    await decline(page);
    const link = page.getByRole("link", { name: "Ask About This Pack" }).first();
    const pack = await link.evaluate((a) => a.closest("[data-pack]")?.getAttribute("data-pack"));
    expect(pack, "pack column carries data-pack").toBeTruthy();

    const popup = page.waitForEvent("popup");
    await link.click();
    await (await popup).close();

    const enquiries = (await dataLayer(page)).filter(
      (e) => e[0] === "event" && e[1] === "booking_enquiry",
    );
    expect(enquiries).toEqual([
      ["event", "booking_enquiry", { method: "messenger", placement: "pricing-pack", pack }],
    ]);
  });

  test("other enquiry channels and ordinary events are recorded", async ({ page }) => {
    await page.goto("/corporate");
    await decline(page);
    // Phone link in the corporate CTA (navigation to tel: is harmless in a test browser).
    await page.evaluate(() =>
      document
        .querySelectorAll('a[href^="tel:"]')
        .forEach((a) => a.addEventListener("click", (e) => e.preventDefault())),
    );
    await page.locator('[data-placement="corporate"] a[href^="tel:"]').first().click();
    const flyer = page.locator('a[href$="fitbreak-corporate-flyer.pdf"]').first();
    await flyer.evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
    await flyer.click();
    await page.getByRole("button", { name: "Open FitBreak Assistant" }).click();
    await page.getByRole("button", { name: "Close FitBreak Assistant" }).click();

    const events = (await dataLayer(page)).filter((e) => e[0] === "event");
    expect(events).toEqual([
      ["event", "booking_enquiry", { method: "phone", placement: "corporate" }],
      ["event", "flyer_download", { placement: "corporate" }],
      ["event", "assistant_open"],
    ]);
  });
});
