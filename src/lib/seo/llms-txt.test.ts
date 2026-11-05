import { describe, expect, it } from "vitest";

import { DEFINITION_SENTENCE, HOME_FAQS } from "@/components/sites/fitbreak/home-faq-content";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import {
  ANNUAL_MEMBERSHIP_FEE_PHP,
  CORPORATE_ELIGIBLE_CREDITS,
  CORPORATE_MIN_MEMBERS,
  CORPORATE_RATE_PHP,
  formatPhp,
  formatTime,
  PACKAGES,
  TIME_SLOTS,
} from "@/services/fitbreak/catalog";

import { buildLlmsTxt, type LlmsTxtInput } from "./llms-txt";

const SITE = "https://fitbreak.ph/";

const input: LlmsTxtInput = {
  studio: STUDIO,
  packages: PACKAGES,
  annualFeePhp: ANNUAL_MEMBERSHIP_FEE_PHP,
  corporate: {
    ratePhp: CORPORATE_RATE_PHP,
    minMembers: CORPORATE_MIN_MEMBERS,
    eligibleCredits: CORPORATE_ELIGIBLE_CREDITS,
  },
  pages: [
    { title: "Pricing", path: "/pricing", summary: "Prices" },
    { title: "Class Schedule", path: "/schedule", summary: "Times" },
  ],
};

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt(input, SITE);

  it("starts with the studio name and the hero's one-line description", () => {
    expect(text.startsWith("# FitBreak\n\n> ")).toBe(true);
    expect(text).toContain(STUDIO.description);
  });

  it("contains the address, phone, email and Messenger", () => {
    expect(text).toContain("2nd Floor Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro");
    expect(text).toContain("0965 944 1194");
    expect(text).toContain("calapan1@fitbreak.ph");
    expect(text).toContain("https://m.me/FitBreakPhilippines");
  });

  it("contains the days and every class time", () => {
    expect(text).toContain("Monday to Saturday");
    for (const t of TIME_SLOTS) expect(text).toContain(formatTime(t));
  });

  it("contains every price: drop-in, packs, corporate rate and annual fee", () => {
    for (const p of PACKAGES) expect(text).toContain(formatPhp(p.pricePhp));
    expect(text).toContain("₱200");
    expect(text).toContain("₱500");
  });

  it("explains the Booking Enquiry and the payment methods", () => {
    expect(text).toMatch(/Messenger/);
    expect(text).toMatch(/GCash/);
    expect(text).toMatch(/bank transfer/i);
    expect(text).toMatch(/receipt/i);
    expect(text).toMatch(/no cash/i);
  });

  it("links key pages with absolute URLs", () => {
    expect(text).toContain("[Pricing](https://fitbreak.ph/pricing)");
    expect(text).toContain("[Class Schedule](https://fitbreak.ph/schedule)");
  });

  it("contains no account or online-booking wording", () => {
    expect(text).not.toMatch(/account|online|sign[ -]?in|log[ -]?in|sign[ -]?up|credits/i);
  });

  it("includes the definition sentence only when given one", () => {
    expect(text).not.toContain(DEFINITION_SENTENCE);
    expect(buildLlmsTxt({ ...input, definition: DEFINITION_SENTENCE }, SITE)).toContain(
      DEFINITION_SENTENCE,
    );
  });
});

describe("homepage FAQ wording", () => {
  it("quotes the catalogue's times and prices", () => {
    const all = [DEFINITION_SENTENCE, ...HOME_FAQS.map((f) => f.a)].join(" ");
    for (const t of TIME_SLOTS) expect(DEFINITION_SENTENCE).toContain(formatTime(t));
    for (const p of PACKAGES) expect(all).toContain(formatPhp(p.pricePhp));
    expect(all).toContain(formatPhp(ANNUAL_MEMBERSHIP_FEE_PHP));
    expect(HOME_FAQS).toHaveLength(6);
  });
});
