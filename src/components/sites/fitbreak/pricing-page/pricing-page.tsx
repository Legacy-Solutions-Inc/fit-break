import Image from "next/image";
import Link from "next/link";

import { memberAreaEnabled } from "@/config";
import { cn } from "@/lib/utils";
import type { ClassPackage } from "@/services/fitbreak/catalog";

import { FacebookIcon, Icon, SolidCheck } from "../icons";
import { asset, contact, routes } from "../links";
import { MobileIcon, SolidX } from "./icons";

/**
 * Package purchase → the local payments page (source: `/checkout.html?package=<id>`),
 * or a Messenger Booking Enquiry while the Member Area is parked.
 */
function checkoutHref(id: ClassPackage["id"]): string {
  if (!memberAreaEnabled) return contact.messenger;
  return `${routes.member.payments}?package=${encodeURIComponent(id)}`;
}

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

const packCards: readonly PackCard[] = [
  {
    id: "drop-in",
    variant: "plain",
    badge: "NO MEMBERSHIP NEEDED",
    title: "Guest Drop-In",
    tagline: "Try a class before committing",
    price: "₱350",
    perClass: "per class",
    features: [
      { text: "1 Class Credit", included: true },
      { text: "All class types", included: true },
      { text: "Next-day booking only", included: false },
    ],
    cta: "Book Drop-In",
    note: "Limited to 3 drop-ins, then choose a package",
  },
  {
    id: "starter",
    variant: "plain",
    badge: "14% OFF",
    title: "Starter Pack",
    tagline: "Perfect for beginners",
    price: "₱1,800",
    perClass: "₱300 per class",
    features: [
      { text: "6 Class Credits", included: true },
      { text: "Valid 30 days", included: true },
      { text: "3-day advance booking", included: true },
      { text: "All class types", included: true },
    ],
    cta: "Choose Pack",
    note: "Requires ₱500 annual membership",
  },
  {
    id: "standard",
    variant: "popular",
    badge: "21% OFF",
    title: "Standard Pack",
    tagline: "For regular gym-goers",
    price: "₱3,300",
    perClass: "₱275 per class",
    features: [
      { text: "12 Class Credits", included: true },
      { text: "Valid 30 days", included: true },
      { text: "5-day advance booking", included: true },
      { text: "All class types", included: true },
    ],
    cta: "Choose Pack",
    note: "Requires ₱500 annual membership",
  },
  {
    id: "power",
    variant: "best",
    badge: "29% OFF",
    title: "Power Pack",
    tagline: "For fitness enthusiasts",
    price: "₱5,000",
    perClass: "₱250 per class",
    features: [
      { text: "20 Class Credits", included: true },
      { text: "Valid 45 days", included: true },
      { text: "7-day advance booking", included: true },
      { text: "All class types", included: true },
    ],
    cta: "Choose Pack",
    note: "Requires ₱500 annual membership",
  },
];

