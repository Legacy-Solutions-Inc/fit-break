import { memberAreaEnabled } from "@/config";
import type { Faq } from "@/lib/seo/structured-data";

/**
 * The six questions the pricing page shows — one list for the visible FAQ and
 * its FAQPage structured data, so the two always say the same thing.
 */
export const PRICING_FAQS: readonly Faq[] = [
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
