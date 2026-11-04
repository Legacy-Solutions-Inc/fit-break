import type { Metadata } from "next";

import { OurStory } from "@/components/sites/fitbreak/content/our-story";

export const metadata: Metadata = {
  title: { absolute: "Our Story - FitBreak" },
  description:
    "Discover the story behind FitBreak - a women-only fitness studio born from understanding what women truly need in their fitness journey.",
  alternates: { canonical: "/our-story" },
};

export default function Page() {
  return <OurStory />;
}
