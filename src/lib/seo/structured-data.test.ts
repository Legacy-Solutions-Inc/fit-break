import { describe, expect, it } from "vitest";

import { certifications, coach } from "@/components/sites/fitbreak/coach/coach-data";
import { HOME_FAQS } from "@/components/sites/fitbreak/home-faq-content";
import { PRICING_FAQS } from "@/components/sites/fitbreak/pricing-page/pricing-faqs";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import {
  CORPORATE_MIN_MEMBERS,
  CORPORATE_RATE_PHP,
  PACKAGES,
  TIME_SLOTS,
} from "@/services/fitbreak/catalog";
import { BLOG_POSTS } from "@/services/fitbreak/blog-data";

import {
  buildBlogPosting,
  buildBreadcrumbs,
  buildBusiness,
  buildCorporateOffer,
  buildFaqPage,
  buildOffers,
  buildPerson,
  businessId,
  serializeJsonLd,
} from "./structured-data";

const SITE = "https://fitbreak.ph/";

describe("buildBusiness", () => {
  const business = buildBusiness(STUDIO, SITE);

  it("is one SportsActivityLocation with a stable @id", () => {
    expect(business["@context"]).toBe("https://schema.org");
    expect(business["@type"]).toBe("SportsActivityLocation");
    expect(business["@id"]).toBe("https://fitbreak.ph/#business");
    expect(businessId(SITE)).toBe(business["@id"]);
    expect(business.name).toBe("FitBreak");
    expect(business.url).toBe("https://fitbreak.ph/");
  });

  it("uses the catalogue's five time slots, Monday to Saturday, one hour each", () => {
    const hours = business.openingHoursSpecification;
    expect(hours.map((h) => h.opens)).toEqual([...TIME_SLOTS]);
    expect(hours.map((h) => h.closes)).toEqual(["07:30", "10:00", "17:30", "19:00", "20:30"]);
    for (const h of hours) {
      expect(h.dayOfWeek).toEqual([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]);
    }
  });

  it("lists GCash and bank transfer, never cash", () => {
    expect(business.paymentAccepted).toBe("GCash, Bank Transfer");
    expect(business.paymentAccepted).not.toMatch(/\bcash\b/i);
  });

  it("carries the published contact details and address", () => {
    expect(business.telephone).toBe("+639659441194");
    expect(business.email).toBe("calapan1@fitbreak.ph");
    expect(business.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Calapan City",
      postalCode: "5200",
      addressCountry: "PH",
    });
    expect(business.geo).toMatchObject({ "@type": "GeoCoordinates" });
    expect(business.sameAs).toEqual([
      "https://facebook.com/FitBreakPhilippines/",
      "https://instagram.com/FitBreakPhilippines/",
    ]);
    expect(business.logo).toBe(
      "https://fitbreak.ph/sites/fitbreak/images/fitbreak-landscape-logo.png",
    );
    expect(business.image).toMatch(/^https:\/\/fitbreak\.ph\//);
    expect(business.priceRange).toBe("₱350–₱5,000");
  });
});

describe("buildOffers", () => {
  const offers = buildOffers(PACKAGES, SITE);

  it("offers exactly the catalogue packages at their catalogue prices, in pesos", () => {
    expect(offers["@type"]).toBe("OfferCatalog");
    const items = offers.itemListElement;
    expect(items.map((o) => o.name)).toEqual(PACKAGES.map((p) => p.name));
    expect(items.map((o) => o.price)).toEqual(PACKAGES.map((p) => p.pricePhp));
    expect(items.map((o) => o.price)).toEqual([350, 1800, 3300, 5000]);
    for (const o of items) {
      expect(o["@type"]).toBe("Offer");
      expect(o.priceCurrency).toBe("PHP");
      expect(o.url).toBe("https://fitbreak.ph/pricing");
      expect(o.offeredBy).toEqual({ "@id": "https://fitbreak.ph/#business" });
    }
  });
});

describe("buildCorporateOffer", () => {
  it("offers the ₱200 per-class group rate", () => {
    const offer = buildCorporateOffer(
      { ratePhp: CORPORATE_RATE_PHP, minMembers: CORPORATE_MIN_MEMBERS, eligibleCredits: [12, 20] },
      SITE,
    );
    expect(offer["@type"]).toBe("Offer");
    expect(offer.price).toBe(200);
    expect(offer.priceCurrency).toBe("PHP");
    expect(offer.priceSpecification).toMatchObject({
      "@type": "UnitPriceSpecification",
      price: 200,
      priceCurrency: "PHP",
    });
    expect(offer.url).toBe("https://fitbreak.ph/corporate");
    expect(offer.description).toContain("5");
  });
});

describe("buildFaqPage", () => {
  it.each([
    ["pricing", PRICING_FAQS],
    ["homepage", HOME_FAQS],
  ])("equals the visible %s FAQ list it was given", (_name, faqs) => {
    const page = buildFaqPage(faqs);
    expect(page["@type"]).toBe("FAQPage");
    expect(page.mainEntity).toEqual(
      faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    );
  });

  it("has six pricing questions", () => {
    expect(buildFaqPage(PRICING_FAQS).mainEntity).toHaveLength(6);
  });
});

describe("buildPerson", () => {
  it("is Coach Iren, working for the business, with her nine certifications", () => {
    const person = buildPerson({ ...coach, credentials: certifications.map((c) => c.title) }, SITE);
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Iren San Buenaventura");
    expect(person.jobTitle).toBe("FitBreak Owner & Head Coach");
    expect(person.worksFor).toEqual({ "@id": "https://fitbreak.ph/#business" });
    expect(person.url).toBe("https://fitbreak.ph/calapan1/about");
    expect(person.hasCredential).toHaveLength(9);
    expect(person.hasCredential.map((c) => c.name)).toEqual(certifications.map((c) => c.title));
  });
});

describe("buildBlogPosting", () => {
  it("marks up the headline, date, image, author and publisher", () => {
    const post = BLOG_POSTS[0]!;
    const posting = buildBlogPosting(post, STUDIO, SITE);
    expect(posting["@type"]).toBe("BlogPosting");
    expect(posting.headline).toBe(post.title);
    expect(posting.description).toBe(post.excerpt);
    expect(posting.datePublished).toBe(post.publishedAt);
    expect(posting.image).toBe(new URL(post.image, SITE).toString());
    expect(posting.url).toBe(`https://fitbreak.ph/blog/${post.id}`);
    expect(posting.author).toMatchObject({
      "@id": "https://fitbreak.ph/#business",
      name: "FitBreak",
    });
    expect(posting.publisher).toMatchObject({ "@id": "https://fitbreak.ph/#business" });
  });
});

describe("buildBreadcrumbs", () => {
  it("builds absolute fitbreak.ph URLs in order", () => {
    const crumbs = buildBreadcrumbs(
      [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "A post", path: "/blog/abc" },
      ],
      SITE,
    );
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fitbreak.ph/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://fitbreak.ph/blog" },
      { "@type": "ListItem", position: 3, name: "A post", item: "https://fitbreak.ph/blog/abc" },
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so a value can never close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