function PackageCard({ pack }: { pack: PackCard }) {
  const best = pack.variant === "best";
  const dropIn = pack.id === "drop-in";
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
              : dropIn
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
        {...(memberAreaEnabled ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className={cn(
          "block w-full rounded-full px-6 py-3 text-center font-semibold transition-all",
          dropIn
            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
            : best
              ? "bg-white text-brand-600 shadow-lg hover:bg-brand-50"
              : "bg-brand-500 text-white shadow-lg hover:bg-brand-600",
        )}
      >
        {memberAreaEnabled
          ? pack.cta
          : pack.id === "drop-in"
            ? "Message Us to Book"
            : "Ask About This Pack"}
      </Link>
      <p
        className={cn(
          "mt-3 text-center text-xs",
          dropIn ? "font-medium text-amber-600" : best ? "text-brand-100" : "text-gray-500",
        )}
      >
        {pack.note}
      </p>
    </div>
  );
}

type Cell = string | boolean;

const comparison: ReadonlyArray<{ feature: string; cells: readonly [Cell, Cell, Cell, Cell] }> = [
  { feature: "Price", cells: ["₱350", "₱1,800", "₱3,300", "₱5,000"] },
  { feature: "Classes", cells: ["1", "6", "12", "20"] },
  { feature: "Cost per Class", cells: ["₱350", "₱300", "₱275", "₱250"] },
  // Copied verbatim from the source table (the Starter card itself says 30 days).
  { feature: "Validity", cells: ["—", "15 days", "30 days", "45 days"] },
  { feature: "Advance Booking", cells: ["Next day only", "3 days", "5 days", "7 days"] },
  { feature: "Annual Membership", cells: [false, true, true, true] },
];

function ComparisonTable() {
  return (
    <div className="mb-12 overflow-x-auto rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Package Comparison</h2>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-4 py-4 text-left font-semibold text-gray-900">Feature</th>
            <th className="px-4 py-4 text-center font-semibold text-gray-600">Guest Drop-In</th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900">Starter</th>
            <th className="px-4 py-4 text-center font-semibold text-brand-600">Standard</th>
            <th className="px-4 py-4 text-center font-semibold text-brand-600">Power</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {comparison.map((row) => (
            <tr key={row.feature}>
              <td className="px-4 py-4 text-gray-700">{row.feature}</td>
              {row.cells.map((cell, i) =>
                typeof cell === "string" ? (
                  <td key={i} className="px-4 py-4 text-center text-gray-700">
                    {cell}
                  </td>
                ) : (
                  <td key={i} className="px-4 py-4 text-center">
                    {cell ? (
                      <SolidCheck className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <SolidX className="mx-auto h-5 w-5 text-gray-300" />
                    )}
                    <span className="sr-only">{cell ? "Required" : "Not required"}</span>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="mb-12 rounded-2xl bg-linear-to-br from-gray-50 to-white p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">How to Pay</h2>
      <p className="mb-8 text-center text-gray-600">
        Pay via <strong>GCash or bank transfer only</strong> — no cash payments accepted.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <MobileIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">GCash</h3>
              <p className="text-sm text-gray-600">Quick mobile payment</p>
            </div>
          </div>
          <ol className="space-y-2 text-sm text-gray-600">
            {gcashSteps.map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="font-bold text-brand-500">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Icon name="card" className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">BPI Bank Transfer</h3>
              <p className="text-sm text-gray-600">Direct bank deposit</p>
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-sm text-gray-600">Account Number:</p>
            <p className="text-lg font-bold text-gray-900">8969-3458-85</p>
            <p className="mt-2 text-sm text-gray-600">Account Name:</p>
            <p className="font-semibold text-gray-900">Iren San Buenaventura</p>
          </div>
          <p className="text-xs text-gray-500">
            {memberAreaEnabled
              ? "Upload your deposit slip or transaction confirmation as proof of payment."
              : "Send your deposit slip or transaction confirmation to us on Messenger."}
          </p>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "How do class credits work?",
    a: "Each class booking uses 1 credit. Credits expire based on your package validity period. Unused classes expire to encourage consistency and discipline.",
  },
  {
    q: "What is the annual membership fee?",
    a: "The ₱500 annual membership fee is required for all package members (Starter, Standard, Power). It's non-refundable and gives you access to member-only perks, events, and discounts. Guest drop-ins don't need to pay this fee.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes! Cancel up to 2 hours before class starts for a full credit refund. Late cancellations or no-shows forfeit the credit.",
  },
  {
    ...(memberAreaEnabled
      ? {
          q: "How do I receive my credits after paying?",
          a: "After sending payment via GCash or bank transfer, upload your proof of payment in your FitBreak account. Our team will verify your payment and manually add the credits to your account, usually within a few hours during business hours.",
        }
      : {
          q: "How do I get my classes confirmed after paying?",
          a: "After sending payment via GCash or bank transfer, send your receipt to us on Messenger. Our team will verify your payment and confirm your classes, usually within a few hours during business hours.",
        }),
  },
  {
    q: "What's the difference in advance booking privileges?",
    a: "Guest drop-ins can only book for the next day. Starter members can book up to 3 days in advance, Standard members up to 5 days, and Power members up to 7 days. This gives package members priority access to popular class times.",
  },
  {
    q: "Do credits roll over?",
    a: "No, credits expire at the end of their validity period. Make sure to use them before they expire! This policy encourages regular attendance and helps you stay committed to your fitness goals.",
  },
];

function Faq() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto max-w-3xl space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-lg bg-gray-50 p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function CorporateCallout() {
  return (
    <div className="mt-12 rounded-2xl bg-linear-to-r from-purple-600 to-purple-700 p-8 text-white">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
            For Organizations
          </span>
          <h2 className="mb-2 text-2xl font-bold">Corporate Group Program</h2>
          <p className="mb-4 text-purple-100">
            Enroll 5+ women from your organization and get exclusive group rates at{" "}
            <strong className="text-white">₱200 per class</strong> — that&apos;s 42% off!
          </p>
          <ul className="mb-6 space-y-2 text-sm text-purple-100">
            <li className="flex items-center gap-2">
              <SolidCheck className="h-4 w-4 text-yellow-300" />
              Companies, schools, government offices
            </li>
            <li className="flex items-center gap-2">
              <SolidCheck className="h-4 w-4 text-yellow-300" />
              Employee wellness programs
            </li>
          </ul>
        </div>
        {/* Source says `md:text-right`, but that class is missing from its compiled
            CSS, so the live page centres this column. */}
        <div className="text-center">
          <Link
            href={routes.corporate}
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-purple-700 shadow-lg transition-all hover:bg-purple-50"
          >
            Learn More
            <Icon name="arrowRight" className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MemberPricing() {
  return (
    <div>
      {/* Annual Membership Banner */}
      <div className="mb-12 rounded-2xl bg-linear-to-r from-accent-500 to-accent-600 p-8 text-white">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-2xl font-bold">Annual Membership Fee</h2>
            <p className="mb-4 text-4xl font-bold">₱500</p>
            <p className="text-accent-100">
              Required for all package members (Starter, Standard, Power). One-time annual fee,
              non-refundable.
            </p>
          </div>
          <div className="space-y-3">
            {membershipPerks.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm"
              >
                <SolidCheck className="h-5 w-5 text-yellow-300" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {packCards.map((pack) => (
          <PackageCard key={pack.id} pack={pack} />
        ))}
      </div>

      <ComparisonTable />
      <HowToPay />
      <Faq />
      <CorporateCallout />
    </div>
  );
}

/**
 * pricing.html — guests see the sign-in gate; signed-in members see packages
 * (the source toggles these with `firebase.auth().onAuthStateChanged`).
 */
export function PricingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Membership &amp; Pricing</h1>
          <p className="text-xl text-gray-600">
            Flexible class packages to match your fitness journey. All packages include access to
            all bootcamp class types.
          </p>
        </div>
        <div className="hidden lg:block">
          <Image
            src={asset("/images/stretching-lady.jpg")}
            alt="FitBreak fitness training"
            width={1431}
            height={953}
            sizes="(min-width: 1280px) 600px, 50vw"
            priority
            className="h-80 w-full rounded-2xl object-cover object-[center_20%] shadow-lg"
          />
        </div>
      </div>

      {signedIn ? <MemberPricing /> : <SignInRequired />}
    </div>
  );
}
