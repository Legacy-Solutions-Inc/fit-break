import type { Metadata } from "next";

import { TermsOfService } from "@/components/sites/fitbreak/content/terms-of-service";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service - FitBreak" },
  description: "Terms of Service for FitBreak - Women-only fitness studio in Calapan City.",
  alternates: { canonical: "/terms-of-service" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TermsOfService />;
}
