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
        <Link href={routes.clubRules} className="font-medium text-brand-500 hover:underline">
          View all Club Rules →
        </Link>
      </>
    ),
  },
];

/** how-it-works.html FAQ — native `<details>` accordions, as on the source. */
export function HowItWorksFaq() {
  return (
    <div className="mt-12 rounded-2xl bg-gray-100 p-8">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto max-w-3xl space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-lg bg-white p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
