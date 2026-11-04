import { devices, expect, test, type Page } from "@playwright/test";

// Motion redesign (docs/specs/2026-11-04-motion-redesign.md). These tests check
// what a visitor sees in each motion mode — never animation internals:
//   full    — desktop, pinned scroll scenes
//   compact — phone, nothing pins, scenes play once
//   calm    — prefers-reduced-motion: no pins, no split text, no backdrop loop

const HOME_HEADING = /for every moment you choose yourself/i;

/** Key content that must never be left invisible once scrolled past. */
const KEY_CONTENT =
  "main h1, main h2, main h3, [data-price-card], [data-program-card], [data-about-stat], [data-about-photo]";

/** Elements matching `selector` that are hidden (opacity ≈ 0 or visibility hidden). */
async function invisible(page: Page, selector = KEY_CONTENT) {
  return page.evaluate((sel) => {
    const hidden: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (!el.getClientRects().length) continue; // display: none (e.g. lg-only)
      let opacity = 1;
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        opacity *= Number(getComputedStyle(n).opacity);
      }
      if (opacity < 0.99 || getComputedStyle(el).visibility === "hidden") {
        hidden.push(`${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 40)}"`);
      }
    }
    return hidden;
  }, selector);
}

/** Scroll the whole page top to bottom in steps, letting scenes play. */
async function scrollThrough(page: Page, { wheel }: { wheel: boolean }) {
  for (let i = 0; i < 80; i++) {
    const atEnd = await page.evaluate(
      () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
    );
    if (atEnd) break;
    if (wheel) await page.mouse.wheel(0, 400);
    else await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500); // let the last reveals settle
}

/** Scroll up through the page too, so anything revealed only on entry is shown. */
async function scrollBackUp(page: Page) {
  for (let i = 0; i < 80 && (await page.evaluate(() => window.scrollY)) > 0; i++) {
    await page.evaluate(() => window.scrollBy({ top: -500, behavior: "instant" }));
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
}

const pinCount = (page: Page) => page.locator(".pin-spacer").count();

test.describe("full (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("homepage scenes pin while scrolling and leave nothing invisible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: HOME_HEADING })).toBeVisible();
    await page.mouse.move(720, 450);

    // Video scene: once its top reaches the viewport top it stays put (pinned).
    const stage = page.locator("[data-video-stage]");
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-video-stage]")!;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    });
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(400);
    expect(Math.abs((await stage.boundingBox())!.y)).toBeLessThan(2);

    // Programs scene: same.
    const programs = page.locator("[data-programs-stage]");
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-programs-stage]")!;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    });
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(400);
    expect(Math.abs((await programs.boundingBox())!.y)).toBeLessThan(2);
    expect(await pinCount(page)).toBe(2);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await scrollThrough(page, { wheel: true });
    // Checked at the bottom: scrolling back up would rewind the Programs track,
    // correctly parking its last cards (dimmed) off-screen to the right again.
    // The video heading is meant to fall back while the video fills the screen.
    expect((await invisible(page)).filter((el) => !el.includes("See FitBreak in Action"))).toEqual(
      [],
    );
    await scrollBackUp(page);
    await expect(page.getByRole("heading", { name: "See FitBreak in Action" })).toBeVisible();
    expect(await invisible(page, "[data-video-heading] h2")).toEqual([]);
  });

  test("video scene plays the small silent loop; play opens the full video", async ({ page }) => {
    await page.goto("/");
    const loop = page.locator("video[data-intro-loop]");
    await expect(loop).toHaveAttribute("src", /intro-loop\.mp4$/);
    await expect(loop).toHaveJSProperty("muted", true);

    await page.locator("[data-video-stage]").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Play video" }).click();

    await expect(loop).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pause video" })).toBeAttached();
    const full = page.locator("video:not([data-intro-loop])");
    await expect(full).toHaveAttribute("src", /intro-compressed\.mp4$/);
    await expect(full).toHaveJSProperty("muted", false);
  });

  test("header slims on scroll and the Message Us nudge stops once clicked", async ({
    page,
    context,
  }) => {
    await context.route("https://m.me/**", (route) => route.abort());
    await page.goto("/pricing");
    const header = page.locator("header");
    await expect(header).not.toHaveAttribute("data-scrolled");
    await page.mouse.wheel(0, 300);
    await expect(header).toHaveAttribute("data-scrolled", "true");

    const messageUs = header.getByRole("link", { name: "Message Us", exact: true });
    await expect(messageUs).toHaveAttribute("data-nudge", "true");
    const popup = page.waitForEvent("popup");
    await messageUs.click();
    await (await popup).close();
    await expect(messageUs).not.toHaveAttribute("data-nudge");

    // Remembered for the rest of the session.
    await page.goto("/schedule");
    await expect(
      page.locator("header").getByRole("link", { name: "Message Us", exact: true }),
    ).not.toHaveAttribute("data-nudge");
  });

  test("moving between pages keeps the header and shows the new page", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main h1").first()).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("heading", { name: HOME_HEADING })).toBeVisible();
  });

  test("other pages do not load the homepage animation code", async ({ page }) => {
    const scripts: Promise<string>[] = [];
    page.on("response", (res) => {
      if (res.request().resourceType() === "script") scripts.push(res.text().catch(() => ""));
    });
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    const bodies = await Promise.all(scripts);
    expect(bodies.some((b) => b.includes("ScrollTrigger"))).toBe(false);
  });

  for (const path of ["/", "/pricing", "/schedule", "/our-story", "/blog", "/corporate"]) {
    test(`${path} loads without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await scrollThrough(page, { wheel: true });
      expect(errors).toEqual([]);
    });
  }
});

test.describe("compact (phone)", () => {
  // Pixel 7 = Chromium; drop the browser-type key so it can be used per group.
  const { defaultBrowserType: _browser, ...pixel } = devices["Pixel 7"];
  test.use(pixel);

  test("nothing pins and all content ends up visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: HOME_HEADING })).toBeVisible();
    await scrollThrough(page, { wheel: false });
    expect(await pinCount(page)).toBe(0);
    await expect(page.locator("[data-stage]")).toHaveCount(0);
    await scrollBackUp(page);
    expect(await invisible(page)).toEqual([]);
    for (const card of await page.locator("[data-program-card] h3").all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeInViewport();
    }
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page, { wheel: false });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("calm (reduced motion)", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: { width: 1440, height: 900 } });

  test("no pinning, whole headline, still photo instead of the loop", async ({ page }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 1, name: HOME_HEADING });
    await expect(title).toBeVisible();
    // Not split into word fragments.
    await expect(title.locator("[aria-hidden]")).toHaveCount(0);
    await expect(page.locator("video[data-intro-loop]")).toHaveCount(0);

    await scrollThrough(page, { wheel: true });
    expect(await pinCount(page)).toBe(0);
    await expect(page.locator("[data-stage]")).toHaveCount(0);
    await scrollBackUp(page);
    expect(await invisible(page)).toEqual([]);
  });

  test("the Message Us button does not nudge", async ({ page }) => {
    await page.goto("/");
    const messageUs = page.locator("header").getByRole("link", { name: "Message Us", exact: true });
    const animation = await messageUs.evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });
});
