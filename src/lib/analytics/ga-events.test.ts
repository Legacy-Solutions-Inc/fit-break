import { describe, expect, it } from "vitest";

import { linkEvent } from "./ga-events";

const MESSENGER = "https://m.me/FitBreakPhilippines";

describe("linkEvent — Booking Enquiry", () => {
  it("maps a Messenger link to method messenger with its placement", () => {
    expect(linkEvent({ href: MESSENGER, placement: "hero" })).toEqual({
      event: "booking_enquiry",
      method: "messenger",
      placement: "hero",
    });
  });

  it("maps a tel: link to method phone", () => {
    expect(linkEvent({ href: "tel:+639659441194", placement: "contact" })).toEqual({
      event: "booking_enquiry",
      method: "phone",
      placement: "contact",
    });
  });

  it("maps a mailto: link to the studio address to method email", () => {
    expect(linkEvent({ href: "mailto:calapan1@fitbreak.ph", placement: "footer" })).toEqual({
      event: "booking_enquiry",
      method: "email",
      placement: "footer",
    });
    // Case and a query string don't change the address.
    expect(
      linkEvent({ href: "mailto:Calapan1@FitBreak.ph?subject=Hi", placement: "coach" }),
    ).toMatchObject({ event: "booking_enquiry", method: "email" });
  });

  it("carries the pack name on pricing packs", () => {
    expect(linkEvent({ href: MESSENGER, placement: "pricing-pack", pack: "Starter Pack" })).toEqual(
      {
        event: "booking_enquiry",
        method: "messenger",
        placement: "pricing-pack",
        pack: "Starter Pack",
      },
    );
  });

  it("omits an empty pack and defaults a missing placement to other", () => {
    expect(linkEvent({ href: MESSENGER, placement: null, pack: "" })).toEqual({
      event: "booking_enquiry",
      method: "messenger",
      placement: "other",
    });
    expect(linkEvent({ href: MESSENGER })).toMatchObject({ placement: "other" });
  });

  it("ignores other links", () => {
    expect(linkEvent({ href: "/pricing", placement: "header" })).toBeNull();
    expect(linkEvent({ href: "https://facebook.com/FitBreakPhilippines/" })).toBeNull();
    expect(linkEvent({ href: "https://m.me.example.com/x" })).toBeNull();
    expect(linkEvent({ href: "mailto:someone@example.com", placement: "footer" })).toBeNull();
    expect(linkEvent({ href: "" })).toBeNull();
  });
});

describe("linkEvent — flyer download", () => {
  it("maps the corporate flyer PDF to flyer_download (an ordinary event)", () => {
    expect(
      linkEvent({
        href: "http://localhost:3000/sites/fitbreak/fitbreak-corporate-flyer.pdf",
        placement: "corporate",
      }),
    ).toEqual({ event: "flyer_download", placement: "corporate" });
    expect(linkEvent({ href: "/sites/fitbreak/fitbreak-corporate-flyer.pdf" })).toEqual({
      event: "flyer_download",
      placement: "other",
    });
  });
});
