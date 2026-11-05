import { contact, routes } from "@/components/sites/fitbreak/links";
import { memberAreaEnabled } from "@/config";
import {
  ANNUAL_MEMBERSHIP_FEE_PHP,
  COACH_NAME,
  PACKAGES,
  PAYMENT_DETAILS,
  PROGRAMS,
  TIME_SLOTS,
  formatTime,
} from "@/services/fitbreak/catalog";

// ─────────────────────────────────────────────────────────────────────────────
// FitBreak Assistant — local FAQ responder behind /api/chatbot.
//
// The live site's widget called a Dialogflow CX Cloud Function (which was
// returning HTTP 500 for every message when this was cloned). This clone answers
// the five topics the widget's welcome message promises — schedules, pricing,
// booking, location, credits — from this app's own catalogue, so it has no
// dependency on the old backend. Swap `reply()` for an LLM/Dialogflow call later
// without touching the widget.
// ─────────────────────────────────────────────────────────────────────────────

const ADDRESS = "2nd Floor Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro";

const slots = TIME_SLOTS.map((t) => formatTime(t)).join(", ");
const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

const answers = {
  schedule: [
    "Classes run Monday to Saturday (closed Sunday), 60 minutes each, all led by " +
      `${COACH_NAME}.`,
    `Daily start times: ${slots}.`,
    `Programs: ${PROGRAMS.map((p) => p.name).join(", ")} — every program is offered at every time slot.`,
    memberAreaEnabled
      ? `See live availability and book at ${routes.schedule}.`
      : `See the weekly timetable on ${routes.schedule}, then message us on Messenger or call ${contact.phoneDisplay} to book.`,
  ].join("\n"),
  pricing: [
    "Class packages:",
    ...PACKAGES.map(
      (p) =>
        `• ${p.name}: ${peso(p.pricePhp)} for ${p.credits} class${p.credits > 1 ? "es" : ""}` +
        (p.validityDays ? ` (valid ${p.validityDays} days)` : " (no membership needed)"),
    ),
    `Starter, Standard and Power packs need the ${peso(ANNUAL_MEMBERSHIP_FEE_PHP)} annual membership.`,
    `Full details: ${routes.pricing}.`,
  ].join("\n"),
  booking: (memberAreaEnabled
    ? [
        "How to book:",
        "1. Create an account or sign in.",
        "2. Buy a class package (GCash or bank transfer) and upload your proof of payment.",
        "3. Once verified, credits appear in your account.",
        `4. Pick a class on ${routes.schedule} — each class uses 1 credit.`,
        "All classes are booked online only.",
      ]
    : [
        "How to book:",
        `1. Message us on Messenger (${contact.messenger}) or call ${contact.phoneDisplay}.`,
        "2. Tell us your package and the class and time you'd like.",
        "3. Pay via GCash or bank transfer and send us your receipt on Messenger.",
        "4. We'll confirm your class once your payment is verified.",
        `See the weekly timetable on ${routes.schedule}.`,
      ]
  ).join("\n"),
  location: [
    `We're at ${ADDRESS}.`,
    "It's a women-only, fully air-conditioned studio. Male companions are welcome to wait at the coffee shop downstairs.",
  ].join("\n"),
  credits: [
    memberAreaEnabled
      ? "1 credit = 1 class. Credits are added after your payment is verified and expire with your package's validity period."
      : "1 credit = 1 class. Credits expire with your package's validity period, and unused classes don't roll over.",
    `Pay via GCash or ${PAYMENT_DETAILS.bpi.bank} transfer (${PAYMENT_DETAILS.bpi.accountNumber}, ${PAYMENT_DETAILS.bpi.accountName}).`,
    memberAreaEnabled
      ? `Check your balance on ${routes.member.payments}.`
      : "Send your receipt on Messenger and we'll confirm your classes once your payment is verified.",
  ].join("\n"),
};

type Topic = keyof typeof answers;

const keywords: Record<Topic, RegExp> = {
  schedule:
    /\b(schedule|time|times|hour|hours|open|when|class(es)?|program|sunday|monday|morning|evening)\b/i,
  pricing:
    /\b(price|prices|pricing|cost|how much|fee|rate|package|pack|drop-?in|membership|peso|php|₱)\b/i,
  booking: /\b(book|booking|reserve|sign ?up|register|join|account|cancel)\b/i,
  location: /\b(where|location|address|located|directions|map|calapan|roxas|parking)\b/i,
  credits: /\b(credit|credits|gcash|bank|bpi|pay|payment|paid|proof|expire|expiry|balance)\b/i,
};

const FALLBACK =
  "I can help with class schedules, pricing and packages, how to book, our location, and how credits work. " +
  `For anything else, message us at calapan1@fitbreak.ph or 0965 944 1194.`;

/** Answers a visitor question. Pure and deterministic (unit-testable). */
export function reply(message: string): string {
  const matched = (Object.keys(keywords) as Topic[]).filter((t) => keywords[t].test(message));
  if (matched.length === 0) {
    if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/i.test(message)) {
      return "Hi! What would you like to know — schedules, pricing, booking, location, or credits?";
    }
    return FALLBACK;
  }
  // Most specific first: a pricing or credits question that also says "class"
  // should not be answered with the schedule.
  const order: Topic[] = ["credits", "pricing", "booking", "location", "schedule"];
  const best = order.filter((t) => matched.includes(t)).slice(0, 2);
  return best.map((t) => answers[t]).join("\n\n");
}
