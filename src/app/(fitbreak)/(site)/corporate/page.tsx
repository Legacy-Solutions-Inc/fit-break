import type { Metadata } from "next";

import { Corporate } from "@/components/sites/fitbreak/content/corporate";

export const metadata: Metadata = {
  title: { absolute: "Corporate Group Program - FitBreak" },
  description:
    "FitBreak Corporate Group Program - Get 42% off for your organization. Invest in women's wellness with group fitness packages for companies, schools, and organizations.",
  alternates: { canonical: "/corporate" },
};

export default function Page() {
  return <Corporate />;
}
