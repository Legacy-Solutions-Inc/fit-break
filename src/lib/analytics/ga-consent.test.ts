import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyConsentChoice,
  CONSENT_STORAGE_KEY,
  consentSignals,
  parseConsentChoice,
  readConsentChoice,
  subscribeConsent,
  writeConsentChoice,
} from "./ga-consent";

const DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

describe("consentSignals", () => {
  it("none ⇒ everything denied", () => {
    expect(consentSignals("none")).toEqual(DENIED);
  });

  it("decline ⇒ everything denied", () => {
    expect(consentSignals("decline")).toEqual(DENIED);
  });

  it("accept ⇒ analytics granted, every ad signal still denied", () => {
    expect(consentSignals("accept")).toEqual({ ...DENIED, analytics_storage: "granted" });
  });
});

describe("parseConsentChoice", () => {
  it("reads the two stored choices", () => {
    expect(parseConsentChoice("accept")).toBe("accept");
    expect(parseConsentChoice("decline")).toBe("decline");
  });

  it("treats anything else (missing, empty, tampered) as no choice", () => {
    expect(parseConsentChoice(null)).toBe("none");
    expect(parseConsentChoice("")).toBe("none");
    expect(parseConsentChoice("granted")).toBe("none");
  });
});

describe("stored choice", () => {
  afterEach(() => localStorage.clear());

  it("round-trips accept and decline through localStorage", () => {
    writeConsentChoice("accept");
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("accept");
    expect(readConsentChoice()).toBe("accept");
    writeConsentChoice("decline");
    expect(readConsentChoice()).toBe("decline");
  });

  it("writing none clears the stored choice", () => {
    writeConsentChoice("accept");
    writeConsentChoice("none");
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(readConsentChoice()).toBe("none");
  });

  it("an unavailable storage reads as no choice and never throws", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(readConsentChoice()).toBe("none");
      expect(() => writeConsentChoice("accept")).not.toThrow();
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });
});

describe("applyConsentChoice", () => {
  afterEach(() => {
    localStorage.clear();
    delete window.gtag;
    document.cookie = "_ga=; Max-Age=0; path=/";
    document.cookie = "_ga_ABC=; Max-Age=0; path=/";
    document.cookie = "other=; Max-Age=0; path=/";
  });

  it("stores the choice, updates Consent Mode and notifies subscribers", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    applyConsentChoice("accept");
    expect(readConsentChoice()).toBe("accept");
    expect(gtag).toHaveBeenLastCalledWith("consent", "update", consentSignals("accept"));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    applyConsentChoice("decline");
    expect(gtag).toHaveBeenLastCalledWith("consent", "update", consentSignals("decline"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("decline and withdraw remove Google Analytics cookies, and only those", () => {
    for (const choice of ["decline", "none"] as const) {
      document.cookie = "_ga=GA1.1.1; path=/";
      document.cookie = "_ga_ABC=GS1.1; path=/";
      document.cookie = "other=keep; path=/";
      applyConsentChoice(choice);
      expect(document.cookie).not.toMatch(/_ga/);
      expect(document.cookie).toContain("other=keep");
    }
  });

  it("works before gtag exists (no throw)", () => {
    expect(() => applyConsentChoice("accept")).not.toThrow();
  });
});
