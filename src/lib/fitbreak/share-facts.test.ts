import { describe, expect, it } from "vitest";

import {
  CLASS_DAYS,
  CLASS_MINUTES,
  CORPORATE_RATE_PHP,
  PACKAGES,
  TIME_SLOTS,
  type ClassPackage,
} from "@/services/fitbreak/catalog";

import {
  blogPostShareCard,
  coachFact,
  corporateFact,
  pricingFact,
  scheduleFact,
  SHARE_CARDS,
  shareImageAlt,
  titleFontSize,
  type SharePage,
} from "./share-facts";

describe("share cards", () => {
  it("home: women-only, in Calapan City, over the hero photo", () => {
    expect(SHARE_CARDS.home).toMatchObject({
      title: "FitBreak: For Every Moment You Choose Yourself",
      accent: "Choose Yourself",
      fact: "Women-only · Calapan City",
      imagePath: "/sites/fitbreak/images/fitbreak12.webp",
    });
  });

  it("pricing: drop-in and the cheapest pack, from the catalogue", () => {
    expect(SHARE_CARDS.pricing.title).toBe("Membership & Pricing");
    expect(SHARE_CARDS.pricing.fact).toBe("Drop-in ₱350 · packs from ₱1,800");
  });

  it("schedule: Monday to Saturday, first class start to last class end", () => {
    expect(SHARE_CARDS.schedule.title).toBe("Class Schedule");
    expect(SHARE_CARDS.schedule.fact).toBe("Mon–Sat · 6:30 AM–8:30 PM");
  });

  it("corporate: the per-class corporate rate", () => {
    expect(SHARE_CARDS.corporate.title).toBe("Stronger Women. Healthier Teams.");
    expect(SHARE_CARDS.corporate.fact).toBe("₱200 a class");
  });

  it("coach: her name and role, over her portrait", () => {
    expect(SHARE_CARDS.coach).toMatchObject({
      title: "Meet Coach Iren",
      fact: "Iren San Buenaventura · Owner & Head Coach",
      imagePath: "/sites/fitbreak/images/iren_new.jpg",
    });
  });

  it.each<[SharePage, string]>([
    ["ourStory", "Our Story"],
    ["fitbreakers", "Who Are the FitBreakers?"],
    ["clubRules", "Club House Rules"],
    ["blog", "FitBreak Blog"],
    ["privacy", "Privacy Policy"],
    ["terms", "Terms of Service"],
  ])("%s: title only, no fact", (page, title) => {
    expect(SHARE_CARDS[page].title).toBe(title);
    expect(SHARE_CARDS[page].fact).toBeUndefined();
  });

  it("gives every page at most one fact and only local image paths", () => {
    for (const card of Object.values(SHARE_CARDS)) {
      expect(card.title.length).toBeGreaterThan(0);
      if (card.accent) expect(card.title.endsWith(card.accent)).toBe(true);
      if (card.imagePath) expect(card.imagePath).toMatch(/^\/sites\/fitbreak\/[\w/.-]+$/);
    }
  });
});

describe("fact builders read the catalogue, not literals", () => {
  const pack = (id: ClassPackage["id"], pricePhp: number): ClassPackage => ({
    ...PACKAGES[0]!,
    id,
    pricePhp,
    requiresMembership: id !== "drop-in",
  });

  it("pricingFact follows the drop-in price and the cheapest pack", () => {
    expect(pricingFact(PACKAGES)).toBe("Drop-in ₱350 · packs from ₱1,800");
    expect(pricingFact([pack("power", 12000), pack("drop-in", 400), pack("starter", 2100)])).toBe(
      "Drop-in ₱400 · packs from ₱2,100",
    );
  });

  it("scheduleFact spans the class days and first start to last class end", () => {
    expect(scheduleFact(CLASS_DAYS, TIME_SLOTS, CLASS_MINUTES)).toBe("Mon–Sat · 6:30 AM–8:30 PM");
    expect(scheduleFact(["Tuesday", "Thursday"], ["07:00", "12:15"], 45)).toBe(
      "Tue–Thu · 7:00 AM–1:00 PM",
    );
  });

  it("corporateFact prints the catalogue's corporate rate", () => {
    expect(corporateFact(CORPORATE_RATE_PHP)).toBe("₱200 a class");
    expect(corporateFact(1250)).toBe("₱1,250 a class");
  });

  it("coachFact names the coach and her role without the brand prefix", () => {
    expect(
      coachFact({ name: "Iren San Buenaventura", jobTitle: "FitBreak Owner & Head Coach" }),
    ).toBe("Iren San Buenaventura · Owner & Head Coach");
  });
});

describe("blogPostShareCard", () => {
  it("uses the post's own title and cover image, with no fact", () => {
    const card = blogPostShareCard({
      title: "Stay Pumped at FitBreak",
      image: "/sites/fitbreak/blog/abc.webp",
    });
    expect(card).toEqual({
      title: "Stay Pumped at FitBreak",
      imagePath: "/sites/fitbreak/blog/abc.webp",
    });
  });

  it("drops a cover image that is not a local FitBreak asset", () => {
    const card = blogPostShareCard({ title: "Post", image: "https://example.com/x.webp" });
    expect(card.imagePath).toBeUndefined();
  });
});

describe("shareImageAlt", () => {
  it("reads as the title then the fact", () => {
    expect(shareImageAlt(SHARE_CARDS.pricing)).toBe(
      "FitBreak — Membership & Pricing. Drop-in ₱350 · packs from ₱1,800",
    );
    expect(shareImageAlt(SHARE_CARDS.terms)).toBe("FitBreak — Terms of Service");
    // No doubled brand when the title already starts with it.
    expect(shareImageAlt(SHARE_CARDS.blog)).toBe("FitBreak Blog");
    expect(shareImageAlt(SHARE_CARDS.home)).toBe(
      "FitBreak: For Every Moment You Choose Yourself. Women-only · Calapan City",
    );
    expect(shareImageAlt(SHARE_CARDS.corporate)).toBe(
      "FitBreak — Stronger Women. Healthier Teams. ₱200 a class",
    );
  });
});

describe("titleFontSize", () => {
  it("sets short titles large and long titles smaller", () => {
    const short = titleFontSize("Our Story", 590, 360);
    const long = titleFontSize("FitBreak: For Every Moment You Choose Yourself", 590, 360);
    expect(short).toBeGreaterThan(long);
  });

  it("gives every page title a size from the display scale", () => {
    for (const card of Object.values(SHARE_CARDS)) {
      const size = titleFontSize(card.title, 590, 300);
      expect(size).toBeGreaterThanOrEqual(48);
      expect(size).toBeLessThanOrEqual(150);
    }
  });

  it("shrinks as the box gets shorter", () => {
    const title = "Stronger Women. Healthier Teams.";
    expect(titleFontSize(title, 590, 200)).toBeLessThan(titleFontSize(title, 590, 400));
  });

  it("falls back to the smallest size for a title that cannot fit", () => {
    expect(titleFontSize("word ".repeat(80).trim(), 400, 100)).toBe(48);
  });
});
