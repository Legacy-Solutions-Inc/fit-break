import { expect, test } from "@playwright/test";

test("FitBreak homepage renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /for every moment you choose yourself/i }),
  ).toBeVisible();
});

test("dashboard redirects unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
});

test("FitBreak member pages redirect guests to /login", async ({ page }) => {
  await page.goto("/member/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("old fitbreak.ph .html URLs redirect to the cloned pages", async ({ page }) => {
  await page.goto("/schedule.html");
  await expect(page).toHaveURL(/\/schedule$/);
  await page.goto("/club-rules.html");
  await expect(page).toHaveURL(/\/club-rules$/);
});

test("the homepage never links to the old fitbreak.ph site", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator("a[href]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(hrefs.filter((h) => h.includes("fitbreak.ph") && !h.startsWith("mailto:"))).toEqual([]);
});
