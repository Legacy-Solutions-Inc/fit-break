import { cn } from "@/lib/utils";
import {
  CORPORATE_RATE_PHP,
  discountPercent,
  formatPhp,
  getPackage,
  PACKAGES,
  type ClassPackage,
} from "@/services/fitbreak/catalog";

import { Arrow, ArrowLink } from "./editorial";
import { Icon } from "./icons";
import { asset, contact, routes } from "./links";

/*
 * Pack pricing shared by the homepage and /pricing (ADR 0009). Kept free of the
 * homepage's GSAP scenes so /pricing never loads that animation code.
 */

/** How each pack is presented (the catalogue carries the numbers). */
const packLook = {
  starter: { tag: null, featured: false },
  standard: { tag: "Popular", featured: true },
  power: { tag: "Best Value", featured: false },
} as const satisfies Record<
  Exclude<ClassPackage["id"], "drop-in">,
  { tag: string | null; featured: boolean }
>;

const dropIn = getPackage("drop-in");

/**
 * The three class packs, compared by price per class (ADR 0009). Prices,
 * classes, validity and booking window come from the studio catalogue; the
 * discount is each pack's saving per class against the drop-in price.
 */
export const packs = PACKAGES.flatMap((pkg) =>
  pkg.id === "drop-in"
    ? []
    : [
        {
          name: pkg.name,
          classes: `${pkg.credits} Classes`,
          validity: `Valid ${pkg.validityDays} days`,
          perClass: formatPhp(pkg.perClassPhp),
          total: formatPhp(pkg.pricePhp),
          save: `Save ${discountPercent(pkg.perClassPhp, dropIn.perClassPhp)}%`,
          advance: `${pkg.advanceBookingDays}-day advance booking`,
          ...packLook[pkg.id],
        },
      ],
);

/** Guest Drop-In as one plain line above the packs. */
export function DropInLine() {
  return (
    <div
      data-price-card
      data-placement="drop-in"
      className="flex flex-col gap-4 border-y border-ink/20 py-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <p className="text-lg">
        <span className="fb-label mr-3 text-mute">New here?</span>
        <strong className="font-semibold">Guest Drop-In</strong> — try a class for{" "}
        <strong className="fb-num font-semibold">{formatPhp(dropIn.pricePhp)}</strong>, no
        membership required.{" "}
        <span className="text-mute">Next-day booking only · limited to 3 drop-ins.</span>
      </p>
      <ArrowLink href={contact.messenger} external className="self-start lg:self-auto">
        Message Us to Book
      </ArrowLink>
    </div>
  );
}

/**
 * Three flat columns; Standard is the one highlighted pack. No motion here —
 * the homepage wraps it in its GSAP scene (pricing.tsx).
 */
export function PackColumns() {
  return (
    <div className="grid border-ink/20 lg:grid-cols-3 lg:divide-x lg:divide-ink/20 lg:border-x">
      {packs.map((p) => (
        <article
          key={p.name}
          data-price-card
          data-placement="pricing-pack"
          data-pack={p.name}
          className={cn(
            "flex flex-col border-b border-ink/20 p-7 lg:border-b-0 lg:p-10",
            p.featured
              ? "bg-ink text-paper max-lg:-mx-5 max-lg:px-5 sm:max-lg:-mx-8 sm:max-lg:px-8"
              : "",
          )}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="fb-display text-[2.5rem]">{p.name}</h3>
            {p.tag && (
              <span
                className={cn(
                  "fb-label",
                  p.featured ? "bg-crimson px-2 py-1 text-white" : "text-mute",
                )}
              >
                {p.tag}
              </span>
            )}
          </div>
          <p className={cn("mt-2", p.featured ? "text-paper/70" : "text-mute")}>
            {p.classes} • {p.validity}
          </p>

          <p className="mt-10 flex items-baseline gap-2">
            <span className="fb-display fb-num text-[clamp(3.4rem,5.8vw,4.7rem)]">
              {p.perClass}
            </span>
            <span className={cn("fb-label", p.featured ? "text-paper/70" : "text-mute")}>
              / class
            </span>
          </p>

          <dl
            className={cn(
              "mt-8 mb-10 divide-y border-y text-sm",
              p.featured ? "divide-paper/15 border-paper/15" : "divide-ink/15 border-ink/15",
            )}
          >
            <div className="flex justify-between py-3">
              <dt className={p.featured ? "text-paper/70" : "text-mute"}>Pack price</dt>
              <dd className="fb-num font-semibold">{p.total}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className={p.featured ? "text-paper/70" : "text-mute"}>Discount</dt>
              <dd className="font-semibold">{p.save}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className={p.featured ? "text-paper/70" : "text-mute"}>Booking</dt>
              <dd className="font-semibold">{p.advance}</dd>
            </div>
          </dl>

          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("fb-btn mt-auto w-full", p.featured ? "fb-btn--crimson" : "fb-btn--line")}
          >
            Ask About This Pack
          </a>
        </article>
      ))}
    </div>
  );
}

/** Corporate group offer: a ruled block, ink on paper. */
export function CorporateBlock({ headingAs: Heading = "h3" }: { headingAs?: "h2" | "h3" }) {
  return (
    <div className="mt-20 grid gap-10 border-2 border-ink bg-paper p-7 sm:p-10 lg:grid-cols-12 lg:p-14">
      <div className="lg:col-span-7">
        <p className="fb-label mb-4 text-mute">For Organizations</p>
        <Heading className="fb-display mb-5 text-[clamp(2.2rem,4.15vw,3.35rem)]">
          Corporate Group Program
        </Heading>
        <p className="max-w-xl text-lg text-ink/80">
          Enroll 5+ women from your organization and get exclusive group rates at{" "}
          <strong className="font-semibold text-ink">{`${formatPhp(CORPORATE_RATE_PHP)} per class`}</strong>{" "}
          — that&apos;s 42% off!
        </p>
        <ul className="mt-6 space-y-2 text-mute">
          <li>— Companies, schools, government offices</li>
          <li>— Employee wellness programs</li>
        </ul>
      </div>
      <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9 lg:justify-end">
        <a href={routes.corporate} className="fb-btn fb-btn--ink">
          Learn More
          <Arrow />
        </a>
        <a href={asset("/fitbreak-corporate-flyer.pdf")} download className="fb-link">
          <Icon name="download" className="h-4 w-4" />
          Download Flyer
        </a>
      </div>
    </div>
  );
}
