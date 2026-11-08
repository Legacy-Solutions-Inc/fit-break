import Image from "next/image";
import Link from "next/link";

import { memberAreaEnabled } from "@/config";
import { cn } from "@/lib/utils";
import {
  ANNUAL_MEMBERSHIP_FEE_PHP,
  discountPercent,
  formatPhp,
  getPackage,
  PACKAGES,
  type ClassPackage,
} from "@/services/fitbreak/catalog";

import { SectionHead, wrap } from "../editorial";
import { FaqSection } from "../faq-section";
import { FacebookIcon, Icon, SolidCheck } from "../icons";
import { asset, contact, routes } from "../links";
import { CorporateBlock, DropInLine, PackColumns, packs } from "../pack-pricing";
import { SolidX } from "./icons";
import { PRICING_FAQS } from "./pricing-faqs";

/**
 * Package purchase → the local payments page (source: `/checkout.html?package=<id>`),
 * or a Messenger Booking Enquiry while the Member Area is parked.
 */
function checkoutHref(id: ClassPackage["id"]): string {
  if (!memberAreaEnabled) return contact.messenger;
  return `${routes.member.payments}?package=${encodeURIComponent(id)}`;
}

/** Member Area only (guests never see it while the Member Area is parked). */
function SignInRequired() {
  return (
    <div className="mb-8 rounded-2xl bg-white p-12 text-center shadow-lg">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
          <Icon name="lock" className="h-10 w-10 text-brand-500" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Want to See Our Pricing?</h2>
        <p className="mb-6 text-gray-600">
          Sign in to your account or follow us on Facebook for pricing, promos, and updates!
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={routes.login}
            className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
          >
            Sign In / Create Account
          </Link>
          <a
            href={contact.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
          >
            <FacebookIcon className="mr-2 h-5 w-5" />
            Follow on Facebook
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          It only takes a minute to create your free account!
        </p>
      </div>
    </div>
  );
}

const membershipPerks = [
  "Access to member-only class packs",
  "Invitations to special FitBreak events & workshops",
  "Discounts on FitBreak activewear & merchandise",
];

interface PackCard {
  id: ClassPackage["id"];
  variant: "plain" | "popular" | "best";
  badge: string;
  title: string;
  tagline: string;
  price: string;
  perClass: string;
  features: ReadonlyArray<{ text: string; included: boolean }>;
  cta: string;
  note: string;
}

/** Per-pack wording the catalogue doesn't carry. */
const cardCopy: Record<
  ClassPackage["id"],
  Pick<PackCard, "variant" | "tagline" | "cta"> & { badge?: string; note?: string }
> = {
  "drop-in": {
    variant: "plain",
    badge: "NO MEMBERSHIP NEEDED",
    tagline: "Try a class before committing",
    cta: "Book Drop-In",
    note: "Limited to 3 drop-ins, then choose a package",
  },
  starter: { variant: "plain", tagline: "Perfect for beginners", cta: "Choose Pack" },
  standard: { variant: "popular", tagline: "For regular gym-goers", cta: "Choose Pack" },
  power: { variant: "best", tagline: "For fitness enthusiasts", cta: "Choose Pack" },
};

const dropInPhp = getPackage("drop-in").perClassPhp;

/** Prices, classes, validity and booking window come from the studio catalogue. */
const packCards: readonly PackCard[] = PACKAGES.map((pkg) => {
  const copy = cardCopy[pkg.id];
  const isDropIn = pkg.id === "drop-in";
  return {
    id: pkg.id,
    variant: copy.variant,
    badge: copy.badge ?? `${discountPercent(pkg.perClassPhp, dropInPhp)}% OFF`,
    title: pkg.name,
    tagline: copy.tagline,
    price: formatPhp(pkg.pricePhp),
    perClass: isDropIn ? "per class" : `${formatPhp(pkg.perClassPhp)} per class`,
    features: isDropIn
      ? [
          { text: `${pkg.credits} Class Credit`, included: true },
          { text: "All class types", included: true },
          { text: "Next-day booking only", included: false },
        ]
      : [
          { text: `${pkg.credits} Class Credits`, included: true },
          { text: `Valid ${pkg.validityDays} days`, included: true },
          { text: `${pkg.advanceBookingDays}-day advance booking`, included: true },
          { text: "All class types", included: true },
        ],
    cta: copy.cta,
    note: copy.note ?? `Requires ${formatPhp(ANNUAL_MEMBERSHIP_FEE_PHP)} annual membership`,
  };
});

const dropIn = packCards[0]!;
/** Pack facts the shared columns don't carry, keyed by the shared pack name. */
const packExtras = new Map(packCards.slice(1).map((c) => [c.title, c]));

/**
 * Member Area only: the purchasable cards that link to the payments page. The
 * public site uses the shared homepage columns instead (`PackColumns`).
 */
function PackageCard({ pack }: { pack: PackCard }) {
  const best = pack.variant === "best";
  const isDropIn = pack.id === "drop-in";
  return (
    <div
      className={cn(
        "fb-lift rounded-2xl p-8 transition-all",
        best
          ? "relative bg-linear-to-br from-brand-500 to-brand-600 text-white shadow-xl hover:shadow-2xl"
          : "bg-white shadow-lg hover:shadow-xl",
        pack.variant === "popular" && "relative border-2 border-brand-500",
      )}
    >
      {pack.variant === "popular" && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-sm font-semibold text-white">
          Most Popular
        </div>
      )}
      {best && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-gray-900">
          Best Value
        </div>
      )}

      <div className="mb-6 text-center">
        <span
          className={cn(
            "mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold",
            best
              ? "bg-white/20 text-white"
              : isDropIn
                ? "bg-gray-100 text-gray-600"
                : "bg-brand-100 text-brand-700",
          )}
        >
          {pack.badge}
        </span>
        <h3 className={cn("mb-2 text-2xl font-bold", !best && "text-gray-900")}>{pack.title}</h3>
        <p className={cn("text-sm", best ? "text-brand-100" : "text-gray-600")}>{pack.tagline}</p>
      </div>

      <div className="mb-6 text-center">
        <span className={cn("text-5xl font-bold", !best && "text-brand-500")}>{pack.price}</span>
        <p className={cn("mt-2", best ? "text-brand-100" : "text-gray-600")}>{pack.perClass}</p>
      </div>

      <ul className="mb-8 space-y-3">
        {pack.features.map((f) => (
          <li
            key={f.text}
            className={cn(
              "flex items-center",
              !best && (f.included ? "text-gray-700" : "text-gray-500"),
            )}
          >
            {f.included ? (
              <SolidCheck
                className={cn("mr-2 h-5 w-5", best ? "text-yellow-300" : "text-green-500")}
              />
            ) : (
              <SolidX className="mr-2 h-5 w-5 text-gray-300" />
            )}
            {f.text}
          </li>
        ))}
      </ul>

      <Link
        href={checkoutHref(pack.id)}
        className={cn(
          "block w-full rounded-full px-6 py-3 text-center font-semibold transition-all",
          isDropIn
            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
            : best
              ? "bg-white text-brand-600 shadow-lg hover:bg-brand-50"
              : "bg-brand-500 text-white shadow-lg hover:bg-brand-600",
        )}
      >
        {pack.cta}
      </Link>
      <p
        className={cn(
          "mt-3 text-center text-xs",
          isDropIn ? "font-medium text-amber-600" : best ? "text-brand-100" : "text-gray-500",
        )}
      >
        {pack.note}
      </p>
    </div>
  );
}

