import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CONSENT_STORAGE_KEY } from "./ga-consent";
import { buildGaBootstrap, GA_SCRIPT_ORIGIN } from "./ga";

const ID = "G-TEST123456";

type Gtag = { dataLayer?: IArguments[] };

/** Run the bootstrap like the browser would, then return the dataLayer as plain arrays. */
function run(): unknown[][] {
  new Function(buildGaBootstrap(ID))();
  return ((window as unknown as Gtag).dataLayer ?? []).map((args) => Array.from(args));
}

describe("buildGaBootstrap", () => {
  beforeEach(() => {
    delete (window as unknown as Gtag).dataLayer;
    document.head.innerHTML = "";
  });
  afterEach(() => localStorage.clear());

  it("rejects a malformed measurement ID (it is embedded in a script)", () => {
    expect(() => buildGaBootstrap("G-1'); alert(1); //")).toThrow();
  });

  it("sets every Consent Mode default to denied before config", () => {
    const layer = run();
    expect(layer[0]).toEqual([
      "consent",
      "default",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
      },
    ]);
    const configAt = layer.findIndex((a) => a[0] === "config");
    expect(layer[configAt]).toEqual(["config", ID]);
    expect(configAt).toBeGreaterThan(0);
    expect(layer.some((a) => a[0] === "consent" && a[1] === "update")).toBe(false);
  });

  it("applies a stored Accept as a consent update before config", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "accept");
    const layer = run();
    const updateAt = layer.findIndex((a) => a[0] === "consent" && a[1] === "update");
    expect(layer[updateAt]).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    ]);
    expect(updateAt).toBeLessThan(layer.findIndex((a) => a[0] === "config"));
  });

  it("keeps a stored Decline denied (no update)", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "decline");
    expect(run().some((a) => a[0] === "consent" && a[1] === "update")).toBe(false);
  });

  it("then loads gtag.js (not Tag Manager) carrying the running script's nonce", () => {
    run();
    const loader = document.head.querySelector<HTMLScriptElement>("script[src]");
    expect(loader?.src).toBe(`${GA_SCRIPT_ORIGIN}/gtag/js?id=${ID}`);
    expect(loader?.async).toBe(true);
    expect(loader?.src).not.toContain("gtm.js");
  });
});
