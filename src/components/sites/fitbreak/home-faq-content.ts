import type { Faq } from "@/lib/seo/structured-data";

/*
 * Homepage definition sentence and FAQ, word for word from
 * docs/research/fitbreak/seo-drafts.md. New wording awaiting the studio's
 * approval on the fact sheet: shown (with its FAQPage structured data) only when
 * `homepageFaqEnabled` in src/config.ts is on. One list feeds the visible FAQ,
 * the structured data and /llms.txt.
 */

export const DEFINITION_SENTENCE =
  "FitBreak is a women-only bootcamp fitness studio on the 2nd Floor, Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro. Coach Iren leads one-hour circuit classes Monday to Saturday at 6:30 AM, 9:00 AM, 4:30 PM, 6:00 PM and 7:30 PM.";

export const HOME_FAQS: readonly Faq[] = [
  {
    q: "Is FitBreak a women-only gym?",
    a: "Yes. FitBreak is a women-only fitness studio in Calapan City. The studio is a women's space only; male companions are welcome to wait at the coffee shop downstairs.",
  },
  {
    q: "Where is FitBreak?",
    a: "2nd Floor, Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro.",
  },
  {
    q: "What time are FitBreak classes?",
    a: "Monday to Saturday at 6:30 AM, 9:00 AM, 4:30 PM, 6:00 PM and 7:30 PM. Each class is one hour. Closed on Sundays.",
  },
  {
    q: "How much does FitBreak cost?",
    a: "A guest drop-in is ₱350 with no membership needed. Packs are ₱1,800 for 6 classes, ₱3,300 for 12 and ₱5,000 for 20. Packs need the ₱500 annual membership.",
  },
  {
    q: "How do I book a class?",
    a: "Message FitBreak on Messenger or call 0965 944 1194 with your package and the class and time you want. Pay by GCash or bank transfer and send the receipt on Messenger. Your class is confirmed once payment is verified.",
  },
  {
    q: "Can I pay with GCash?",
    a: "Yes. FitBreak takes GCash or bank transfer (BPI) only; no cash payments.",
  },
];

/**
 * Optional seventh question (from the live How It Works page). Not shown: add it
 * to {@link HOME_FAQS} only if the studio approves it too.
 */
export const OPTIONAL_HOME_FAQ: Faq = {
  q: "I'm a beginner. Can I still join?",
  a: "FitBreak welcomes all fitness levels. Coach Iren provides modifications for each exercise, so everyone can participate safely.",
};
