// ─────────────────────────────────────────────────────────────────────────────
// /llms.txt (https://llmstxt.org): a plain-text summary of the studio's key
// facts and page links for AI answer engines. Pure: built from the same studio
// data as the pages and the structured data, so it can't contradict them.
// ─────────────────────────────────────────────────────────────────────────────

import { addMinutesToTime, formatPhp, formatTime } from "@/services/fitbreak/catalog";

import type { CorporateInfo, PackageInfo, StudioInfo } from "./structured-data";

export interface LlmsTxtInput {
  studio: StudioInfo;
  packages: readonly PackageInfo[];
  annualFeePhp: number;
  corporate: CorporateInfo;
  /** Key pages to link, in order. */
  pages: ReadonlyArray<{ title: string; path: string; summary: string }>;
  /** The approved definition sentence; omitted until the studio approves it. */
  definition?: string;
}

/** "https://facebook.com/x" → "Facebook". */
function siteName(link: string): string {
  const name = new URL(link).hostname.replace(/^www\./, "").split(".")[0] ?? link;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const days = (d: readonly string[]) => (d.length > 1 ? `${d[0]} to ${d[d.length - 1]}` : d[0]);

function packageLine(pkg: PackageInfo, annualFeePhp: number): string {
  if (pkg.credits === 1) {
    return `- ${pkg.name}: ${formatPhp(pkg.pricePhp)} for one class${pkg.requiresMembership ? "" : ", no membership required"}`;
  }
  const facts = [
    `${formatPhp(pkg.pricePhp)} for ${pkg.credits} classes (${formatPhp(pkg.perClassPhp)} per class)`,
  ];
  if (pkg.validityDays) facts.push(`valid ${pkg.validityDays} days`);
  if (pkg.requiresMembership) facts.push(`plus the ${formatPhp(annualFeePhp)} annual membership`);
  return `- ${pkg.name}: ${facts.join(", ")}`;
}

export function buildLlmsTxt(input: LlmsTxtInput, siteUrl: string): string {
  const { studio, packages, annualFeePhp, corporate, pages, definition } = input;
  const url = (path: string) => new URL(path, siteUrl).toString();
  const classDays = days(studio.classDays);

  const lines = [
    `# ${studio.name}`,
    "",
    `> ${studio.description}`,
    "",
    ...(definition ? [definition, ""] : []),
    "## Studio",
    "",
    `- Address: ${studio.addressDisplay}`,
    `- Phone: ${studio.phoneDisplay}`,
    `- Email: ${studio.email}`,
    `- Messenger: ${studio.messenger}`,
    ...studio.sameAs.map((link) => `- ${siteName(link)}: ${link}`),
    `- Website: ${url("/")}`,
    "",
    "## Class times",
    "",
    `${classDays}, closed Sunday. Each class is ${studio.classMinutes} minutes, led by ${studio.coachName}.`,
    "",
    ...studio.timeSlots.map(
      (t) => `- ${formatTime(t)} to ${formatTime(addMinutesToTime(t, studio.classMinutes))}`,
    ),
    "",
    "## Prices (Philippine peso)",
    "",
    ...packages.map((p) => packageLine(p, annualFeePhp)),
    `- Annual membership fee: ${formatPhp(annualFeePhp)}, required for all packs, non-refundable`,
    `- Corporate Group Program: ${formatPhp(corporate.ratePhp)} per class, per person, for organizations that enroll at least ${corporate.minMembers} women on a ${corporate.eligibleCredits.join("- or ")}-class package`,
    "",
    "## How to book",
    "",
    `1. Message ${studio.name} on Messenger (${studio.messenger}) or call ${studio.phoneDisplay} with your package and the class and time you want.`,
    "2. Pay by GCash or bank transfer (BPI).",
    "3. Send your receipt on Messenger. Your class is confirmed once payment is verified.",
    "",
    "## Payment",
    "",
    `${studio.paymentAccepted.join(" or ")} only; no cash payments.`,
    "",
    "## Pages",
    "",
    ...pages.map((p) => `- [${p.title}](${url(p.path)}): ${p.summary}`),
    "",
  ];
  return lines.join("\n");
}
