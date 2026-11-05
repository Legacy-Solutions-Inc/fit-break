import type { Metadata } from "next";
import Image from "next/image";

import { Icon } from "@/components/sites/fitbreak/icons";
import { asset, routes } from "@/components/sites/fitbreak/links";
import { TrainerApplication } from "@/components/sites/fitbreak/member-pages/trainer-application";
import { requireMember } from "@/lib/fitbreak/member";

export const metadata: Metadata = {
  title: { absolute: "Our Trainer — FitBreak" },
  description: "Meet the amazing woman who will guide your fitness journey",
};

export default async function TrainersPage() {
  await requireMember();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Our Trainer</h1>
          <p className="text-gray-600">
            Meet the amazing woman who will guide your fitness journey
          </p>
        </div>

        <div className="max-w-md" id="trainers-grid">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition hover:shadow-md">
            <div className="relative aspect-[3/4] bg-linear-to-br from-brand-100 to-brand-50">
              <Image
                src={asset("/images/iren_new.jpg")}
                alt="Coach Iren"
                fill
                sizes="448px"
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">Iren San Buenaventura</h3>
              <p className="mb-3 text-sm font-medium text-brand-500">
                Certified Personal Trainer, Body Transformation Specialist &amp; Women&apos;s
                Wellness Advocate
              </p>
              <p className="mb-4 text-sm text-gray-600">
                With more than 7 years of professional experience in the fitness industry, Iren has
                dedicated her career to helping women reclaim their strength, confidence, and
                well-being.
              </p>
              <a
                href={routes.coach}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                See Full Bio
                <Icon name="arrowRight" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <TrainerApplication />
      </div>
    </div>
  );
}
