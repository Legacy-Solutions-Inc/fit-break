import type { Metadata } from "next";

import { CoachProfile } from "@/components/sites/fitbreak/coach/coach-profile";
import { asset, routes } from "@/components/sites/fitbreak/links";

const title = "Meet Coach Iren - FitBreak";

export const metadata: Metadata = {
  title: { absolute: title },
  description:
    "Meet Iren San Buenaventura, certified personal trainer, body transformation specialist, and founder of FitBreak - the women-only fitness studio in Calapan City.",
  keywords: [
    "Iren San Buenaventura",
    "fitness coach",
    "personal trainer",
    "women fitness",
    "Calapan gym",
    "FitBreak owner",
  ],
  alternates: { canonical: routes.coach },
  openGraph: {
    type: "profile",
    url: routes.coach,
    title,
    description:
      "Meet the certified fitness coach and wellness advocate behind FitBreak women-only studio.",
    images: [{ url: asset("/images/iren_new.jpg"), width: 1024, height: 1536 }],
  },
};

export default function Page() {
  return <CoachProfile />;
}
