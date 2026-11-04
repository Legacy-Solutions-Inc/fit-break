import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FacebookIcon, Icon } from "../icons";
import { asset, contact, routes } from "../links";
import { MobileIcon } from "../pricing-page/icons";
import { ClassScheduleOverview } from "./class-schedule";
import { HowItWorksFaq } from "./faq";

const pill =
  "inline-flex items-center rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600";

const overview = [
  { title: "Create Account", text: "Sign up online" },
  { title: "Choose Package", text: "Select your plan" },
  { title: "Pay & Verify", text: "GCash or bank transfer" },
  { title: "Book Classes", text: "Start your journey" },
];

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <div className="flex items-start gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500">
          <span className="text-xl font-bold text-white">{n}</span>
        </div>
        <div className="flex-1">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

function Checklist({
  heading,
  items,
}: {
  heading: string;
  items: ReadonlyArray<[string, ReactNode]>;
}) {
  return (
    <>
      <h3 className="font-semibold text-gray-900">{heading}</h3>
      <ol className="space-y-3">
        {items.map(([marker, text]) => (
          <li key={marker} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {marker}
            </span>
            <span className="text-gray-700">{text}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function PricingSignInRequired() {
  return (
    <div className="rounded-xl bg-gray-50 p-6 text-center">
      <Icon name="lock" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">Want to See Our Pricing?</h3>
      <p className="mb-4 text-gray-600">
        Sign in to your account or follow us on Facebook for pricing, promos, and updates!
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={routes.login} className={pill}>
          Sign In / Create Account
        </Link>
        <a
          href={contact.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
          <FacebookIcon className="mr-2 h-5 w-5" />
          Follow on Facebook
        </a>
      </div>
    </div>
  );
}

const packages = [
  {
    title: "Guest Drop-In (₱350)",
    text: "Try a single class. No membership required. Next-day booking only.",
    featured: false,
  },
  {
    title: "Starter Pack (₱1,800)",
    text: "6 classes, valid 30 days. 3-day advance booking.",
    featured: false,
  },
  {
    title: "Standard Pack (₱3,300)",
    text: "12 classes, valid 30 days. 5-day advance booking. Most popular!",
    featured: true,
  },
  {
    title: "Power Pack (₱5,000)",
    text: "20 classes, valid 45 days. 7-day advance booking. Best value!",
    featured: false,
  },
];

function PricingForMembers() {
  return (
    <div>
      <p className="mb-6 text-gray-600">
        Select a class package that fits your fitness goals and schedule. Package members need to
        pay a one-time annual membership fee of ₱500.
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {packages.map((p) => (
          <div
            key={p.title}
            className={
              p.featured
                ? "rounded-xl border border-brand-200 bg-brand-50 p-4"
                : "rounded-xl bg-gray-50 p-4"
            }
          >
            <h4 className="mb-2 font-semibold text-gray-900">{p.title}</h4>
            <p className="text-sm text-gray-600">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-accent-200 bg-accent-50 p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Package members (Starter, Standard, Power) must pay a ₱500 annual
          membership fee before purchasing packages. This fee gives you access to member perks and
          discounts.
        </p>
      </div>

      <div className="mt-6">
        <Link href={routes.pricing} className={pill}>
          View All Packages
        </Link>
      </div>
    </div>
  );
}

/**
 * how-it-works.html. Step 2 is auth-gated on the source (Firebase
 * `onAuthStateChanged`); here the page passes `getMember()` server-side.
 */
export function HowItWorks({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">How FitBreak Works</h1>
          <p className="text-xl text-gray-600">
            Your complete guide to setting up your account, buying credits, and booking classes
            online.
          </p>
        </div>
        <div className="hidden lg:block">
          <Image
            src={asset("/images/fitbreak6.jpg")}
            alt="FitBreak workout"
            width={1430}
            height={953}
            sizes="(min-width: 1024px) 400px, 100vw"
            priority
            className="h-64 w-full rounded-2xl object-cover object-top shadow-lg"
          />
        </div>
      </div>

      {/* Quick Overview */}
      <div className="mb-12 rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-8 text-white">
        <h2 className="mb-6 text-center text-2xl font-bold">Quick Overview</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {overview.map((o, i) => (
            <div key={o.title} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <span className="text-2xl font-bold">{i + 1}</span>
              </div>
              <p className="font-semibold">{o.title}</p>
              <p className="mt-1 text-sm text-brand-100">{o.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="space-y-8">
        <Step n={1} title="Create Your FitBreak Account">
          <p className="mb-6 text-gray-600">
            All classes at FitBreak are booked online only. You need to create an account first
            before you can book classes or purchase packages.
          </p>
          <div className="space-y-4 rounded-xl bg-gray-50 p-6">
            <Checklist
              heading="How to Sign Up:"
              items={[
                [
                  "a",
                  <>
                    Click the <strong>&quot;Get Started&quot;</strong> button on the top right of
                    the page
                  </>,
                ],
                [
                  "b",
                  "Enter your email address and create a password, OR sign up with your Google account for faster registration",
                ],
                ["c", "Complete your profile by adding your name and contact number"],
                ["d", "Your account is now active! You can now purchase credits and book classes."],
              ]}
            />
          </div>
          <div className="mt-6 flex gap-4">
            <Link href={routes.signup} className={pill}>
              Create Account Now
            </Link>
          </div>
        </Step>

        <Step n={2} title="Choose Your Package">
          {signedIn ? <PricingForMembers /> : <PricingSignInRequired />}
        </Step>

        <Step n={3} title="Pay & Get Your Credits">
          <p className="mb-6 text-gray-600">
            We accept <strong>GCash or bank transfer only</strong> — no cash payments. After
            payment, upload your proof of payment and we&apos;ll add credits to your account.
          </p>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                <MobileIcon className="h-6 w-6 text-blue-600" />
                Pay via GCash
              </h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Open your GCash app</li>
                <li>2. Send payment to our GCash number</li>
                <li>3. Take a screenshot of the confirmation</li>
                <li>4. Upload in your FitBreak account</li>
              </ol>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                <Icon name="card" className="h-6 w-6 text-green-600" />
                Pay via BPI Bank Transfer
              </h3>
              <div className="mb-4 rounded-lg bg-white p-3">
                <p className="text-sm text-gray-600">Account Number:</p>
                <p className="text-lg font-bold text-gray-900">8969-3458-85</p>
                <p className="mt-1 text-sm text-gray-600">Iren San Buenaventura</p>
              </div>
              <p className="text-sm text-gray-600">
                Upload your deposit slip or transaction confirmation.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold text-yellow-800">
              How Credits Appear in Your Account
            </h4>
            <p className="text-sm text-yellow-700">
              After you upload your proof of payment, our team will verify it. Once approved,
              credits are <strong>automatically added</strong> to your account — no manual steps
              needed! This usually takes <strong>a few hours during business hours</strong>. Your
              payment page will update in real-time when approved.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-green-800">Credit Expiry</h4>
            <p className="text-sm text-green-700">
              Credits expire based on your package: <strong>Guest (7 days)</strong>,{" "}
              <strong>Starter/Standard (30 days)</strong>, or <strong>Power (45 days)</strong> from
              the date your payment is approved. Check your dashboard to see your expiry date!
            </p>
          </div>
        </Step>

        <Step n={4} title="Book Your Classes">
          <p className="mb-6 text-gray-600">
            Once you have credits in your account, you can start booking classes!
          </p>

          <div className="mb-6 space-y-4 rounded-xl bg-gray-50 p-6">
            <Checklist
              heading="How to Book:"
              items={[
                [
                  "1",
                  <>
                    Go to the{" "}
                    <Link href={routes.schedule} className="text-brand-600 hover:underline">
                      Schedule page
                    </Link>{" "}
                    to see available classes
                  </>,
                ],
                ["2", "Click on the class you want to attend"],
                ["3", "Confirm your booking — 1 credit will be deducted from your account"],
                ["4", "Show up on time and enjoy your class!"],
              ]}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-brand-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-900">Advance Booking Privileges</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Guest Drop-In: Next day only</li>
                <li>Starter (3 days): Book up to 3 days ahead</li>
                <li>Standard (5 days): Book up to 5 days ahead</li>
                <li>Power (7 days): Book up to 7 days ahead</li>
              </ul>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-900">Cancellation Policy</h4>
              <p className="text-sm text-gray-600">
                Cancel up to <strong>2 hours before</strong> class for a full credit refund. Late
                cancellations or no-shows forfeit the credit.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link href={routes.schedule} className={pill}>
              View Class Schedule
            </Link>
          </div>
        </Step>
      </div>

      <ClassScheduleOverview />
      <HowItWorksFaq />

      {/* CTA */}
      <div className="mt-12 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="mb-6 text-gray-600">
          Join the FitBreak community and transform your life, one class at a time.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={routes.signup}
            className="rounded-full bg-brand-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl"
          >
            Get Started Now
          </Link>
          <Link
            href={routes.pricing}
            className="rounded-full border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            View Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
