import type { Metadata } from "next";

import { Fitbreakers } from "@/components/sites/fitbreak/content/fitbreakers";

export const metadata: Metadata = {
  title: { absolute: "Who Are the FitBreakers? - FitBreak" },
  description:
    "FitBreakers are women who choose themselves. Discover the meaning behind the name and join our empowering community.",
  alternates: { canonical: "/fitbreakers" },
};

export default function Page() {
  return <Fitbreakers />;
}
