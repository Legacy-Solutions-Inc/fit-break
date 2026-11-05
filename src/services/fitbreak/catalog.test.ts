import { describe, expect, it } from "vitest";

import {
  CLASS_DAYS,
  CORPORATE_RATE_PHP,
  discountPercent,
  formatPhp,
  getPackage,
  PACKAGES,
} from "./catalog";

describe("catalogue price helpers", () => {
  it("formats pesos the way the pages show them", () => {
    expect(formatPhp(350)).toBe("₱350");
    expect(formatPhp(1800)).toBe("₱1,800");
    expect(formatPhp(5000)).toBe("₱5,000");
  });

  it("derives each pack's discount from the drop-in price (14/21/29%)", () => {
    const dropIn = getPackage("drop-in").perClassPhp;
    const pct = PACKAGES.filter((p) => p.id !== "drop-in").map((p) =>
      discountPercent(p.perClassPhp, dropIn),
    );
    expect(pct).toEqual([14, 21, 29]);
  });

  it("keeps per-class prices consistent with pack totals", () => {
    for (const p of PACKAGES) expect(p.perClassPhp * p.credits).toBe(p.pricePhp);
  });

  it("publishes the corporate rate and the six class days", () => {
    expect(CORPORATE_RATE_PHP).toBe(200);
    expect(CLASS_DAYS).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
  });
});
