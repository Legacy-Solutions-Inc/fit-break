import type { Metadata } from "next";

import { HowItWorks } from "@/components/sites/fitbreak/guides/how-it-works";
import { routes } from "@/components/sites/fitbreak/links";
import { getMember } from "@/lib/fitbreak/member";

export const metadata: Metadata = {
  title: { absolute: "How It Works - FitBreak" },
  description:
    "Learn how to set up your FitBreak account, book classes, and manage your credits. Step-by-step guide for new members.",
  keywords: ["FitBreak guide", "how to book", "fitness classes", "account setup"],
  alternates: { canonical: routes.howItWorks },
};

export default async function Page() {
  const signedIn = Boolean(await getMember());
  return <HowItWorks signedIn={signedIn} />;
}
