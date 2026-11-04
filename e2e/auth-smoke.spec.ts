import { expect, test } from "@playwright/test";

// FitBreak runs as an Information Site: the Member Area is parked
// (memberAreaEnabled = false in src/config.ts), so account routes go home.

test("FitBreak homepage renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /for every moment you choose yourself/i }),
  ).toBeVisible();
});

for (const path of [
  "/login",
  "/member/dashboard",
  "/how-it-works",
  "/auth/sign-in",
  "/dashboard",
]) {
  test(`parked account route ${path} redirects to the homepage`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
  });
}

test("old fitbreak.ph .html URLs redirect to the cloned pages", async ({ page }) => {
  await page.goto("/schedule.html");
  await expect(page).toHaveURL(/\/schedule$/);
  await page.goto("/club-rules.html");
  await expect(page).toHaveURL(/\/club-rules$/);
});

test("pricing is public and booking goes to Messenger", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Standard Pack").first()).toBeVisible();
  await expect(page.getByText(/want to see our pricing/i)).toHaveCount(0);
  const ask = page.getByRole("link", { name: /ask about this pack/i }).first();
  await expect(ask).toHaveAttribute("href", "https://m.me/FitBreakPhilippines");
});

test("no public page offers sign-in or links to the old site", async ({ page }) => {
  for (const path of ["/", "/pricing", "/schedule", "/blog", "/our-story", "/corporate"]) {
    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.filter((h) => h.includes("fitbreak.ph") && !h.startsWith("mailto:"))).toEqual([]);
    expect(
      hrefs.filter((h) => /^\/(login|member|auth)\b/.test(h)),
      path,
    ).toEqual([]);
  }
});
