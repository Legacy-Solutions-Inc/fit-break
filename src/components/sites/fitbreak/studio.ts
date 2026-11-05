import type { StudioInfo } from "@/lib/seo/structured-data";
import {
  CLASS_DAYS,
  CLASS_MINUTES,
  COACH_NAME,
  formatPhp,
  PACKAGES,
  TIME_SLOTS,
} from "@/services/fitbreak/catalog";

import { asset, contact } from "./links";

/*
 * The studio's identity as one record of Studio Facts, assembled from the
 * catalogue and the published contact details. Everything search engines and AI
 * answer engines read (structured data, /llms.txt) is built from this, so it
 * can't contradict the pages.
 */

const prices = PACKAGES.map((p) => p.pricePhp);

export const STUDIO: StudioInfo = {
  name: "FitBreak",
  // The homepage hero's sentence, word for word.
  description:
    "A women-only fitness club offering one-hour bootcamp workouts that fit your busy life—so you can be strong, healthy, and happy.",
  logo: asset("/images/fitbreak-landscape-logo.png"),
  image: asset("/images/studio-women-only.jpg"),
  telephone: contact.phoneHref.replace(/^tel:/, ""),
  phoneDisplay: contact.phoneDisplay,
  email: contact.email,
  messenger: contact.messenger,
  address: {
    streetAddress: "2nd Floor Roxas Drive, Brgy Ilaya",
    addressLocality: "Calapan City",
    addressRegion: "Oriental Mindoro",
    postalCode: "5200",
    addressCountry: "PH",
  },
  addressDisplay: "2nd Floor Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro, Philippines",
  geo: { latitude: 13.4119, longitude: 121.1803 },
  coachName: COACH_NAME,
  classDays: CLASS_DAYS,
  timeSlots: TIME_SLOTS,
  classMinutes: CLASS_MINUTES,
  // GCash or bank transfer only — no cash (pricing page).
  paymentAccepted: ["GCash", "Bank Transfer"],
  currenciesAccepted: "PHP",
  priceRange: `${formatPhp(Math.min(...prices))}–${formatPhp(Math.max(...prices))}`,
  sameAs: [contact.facebook, contact.instagram],
};
