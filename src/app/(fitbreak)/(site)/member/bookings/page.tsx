import type { Metadata } from "next";

import { BookingProvider } from "@/components/sites/fitbreak/booking/booking-provider";
import { Bookings } from "@/components/sites/fitbreak/booking/bookings";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { requireMember } from "@/lib/fitbreak/member";
import { getAccount, getBookingCounts, listBookings } from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "My Bookings — FitBreak" },
  robots: { index: false },
};

export default async function BookingsPage() {
  const member = await requireMember();
  const [account, bookings, counts] = await Promise.all([
    getAccount(member.id, member.email),
    listBookings(member.id),
    getBookingCounts(),
  ]);

  return (
    <BookingProvider credits={account.credits} toastVariant="pill">
      <Bookings now={new Date()} bookings={bookings} counts={counts} />
      <OnboardingTour page="bookings" />
    </BookingProvider>
  );
}
