import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ArrowLink, wrap } from "../editorial";
import { asset, contact, routes } from "../links";
import { ClassScheduleOverview } from "./class-schedule";
import { HowItWorksFaq } from "./faq";

const inlineLink =
  "font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep";

const overview = [
  { title: "Create Account", text: "Sign up online" },
  { title: "Choose Package", text: "Select your plan" },
  { title: "Pay & Verify", text: "GCash or bank transfer" },
  { title: "Book Classes", text: "Start your journey" },
];

const two = (n: number) => String(n).padStart(2, "0");

/** One numbered step row: a big condensed number, then the step's content. */
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section
      data-reveal
      className="grid gap-6 border-t-2 border-ink py-14 lg:grid-cols-12 lg:gap-10 lg:py-20"
    >
      <p className="fb-display fb-num text-[clamp(3.4rem,6.75vw,6.1rem)] text-crimson lg:col-span-3">
        {two(n)}
      </p>
      <div className="lg:col-span-8 lg:col-start-5">
        <h2 className="fb-display mb-6 text-[clamp(2.05rem,3.85vw,3.2rem)]">{title}</h2>
        {children}
      </div>
    </section>
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
      <h3 className="fb-label mb-3 text-ink">{heading}</h3>
      <ol className="divide-y divide-ink/15 border-y border-ink/15">
        {items.map(([marker, text]) => (
          <li key={marker} className="grid grid-cols-[2rem_1fr] gap-3 py-4">
            <span className="fb-label fb-num pt-0.5 text-mute">{marker}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

/** A short titled note: hairline above, small condensed heading. */
function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-ink/20 pt-5">
      <h4 className="fb-display mb-2 text-xl">{title}</h4>
      <div className="text-mute [&_strong]:font-semibold [&_strong]:text-ink">{children}</div>
    </div>
  );
}

function PricingSignInRequired() {
  return (
    <div className="border-y border-ink/20 py-10">
      <h3 className="fb-display mb-3 text-3xl">Want to See Our Pricing?</h3>
      <p className="mb-8 max-w-xl text-mute">
        Sign in to your account or follow us on Facebook for pricing, promos, and updates!
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <Link href={routes.login} className="fb-btn fb-btn--ink">
          Sign In / Create Account
        </Link>
        <ArrowLink href={contact.facebook} external>
          Follow on Facebook
        </ArrowLink>
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
      <p className="mb-8 text-mute">
        Select a class package that fits your fitness goals and schedule. Package members need to
        pay a one-time annual membership fee of ₱500.
      </p>

      <ul className="mb-8 divide-y divide-ink/15 border-y border-ink/15">
        {packages.map((p) => (
          <li
            key={p.title}
            className={cn(
              "grid gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6",
              p.featured && "border-l-2 border-l-crimson pl-4",
            )}
          >
            <h3 className="fb-num font-semibold">{p.title}</h3>
            <p className="text-mute">{p.text}</p>
          </li>
        ))}
      </ul>

      <p className="text-mute">
        <strong className="font-semibold text-ink">Note:</strong> Package members (Starter,
        Standard, Power) must pay a ₱500 annual membership fee before purchasing packages. This fee
        gives you access to member perks and discounts.
      </p>

      <div className="mt-8">
        <Link href={routes.pricing} className="fb-btn fb-btn--line">
          View All Packages
        </Link>
      </div>
    </div>
  );
}

const gcashSteps = [
  "Open your GCash app",
  "Send payment to our GCash number",
  "Take a screenshot of the confirmation",
  "Upload in your FitBreak account",
];

/**
 * how-it-works.html, as numbered editorial rows (ADR 0009). Step 2 is
 * auth-gated on the source (Firebase `onAuthStateChanged`); here the page
 * passes `getMember()` server-side.
 */
export function HowItWorks({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      {/* Header */}
      <section className="bg-paper pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-7">
            <p className="fb-label mb-4 text-mute">Guide</p>
            <h1 className="fb-display text-[clamp(2.5rem,5.7vw,5rem)]">How FitBreak Works</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
              Your complete guide to setting up your account, buying credits, and booking classes
              online.
            </p>
          </div>
          <div className="relative hidden aspect-[3/2] overflow-hidden bg-bone lg:col-span-5 lg:block">
            <Image
              src={asset("/images/fitbreak6.jpg")}
              alt="FitBreak workout"
              fill
              sizes="(min-width: 1440px) 560px, 40vw"
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="fb-grain bg-ink py-16 text-paper lg:py-24">
        <div className={wrap}>
          <h2 className="fb-display mb-10 text-[clamp(2.05rem,4.15vw,3.35rem)] lg:mb-14">
            Quick Overview
          </h2>
          <ol className="grid grid-cols-2 border-t border-paper/20 lg:grid-cols-4">
            {overview.map((o, i) => (
              <li
                key={o.title}
                className="border-b border-paper/20 py-6 pr-4 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <span className="fb-display fb-num block text-[clamp(2.8rem,4.55vw,4.15rem)] text-crimson">
                  {two(i + 1)}
                </span>
                <p className="fb-display mt-4 text-2xl">{o.title}</p>
                <p className="mt-1 text-paper/70">{o.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className={`${wrap} bg-paper`}>
        {/* Step-by-Step Guide */}
        <div className="pt-6 lg:pt-12">
          <Step n={1} title="Create Your FitBreak Account">
            <p className="mb-8 max-w-2xl text-lg text-mute">
              All classes at FitBreak are booked online only. You need to create an account first
              before you can book classes or purchase packages.
            </p>
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
            <div className="mt-8">
              <Link href={routes.signup} className="fb-btn fb-btn--ink">
                Create Account Now
              </Link>
            </div>
          </Step>

          <Step n={2} title="Choose Your Package">
            {signedIn ? <PricingForMembers /> : <PricingSignInRequired />}
          </Step>

          <Step n={3} title="Pay & Get Your Credits">
            <p className="mb-10 max-w-2xl text-lg text-mute">
              We accept{" "}
              <strong className="font-semibold text-ink">GCash or bank transfer only</strong> — no
              cash payments. After payment, upload your proof of payment and we&apos;ll add credits
              to your account.
            </p>

            <div className="mb-12 grid gap-10 md:grid-cols-2 md:gap-8">
              <div className="border-t-2 border-ink pt-5">
                <h3 className="fb-display mb-4 text-2xl">Pay via GCash</h3>
                <ol className="divide-y divide-ink/15">
                  {gcashSteps.map((s, i) => (
                    <li key={s} className="grid grid-cols-[2rem_1fr] gap-3 py-3">
                      <span className="fb-label fb-num pt-0.5 text-mute">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t-2 border-ink pt-5">
                <h3 className="fb-display mb-4 text-2xl">Pay via BPI Bank Transfer</h3>
                <dl className="mb-4 border-y border-ink/15 py-4">
                  <dt className="fb-label text-mute">Account Number:</dt>
                  <dd className="fb-display fb-num mt-2 text-4xl">8969-3458-85</dd>
                  <dd className="mt-2 font-semibold">Iren San Buenaventura</dd>
                </dl>
                <p className="text-mute">Upload your deposit slip or transaction confirmation.</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Note title="How Credits Appear in Your Account">
                <p>
                  After you upload your proof of payment, our team will verify it. Once approved,
                  credits are <strong>automatically added</strong> to your account — no manual steps
                  needed! This usually takes <strong>a few hours during business hours</strong>.
                  Your payment page will update in real-time when approved.
                </p>
              </Note>
              <Note title="Credit Expiry">
                <p>
                  Credits expire based on your package: <strong>Guest (7 days)</strong>,{" "}
                  <strong>Starter/Standard (30 days)</strong>, or <strong>Power (45 days)</strong>{" "}
                  from the date your payment is approved. Check your dashboard to see your expiry
                  date!
                </p>
              </Note>
            </div>
          </Step>

          <Step n={4} title="Book Your Classes">
            <p className="mb-8 max-w-2xl text-lg text-mute">
              Once you have credits in your account, you can start booking classes!
            </p>

            <div className="mb-12">
              <Checklist
                heading="How to Book:"
                items={[
                  [
                    "1",
                    <>
                      Go to the{" "}
                      <Link href={routes.schedule} className={inlineLink}>
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

            <div className="grid gap-8 md:grid-cols-2">
              <Note title="Advance Booking Privileges">
                <ul className="space-y-1">
                  <li>Guest Drop-In: Next day only</li>
                  <li>Starter (3 days): Book up to 3 days ahead</li>
                  <li>Standard (5 days): Book up to 5 days ahead</li>
                  <li>Power (7 days): Book up to 7 days ahead</li>
                </ul>
              </Note>
              <Note title="Cancellation Policy">
                <p>
                  Cancel up to <strong>2 hours before</strong> class for a full credit refund. Late
                  cancellations or no-shows forfeit the credit.
                </p>
              </Note>
            </div>

            <div className="mt-10">
              <Link href={routes.schedule} className="fb-btn fb-btn--ink">
                View Class Schedule
              </Link>
            </div>
          </Step>
        </div>

        <ClassScheduleOverview />
        <HowItWorksFaq />

        {/* CTA */}
        <section className="grid gap-8 border-t border-rule py-20 lg:grid-cols-12 lg:items-end lg:gap-10 lg:py-28">
          <div className="lg:col-span-7">
            <h2 className="fb-display text-[clamp(2.2rem,4.65vw,3.9rem)]">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="mt-6 max-w-xl text-lg text-mute">
              Join the FitBreak community and transform your life, one class at a time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:col-span-5 lg:justify-end lg:pb-2">
            <Link href={routes.signup} className="fb-btn fb-btn--crimson">
              Get Started Now
            </Link>
            <Link href={routes.pricing} className="fb-btn fb-btn--line">
              View Packages
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
