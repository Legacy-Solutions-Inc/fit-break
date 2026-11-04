import type { Metadata } from "next";

import { PrivacyPolicy } from "@/components/sites/fitbreak/content/privacy-policy";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy - FitBreak" },
  description:
    "Privacy Policy for FitBreak - How we collect, use, and protect your personal information.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PrivacyPolicy />;
}
