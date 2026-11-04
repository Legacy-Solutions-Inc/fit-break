import type { Metadata } from "next";

import { Dashboard } from "@/components/sites/fitbreak/booking/dashboard";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { requireMember } from "@/lib/fitbreak/member";
import {
  getAccount,
  getCreditSummary,
  listBookings,
  listPayments,
} from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "My Dashboard — FitBreak" },
  description: "Track your fitness journey with FitBreak",
  robots: { index: false },
};

export default async function DashboardPage() {
  const member = await requireMember();
  const [account, summary, bookings, payments] = await Promise.all([
    getAccount(member.id, member.email),
    getCreditSummary(member.id),
    listBookings(member.id),
    listPayments(member.id),
  ]);

  return (
    <>
      <Dashboard
        now={new Date()}
        name={member.name}
        avatarUrl={member.avatarUrl}
        account={account}
        summary={summary}
        bookings={bookings}
        payments={payments}
      />
      <OnboardingTour page="dashboard" />
    </>
  );
}
