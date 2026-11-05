// ─────────────────────────────────────────────────────────────────────────────
// Structured data (schema.org JSON-LD) builders. Pure: (studio data, site URL)
// → plain objects. Pages render these and never hand-write structured data, so
// what search engines and AI answer engines read always equals what the page
// shows (docs/specs/2026-11-05-seo-geo-analytics.md).
// ─────────────────────────────────────────────────────────────────────────────

import { addMinutesToTime, formatPhp } from "@/services/fitbreak/catalog";

const CONTEXT = "https://schema.org";

/** A question and answer as a page shows it. */
export interface Faq {
  q: string;
  a: string;
}

export interface StudioInfo {
  name: string;
  description: string;
  /** Site paths (resolved against the site URL). */
  logo: string;
  image: string;
  /** E.164, e.g. "+639659441194". */
  telephone: string;
  phoneDisplay: string;
  email: string;
  messenger: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  /** The address as one line, as the pages print it. */
  addressDisplay: string;
  geo: { latitude: number; longitude: number };
  coachName: string;
  classDays: readonly string[];
  /** Class start times, 24h "HH:MM". */
  timeSlots: readonly string[];
  classMinutes: number;
  paymentAccepted: readonly string[];
  currenciesAccepted: string;
  priceRange: string;
  sameAs: readonly string[];
}

export interface PackageInfo {
  name: string;
  credits: number;
  pricePhp: number;
  perClassPhp: number;
  validityDays: number | null;
  requiresMembership: boolean;
}

export interface CorporateInfo {
  ratePhp: number;
  minMembers: number;
  eligibleCredits: readonly number[];
}

export interface PersonInfo {
  name: string;
  jobTitle: string;
  /** Site paths. */
  image: string;
  path: string;
  credentials: readonly string[];
}

export interface PostInfo {
  id: string;
  title: string;
  excerpt: string;
  /** YYYY-MM-DD. */
  publishedAt: string;
  /** Site path. */
  image: string;
}

const abs = (path: string, siteUrl: string) => new URL(path, siteUrl).toString();

/** The business record's stable `@id`; every other record refers to it. */
export function businessId(siteUrl: string): string {
  return abs("/#business", siteUrl);
}

const businessRef = (siteUrl: string) => ({ "@id": businessId(siteUrl) });

/** The one FitBreak business record (rendered on every public page). */
export function buildBusiness(studio: StudioInfo, siteUrl: string) {
  return {
    "@context": CONTEXT,
    "@type": "SportsActivityLocation",
    "@id": businessId(siteUrl),
    name: studio.name,
    description: studio.description,
    url: abs("/", siteUrl),
    logo: abs(studio.logo, siteUrl),
    image: abs(studio.image, siteUrl),
    telephone: studio.telephone,
    email: studio.email,
    address: { "@type": "PostalAddress", ...studio.address },
    geo: {
      "@type": "GeoCoordinates",
      latitude: studio.geo.latitude,
      longitude: studio.geo.longitude,
    },
    // One entry per class: Monday–Saturday, each `classMinutes` long.
    openingHoursSpecification: studio.timeSlots.map((opens) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...studio.classDays],
      opens,
      closes: addMinutesToTime(opens, studio.classMinutes),
    })),
    paymentAccepted: studio.paymentAccepted.join(", "),
    currenciesAccepted: studio.currenciesAccepted,
    priceRange: studio.priceRange,
    sameAs: [...studio.sameAs],
  };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "es"}`;

function packageDescription(pkg: PackageInfo): string {
  const parts = [plural(pkg.credits, "class")];
  if (pkg.credits > 1) parts.push(`${formatPhp(pkg.perClassPhp)} per class`);
  if (pkg.validityDays) parts.push(`valid ${pkg.validityDays} days`);
  parts.push(pkg.requiresMembership ? "requires the annual membership" : "no membership required");
  return parts.join(", ");
}

/** The drop-in and class packs as offers in pesos (the pricing page). */
export function buildOffers(packages: readonly PackageInfo[], siteUrl: string) {
  const url = abs("/pricing", siteUrl);
  return {
    "@context": CONTEXT,
    "@type": "OfferCatalog",
    name: "FitBreak class packages",
    url,
    itemListElement: packages.map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      description: packageDescription(pkg),
      price: pkg.pricePhp,
      priceCurrency: "PHP",
      url,
      offeredBy: businessRef(siteUrl),
    })),
  };
}

/** The Corporate Group Program's per-class, per-person rate. */
export function buildCorporateOffer(corporate: CorporateInfo, siteUrl: string) {
  const packs = corporate.eligibleCredits.join("- or ");
  return {
    "@context": CONTEXT,
    "@type": "Offer",
    name: "Corporate Group Program",
    description: `${formatPhp(corporate.ratePhp)} per class, per person, for organizations that enroll at least ${corporate.minMembers} women on a ${packs}-class package.`,
    price: corporate.ratePhp,
    priceCurrency: "PHP",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: corporate.ratePhp,
      priceCurrency: "PHP",
      unitText: "per class, per person",
    },
    url: abs("/corporate", siteUrl),
    offeredBy: businessRef(siteUrl),
  };
}

/** FAQPage from exactly the questions and answers the page shows. */
export function buildFaqPage(faqs: readonly Faq[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** A coach who works for the business, with her listed certifications. */
export function buildPerson(person: PersonInfo, siteUrl: string) {
  const url = abs(person.path, siteUrl);
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": `${url}#person`,
    name: person.name,
    jobTitle: person.jobTitle,
    image: abs(person.image, siteUrl),
    url,
    worksFor: businessRef(siteUrl),
    hasCredential: person.credentials.map((name) => ({
      "@type": "EducationalOccupationalCredential",
      name,
    })),
  };
}

/** A blog post, published (and authored) by the studio. */
export function buildBlogPosting(
  post: PostInfo,
  studio: Pick<StudioInfo, "name" | "logo">,
  siteUrl: string,
) {
  const url = abs(`/blog/${encodeURIComponent(post.id)}`, siteUrl);
  const org = {
    "@type": "Organization",
    "@id": businessId(siteUrl),
    name: studio.name,
    url: abs("/", siteUrl),
  };
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: abs(post.image, siteUrl),
    url,
    mainEntityOfPage: url,
    author: org,
    publisher: { ...org, logo: { "@type": "ImageObject", url: abs(studio.logo, siteUrl) } },
  };
}

/** Breadcrumbs from Home to the current page, as absolute URLs. */
export function buildBreadcrumbs(
  items: ReadonlyArray<{ name: string; path: string }>,
  siteUrl: string,
) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path, siteUrl),
    })),
  };
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
