import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "../links";

const faqs: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "What should I bring to class?",
    a: "Bring a water bottle, towel, and wear comfortable workout clothes and shoes. All equipment is provided by FitBreak.",
  },
  {
    q: "I'm a beginner. Can I still join?",
    a: "FitBreak welcomes all fitness levels! Coach Iren provides modifications for each exercise, so everyone can participate safely and effectively.",
  },
  {
    q: "What happens if I miss a class?",
    a: "If you don't cancel at least 2 hours before class, you'll forfeit your credit. We encourage you to cancel early so others can take your spot!",
  },
  {
    q: "Can I reschedule my booking?",
    a: 'Yes! Click "Reschedule" on your booking to move it to a different date or time. Your credit is preserved — no additional charge. Just make sure to reschedule at least 2 hours before the original class time.',
  },
  {
    q: "How long does payment verification take?",
    a: "Payment verification usually takes a few hours during business hours (Monday-Saturday). After submitting payment, you'll see a live status update on your screen — no need to refresh! You'll also receive an email when your payment is approved.",
  },
  {
    q: "What happens when my credits expire?",
    a: "Credits expire based on your package (7-45 days from purchase). Expired credits cannot be used to book classes — you'll need to purchase a new package. Check your dashboard to see your credit expiry date.",
  },
  {
    q: "Can I share my credits with someone else?",
    a: "No, credits are non-transferable and tied to your account. Each person needs their own account and credits to book classes.",
  },
  {
    q: "How do I check in when I arrive?",
    a: "Show your booking QR code (from your dashboard or email confirmation) to the front desk. You can check in starting 30 minutes before class and up to 60 minutes after class starts.",
  },
  {
    q: "What are the club rules?",
    a: (
      <>
        FitBreak has 10 house rules to ensure a safe, empowering, and respectful space for every
        woman. These include no video recording during classes, women&apos;s space only (male
        companions may wait at the coffee shop downstairs), and respectful behavior.{" "}
        <Link
          href={routes.clubRules}
          className="font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep"
        >
          View all Club Rules →
        </Link>
      </>
    ),
  },
];

/**
 * how-it-works.html FAQ — native `<details>` accordions, as on the source,
 * set as a ruled list with a plain "+" / "–" marker (ADR 0009).
 */
export function HowItWorksFaq() {
  return (
    <section className="grid gap-10 border-t border-rule py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
      <h2 className="fb-display text-[clamp(2.5rem,6vw,5rem)] lg:col-span-4">
        Frequently Asked Questions
      </h2>
      <div data-reveal className="border-y-2 border-ink lg:col-span-7 lg:col-start-6">
        {faqs.map((f, i) => (
          <details key={f.q} className="group border-b border-ink/15 last:border-b-0">
            <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 transition-colors hover:bg-bone/60 [&::-webkit-details-marker]:hidden">
              <span className="fb-label fb-num w-6 flex-none text-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-lg font-semibold">{f.q}</span>
              <span aria-hidden="true" className="fb-display w-6 flex-none text-right text-2xl">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">–</span>
              </span>
            </summary>
            <p className="pr-10 pb-6 pl-10 text-mute">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