/** Small crimson dash that leads ruled list items. */
function Dash() {
  return (
    <span className="text-crimson" aria-hidden="true">
      —
    </span>
  );
}

/** Drop-In facts beyond the shared line, as one ruled run of text. */
function DropInExtras() {
  const facts = [
    dropIn.tagline,
    ...dropIn.features.filter((f) => f.included).map((f) => f.text),
    dropIn.note,
  ];
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-2 border-b border-ink/15 py-4 text-sm text-mute">
      {facts.map((f) => (
        <li key={f} className="flex gap-3">
          <Dash />
          {f}
        </li>
      ))}
    </ul>
  );
}

/** Per-pack facts the shared columns lack, aligned under each column. */
function PackNotes() {
  return (
    <div className="grid border-b border-ink/20 lg:grid-cols-3 lg:divide-x lg:divide-ink/20 lg:border-x">
      {packs.map((p) => {
        const extra = packExtras.get(p.name);
        if (!extra) return null;
        const facts = [
          ...extra.features.filter((f) => f.text === "All class types").map((f) => f.text),
          extra.note,
        ];
        return (
          <div
            key={p.name}
            data-reveal
            className="border-t border-ink/20 px-0 py-6 first:border-t-0 sm:px-7 lg:border-t-0 lg:px-10"
          >
            <p className="fb-label mb-2 text-mute lg:sr-only">{p.name}</p>
            <p className="font-semibold">{extra.tagline}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-mute">
              {facts.map((f) => (
                <li key={f} className="flex gap-3">
                  <Dash />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

type Cell = string | boolean;

type Row = readonly [Cell, Cell, Cell, Cell];
/** One cell per package, in catalogue order (drop-in, starter, standard, power). */
const perPackage = (cell: (pkg: ClassPackage) => Cell) => PACKAGES.map(cell) as unknown as Row;

const comparison: ReadonlyArray<{ feature: string; cells: Row }> = [
  { feature: "Price", cells: perPackage((p) => formatPhp(p.pricePhp)) },
  { feature: "Classes", cells: perPackage((p) => String(p.credits)) },
  { feature: "Cost per Class", cells: perPackage((p) => formatPhp(p.perClassPhp)) },
  // Copied verbatim from the source table (the Starter card itself says 30 days);
  // the owner chose to leave this for now (fact sheet).
  { feature: "Validity", cells: ["—", "15 days", "30 days", "45 days"] },
  {
    feature: "Advance Booking",
    cells: perPackage((p) =>
      p.id === "drop-in" ? "Next day only" : `${p.advanceBookingDays} days`,
    ),
  },
  { feature: "Annual Membership", cells: perPackage((p) => p.requiresMembership) },
];

const columns = ["Guest Drop-In", "Starter", "Standard", "Power"] as const;
/** Standard is the one highlighted pack, here as on the columns above. */
const featuredCol = 2;

function ComparisonTable() {
  return (
    <section className="border-t border-rule py-20 lg:py-32">
      <div className={wrap}>
        <SectionHead title="Package Comparison" className="mb-12 lg:mb-16" />
        <div
          data-reveal
          role="region"
          aria-label="Package comparison"
          tabIndex={0}
          className="-mx-5 overflow-x-auto px-5 focus-visible:outline-2 focus-visible:outline-crimson sm:mx-0 sm:px-0"
        >
          <table className="w-full min-w-160 border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="fb-label py-4 pr-4 text-mute">
                  Feature
                </th>
                {columns.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={cn(
                      "fb-display px-4 py-4 text-right text-2xl",
                      i === featuredCol && "bg-ink text-paper",
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-ink/15">
                  <th scope="row" className="py-4 pr-4 font-normal text-mute">
                    {row.feature}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        "fb-num px-4 py-4 text-right font-semibold",
                        i === featuredCol && "bg-ink text-paper",
                      )}
                    >
                      {typeof cell === "string" ? cell : cell ? "Required" : "Not required"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const gcashSteps = [
  "Send payment to our GCash number",
  "Take a screenshot of your payment confirmation",
  memberAreaEnabled
    ? "Upload proof of payment in your account"
    : "Send your receipt to us on Messenger",
  memberAreaEnabled
    ? "Credits will be added after verification"
    : "We'll confirm your classes once your payment is verified",
];

function HowToPay() {
  return (
    <section className="fb-grain bg-ink py-20 text-paper lg:py-32">
      <div className={cn(wrap, "relative z-2")}>
        <SectionHead
          tone="dark"
          label="Payment"
          title="How to Pay"
          aside={
            <p>
              Pay via{" "}
              <strong className="font-semibold text-paper">GCash or bank transfer only</strong> — no
              cash payments accepted.
            </p>
          }
          className="mb-14 lg:mb-20"
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div data-reveal className="lg:col-span-6">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-paper pb-4">
              <h3 className="fb-display text-[clamp(2.05rem,3.6vw,2.9rem)]">GCash</h3>
              <p className="fb-label text-paper/70">Quick mobile payment</p>
            </div>
            <ol className="divide-y divide-paper/15">
              {gcashSteps.map((step, i) => (
                <li key={step} className="flex gap-6 py-5 text-lg">
                  <span className="fb-display fb-num w-10 flex-none text-3xl text-paper/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="lg:col-span-5 lg:col-start-8">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-paper pb-4">
              <h3 className="fb-display text-[clamp(2.05rem,3.6vw,2.9rem)]">BPI Bank Transfer</h3>
              <p className="fb-label text-right text-paper/70">Direct bank deposit</p>
            </div>
            <dl className="divide-y divide-paper/15">
              <div className="py-5">
                <dt className="fb-label mb-2 text-paper/70">Account Number:</dt>
                <dd className="fb-display fb-num text-[clamp(2.2rem,4.25vw,3.2rem)]">
                  8969-3458-85
                </dd>
              </div>
              <div className="py-5">
                <dt className="fb-label mb-2 text-paper/70">Account Name:</dt>
                <dd className="text-xl font-semibold">Iren San Buenaventura</dd>
              </div>
            </dl>
            <p className="mt-2 border-t border-paper/15 pt-5 text-sm text-paper/70">
              {memberAreaEnabled
                ? "Upload your deposit slip or transaction confirmation as proof of payment."
                : "Send your deposit slip or transaction confirmation to us on Messenger."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MemberPricing() {
  return (
    <>
      <section className="border-t border-rule bg-bone py-20 lg:py-32">
        <div className={wrap}>
          {/* Annual Membership: ruled rows, as on the homepage. */}
          <div className="grid gap-10 border-t-2 border-ink pt-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="fb-label mb-3">Annual Membership Fee</h2>
              <p className="fb-display fb-num mb-4 text-[clamp(3.1rem,6.5vw,4.7rem)]">
                {formatPhp(ANNUAL_MEMBERSHIP_FEE_PHP)}
              </p>
              <p className="max-w-md text-mute">
                Required for all package members (Starter, Standard, Power). One-time annual fee,
                non-refundable.
              </p>
            </div>
            <ul className="divide-y divide-ink/15 self-end border-y border-ink/15 lg:col-span-6 lg:col-start-7">
              {membershipPerks.map((perk) => (
                <li key={perk} className="flex gap-4 py-4">
                  <Dash />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing: the homepage's Drop-In line and pack columns, plus this page's extra facts. */}
          <div className="mt-20 lg:mt-28">
            {memberAreaEnabled ? (
              <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {packCards.map((pack) => (
                  <PackageCard key={pack.id} pack={pack} />
                ))}
              </div>
            ) : (
              <>
                <DropInLine />
                <DropInExtras />
                <div className="mt-10">
                  <PackColumns />
                </div>
                <PackNotes />
              </>
            )}
          </div>
        </div>
      </section>

      <ComparisonTable />
      <HowToPay />
      <FaqSection faqs={PRICING_FAQS} />

      <section className="border-t border-rule pb-20 lg:pb-32">
        <div className={wrap}>
          <CorporateBlock headingAs="h2" />
        </div>
      </section>
    </>
  );
}

/**
 * pricing.html — guests see the sign-in gate; signed-in members see packages
 * (the source toggles these with `firebase.auth().onAuthStateChanged`).
 */
export function PricingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <section className="pt-14 pb-20 lg:pt-24 lg:pb-28">
        <div className={wrap}>
          <h1 className="fb-display max-w-5xl text-[clamp(2.5rem,5.7vw,5rem)]">
            Membership &amp; Pricing
          </h1>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-10">
            <p className="border-t-2 border-ink pt-6 text-lg leading-relaxed text-mute lg:col-span-4">
              Flexible class packages to match your fitness journey. All packages include access to
              all bootcamp class types.
            </p>
            <div className="relative aspect-3/2 overflow-hidden bg-bone lg:col-span-8 lg:aspect-16/8">
              <Image
                src={asset("/images/stretching-lady.jpg")}
                alt="FitBreak fitness training"
                fill
                sizes="(min-width: 1440px) 900px, (min-width: 1024px) 66vw, 100vw"
                priority
                className="object-cover object-[center_20%]"
              />
            </div>
          </div>
        </div>
      </section>

      {signedIn ? (
        <MemberPricing />
      ) : (
        <div className={cn(wrap, "pb-20")}>
          <SignInRequired />
        </div>
      )}
    </>
  );
}
