import type { Metadata } from "next";

import { Payments } from "@/components/sites/fitbreak/booking/payments";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { requireMember } from "@/lib/fitbreak/member";
import { PACKAGES, type ClassPackage } from "@/services/fitbreak/catalog";
import { getAccount, listBookings, listPayments } from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "Payments & Credits — FitBreak" },
  robots: { index: false },
};

function packageFrom(value: string | string[] | undefined): ClassPackage["id"] | undefined {
  const id = Array.isArray(value) ? value[0] : value;
  return PACKAGES.find((p) => p.id === id)?.id;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await requireMember();
  const [params, account, payments, bookings] = await Promise.all([
    searchParams,
    getAccount(member.id, member.email),
    listPayments(member.id),
    listBookings(member.id),
  ]);

  return (
    <>
      <Payments
        now={new Date()}
        account={account}
        payments={payments}
        bookings={bookings}
        initialPackage={packageFrom(params.package)}
      />
      <OnboardingTour page="payments" />
    </>
  );
}
