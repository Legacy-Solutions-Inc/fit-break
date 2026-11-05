import type { Metadata } from "next";

import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { crumbsFor, PAGE_SEO } from "@/components/sites/fitbreak/page-seo";
import { BookingProvider } from "@/components/sites/fitbreak/booking/booking-provider";
import { Schedule } from "@/components/sites/fitbreak/booking/schedule";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { MemberShell } from "@/components/sites/fitbreak/member-shell/member-shell";
import { WeeklyTimetable } from "@/components/sites/fitbreak/schedule/weekly-timetable";
import { authDisabled, config, memberAreaEnabled } from "@/config";
import { getMember, requireMember } from "@/lib/fitbreak/member";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/structured-data";
import { getAccount, getBookingCounts, listBookings } from "@/services/fitbreak/members";

export const metadata: Metadata = pageMetadata(PAGE_SEO.schedule);

/**
 * Public schedule. With the Member Area on, guests see "Sign In" slots and members
 * get the sidebar, credits and booking; while it is parked, a weekly timetable.
 */
export default async function SchedulePage() {
  // Information Site: a read-only weekly timetable with Messenger booking.
  if (!memberAreaEnabled) {
    return (
      <>
        <JsonLd data={buildBreadcrumbs(crumbsFor(PAGE_SEO.schedule), config.site.url)} />
        <WeeklyTimetable />
      </>
    );
  }

  const now = new Date();
  // In dev without Supabase (auth disabled) use the member area's demo member
  // so the booking flow can be exercised locally — same rule as requireMember().
  const member = (await getMember()) ?? (authDisabled ? await requireMember() : null);

  if (!member) {
    return (
      <div className="flex min-h-screen">
        <div className="min-h-screen flex-1 bg-gray-50">
          <Schedule now={now} member={null} />
        </div>
        <OnboardingTour page="schedule" />
      </div>
    );
  }

  const [account, counts, bookings] = await Promise.all([
    getAccount(member.id, member.email),
    getBookingCounts(),
    listBookings(member.id),
  ]);
  const mine = bookings
    .filter((b) => b.status === "confirmed")
    .map((b) => `${b.date}|${b.time}|${b.programId}`);

  return (
    <MemberShell member={member}>
      <BookingProvider credits={account.credits}>
        <Schedule now={now} member={{ credits: account.credits, counts, mine }} />
      </BookingProvider>
      <OnboardingTour page="schedule" />
    </MemberShell>
  );
}
