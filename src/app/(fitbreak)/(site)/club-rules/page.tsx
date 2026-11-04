import type { Metadata } from "next";

import { ClubRules } from "@/components/sites/fitbreak/content/club-rules";

export const metadata: Metadata = {
  title: { absolute: "Club Rules - FitBreak" },
  description:
    "FitBreak Women's Only Fitness Club House Rules. A safe, empowering, and respectful space for every woman.",
  alternates: { canonical: "/club-rules" },
};

export default function Page() {
  return <ClubRules />;
}
