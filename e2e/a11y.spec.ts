import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { PUBLIC_PAGES } from "./public-pages";

// Gate accessibility at the "serious"/"critical" impact levels on the public,
// shadcn/ui-built pages. Lower-impact findings are not failed here (they'd be a
// separate, dedicated a11y pass), but serious/critical regressions break CI.
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

// The homepage used to exempt colour-contrast rules as debt inherited from the
// 1:1 clone. The editorial redesign (ADR 0009) fixed the palette, so every rule
// now gates every page.

/**
 * Wait for entrance animations (the CSS page fade-in and the homepage hero
 * intro) to finish, so axe measures contrast on settled text rather than text
 * caught mid-fade. Infinite loops (the "Message Us" nudge) are ignored.
 */
async function entrancesSettled(page: Page) {
  await page.waitForFunction(() => {
    const cssDone = document
      .getAnimations()
      .every((a) => a.effect?.getTiming().iterations === Infinity || a.playState !== "running");
    const heroDone = Array.from(
      document.querySelectorAll<HTMLElement>("[data-hero-title], [data-hero-in]"),
    ).every((el) => getComputedStyle(el).opacity === "1");
    return cssDone && heroDone;
  });
}

// Run with motion as most visitors get it and in calm (reduced-motion) mode.
for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const path of PUBLIC_PAGES) {
    test(`no serious or critical accessibility violations on ${path} (${reducedMotion})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto(path);
      await entrancesSettled(page);

      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ""));

      // Surface the offending rule ids + node counts in the failure message.
      const summary = blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
      expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
    });
  }
}
