import type { Metadata } from "next";

import { About } from "@/components/sites/fitbreak/about";
import { Contact } from "@/components/sites/fitbreak/contact";
import { Hero } from "@/components/sites/fitbreak/hero";
import { asset } from "@/components/sites/fitbreak/links";
import { MemberMetrics } from "@/components/sites/fitbreak/member-metrics";
import { Newsletter } from "@/components/sites/fitbreak/newsletter";
import { Pricing } from "@/components/sites/fitbreak/pricing";
import { Programs } from "@/components/sites/fitbreak/programs";
import { VideoSection } from "@/components/sites/fitbreak/video-section";
import { config } from "@/config";
import { getMember } from "@/lib/fitbreak/member";

const title = "FitBreak — Women-Only Bootcamp in Calapan | Book Classes, Pay via GCash";
const description =
  "FitBreak - Women only Fitness Studio in Calapan, Oriental Mindoro. Coach-led bootcamp classes. Fully air conditioned fitness studio. Functional circuit training class format. All classes booked online only.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "women-only gym",
    "bootcamp calapan",
    "fitness classes oriental mindoro",
    "gcash payment gym",
    "women fitness calapan",
    "bootcamp workout",
    "coach-led fitness",
    "small group training",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    siteName: "FitBreak",
    locale: "en_PH",
    images: [{ url: asset("/images/hero-women-bootcamp.jpg"), width: 1200, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitBreak — Women-Only Bootcamp in Calapan",
    description:
      "FitBreak - Women only Fitness Studio in Calapan, Oriental Mindoro. Coach-led bootcamp classes. Fully air conditioned. Functional circuit training. Book online.",
    images: [asset("/images/hero-women-bootcamp.jpg")],
  },
};

// Structured data copied from the source (SportsActivityLocation).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "FitBreak Women-Only Bootcamp",
  description,
  url: config.site.url,
  telephone: "+63-965-944-1194",
  email: "calapan1@fitbreak.ph",
  image: new URL(asset("/images/studio-women-only.jpg"), config.site.url).toString(),
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor Roxas Drive",
    addressLocality: "Brgy Ilaya, Calapan City",
    addressRegion: "Oriental Mindoro",
    postalCode: "5200",
    addressCountry: "PH",
  },
  geo: { "@type": "GeoCoordinates", latitude: "13.4119", longitude: "121.1803" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "06:30",
      closes: "07:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "18:00",
      closes: "19:00",
    },
  ],
  priceRange: "₱₱",
  paymentAccepted: "GCash, Cash",
  currenciesAccepted: "PHP",
  sameAs: [
    "https://facebook.com/FitBreakPhilippines/",
    "https://instagram.com/FitBreakPhilippines/",
  ],
};

export default async function HomePage() {
  const signedIn = Boolean(await getMember());

  return (
    <>
      <script
        type="application/ld+json"
        // Static, developer-authored object — no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <VideoSection />
      {signedIn && <MemberMetrics />}
      <About />
      <Programs />
      <Pricing signedIn={signedIn} />
      <Newsletter />
      <Contact />
    </>
  );
}
