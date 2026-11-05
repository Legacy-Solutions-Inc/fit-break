import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { ArrowLink, SectionHead, wrap } from "./editorial";
import { asset, contact, routes } from "./links";
import { Scene } from "./motion/home-scenes";
import { CorporateBlock, DropInLine, PackColumns } from "./pack-pricing";

const perks = [
  "Access to member-only class packs",
  "Invitations to special FitBreak events & workshops",
  "Discounts on FitBreak activewear & merchandise",
];

function SignInGate() {
  return (
    <div className="mb-8 border-y border-ink/20 py-12">
      <div className="max-w-xl">
        <h3 className="fb-display mb-3 text-4xl">Want to See Our Pricing?</h3>
        <p className="mb-8 text-mute">
          Sign in to your account or follow us on Facebook for pricing, promos, and updates!
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <Link href={routes.login} className="fb-btn fb-btn--crimson">
            Sign In / Create Account
          </Link>
          <ArrowLink href={contact.facebook} external>
            Follow on Facebook
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}

function MemberPricing() {
  return (
    <div>
      <DropInLine />
      <div className="mt-10">
        <Scene kind="pricing">
          <PackColumns />
        </Scene>
      </div>

      {/* Annual fee + payment: ruled rows, not coloured panels. */}
      <div className="mt-16 grid gap-10 border-t-2 border-ink pt-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h3 className="fb-label mb-3">Annual Membership Fee</h3>
          <p className="fb-display fb-num mb-3 text-6xl">₱500</p>
          <p className="max-w-md text-mute">
            Required for all package members (Starter, Standard, Power). One-time annual fee,
            non-refundable.
          </p>
        </div>
        <ul className="divide-y divide-ink/15 border-y border-ink/15 lg:col-span-6 lg:col-start-7">
          {perks.map((p) => (
            <li key={p} className="flex gap-4 py-4">
              <span className="text-crimson" aria-hidden="true">
                —
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <h3 className="fb-label lg:col-span-5">Payment Options</h3>
        <div className="lg:col-span-6 lg:col-start-7">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="fb-display mb-1 text-2xl">GCash</dt>
              <dd className="text-mute">Send payment and send your receipt on Messenger</dd>
            </div>
            <div>
              <dt className="fb-display mb-1 text-2xl">BPI Bank Transfer</dt>
              <dd className="text-mute">
                <span className="fb-num">8969-3458-85</span> (Iren San Buenaventura)
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-mute">
            Your classes are confirmed once we verify your payment.
          </p>
        </div>
      </div>

      {/* Photo strip: mixed sizes, bottom-aligned. */}
      <div className="mt-20 grid grid-cols-12 items-end gap-3 sm:gap-4">
        {[
          {
            src: "/images/fitbreak6.jpg",
            alt: "FitBreak community",
            cls: "col-span-6 aspect-[4/3]",
          },
          {
            src: "/images/fitbreak8.jpg",
            alt: "FitBreak training",
            cls: "col-span-3 aspect-[3/4]",
          },
          {
            src: "/images/fitbreak11.jpg",
            alt: "FitBreak workout",
            cls: "col-span-3 aspect-square",
          },
        ].map((img) => (
          <div key={img.src} className={cn("relative overflow-hidden bg-paper", img.cls)}>
            <Image
              src={asset(img.src)}
              alt={img.alt}
              fill
              sizes="(min-width: 1440px) 700px, 50vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pricing is members-only on the source (guests see a sign-in gate). On the
 * Information Site prices are public, so `showPrices` is true for everyone.
 */
export function Pricing({ showPrices }: { showPrices: boolean }) {
  return (
    <section id="pricing" className="border-t border-rule bg-bone py-20 lg:py-32">
      <div className={wrap}>
        <SectionHead
          title={<>Membership &amp; Pricing</>}
          aside={
            <p>
              Pay via{" "}
              <strong className="font-semibold text-ink">GCash or bank transfer only</strong>, no
              cash payments.{" "}
              <a
                href={routes.pricing}
                className="font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep"
              >
                View full pricing details
              </a>
            </p>
          }
          className="mb-14 lg:mb-20"
        />

        {showPrices ? <MemberPricing /> : <SignInGate />}

        <CorporateBlock />
      </div>
    </section>
  );
}
