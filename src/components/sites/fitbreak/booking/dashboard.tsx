import Link from "next/link";

import {
  COACH_NAME,
  STUDIO_TIME_ZONE,
  addDays,
  classStart,
  formatDateKey,
  toDateKey,
} from "@/services/fitbreak/catalog";
import type { Booking, CreditSummary, MemberAccount, Payment } from "@/services/fitbreak/members";

import { routes } from "../links";
import { DashboardCalendar, DashboardSearch, type CalendarBooking } from "./dashboard-widgets";

// dashboard.html + dashboard.js, computed on the server from the member
// service. `.metric-card` (a page-level <style> on the source) is `card` here.

const card = "rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";
const DAY_MS = 86_400_000;

function Svg({ d, className }: { d: string | string[]; className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {(Array.isArray(d) ? d : [d]).map((p) => (
        <path key={p} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p} />
      ))}
    </svg>
  );
}

const icons = {
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  plus: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  checkCircle: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  cog: [
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  ],
  users:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
};

function peso(amount: number): string {
  return `₱${amount.toLocaleString("en-US")}`;
}

/** An instant as e.g. "Nov 4, 2026" in studio time. */
function formatInstant(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("en-US", { ...options, timeZone: STUDIO_TIME_ZONE });
}

const paymentStatus: Record<Payment["status"], { color: string; label: string; icon: string }> = {
  pending: {
    color: "border border-yellow-200 bg-yellow-100 text-yellow-700",
    label: "Credit Pending",
    icon: "⏳",
  },
  verified: {
    color: "border border-green-200 bg-green-100 text-green-700",
    label: "Credit Transferred",
    icon: "✓",
  },
  rejected: {
    color: "border border-red-200 bg-red-100 text-red-700",
    label: "Rejected",
    icon: "✗",
  },
};

const methodLabel: Record<Payment["method"], string> = { gcash: "GCash", bpi: "BPI" };

type ClassStatus = "upcoming" | "attended" | "missed";

function ClassCard({
  booking,
  status,
  todayKey,
}: {
  booking: Booking;
  status: ClassStatus;
  todayKey: string;
}) {
  const isToday = booking.date === todayKey;
  const isTomorrow = booking.date === addDays(todayKey, 1);
  const dateLabel = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : formatDateKey(booking.date, { weekday: "short", month: "short", day: "numeric" });

  const config = {
    upcoming: {
      bg: isToday ? "border border-green-200 bg-green-50" : "bg-gray-50",
      icon: isToday ? "bg-green-100" : "bg-brand-100",
      iconText: isToday ? "text-green-600" : "text-brand-600",
      iconBold: isToday ? "text-green-700" : "text-brand-700",
      badge: isToday ? (
        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
          Today
        </span>
      ) : (
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
          Upcoming
        </span>
      ),
    },
    attended: {
      bg: "border border-gray-200 bg-gray-100",
      icon: "bg-gray-300",
      iconText: "text-gray-600",
      iconBold: "text-gray-700",
      badge: (
        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
          ✓ Attended
        </span>
      ),
    },
    missed: {
      bg: "border border-red-200 bg-red-50",
      icon: "bg-red-100",
      iconText: "text-red-600",
      iconBold: "text-red-700",
      badge: (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          Missed
        </span>
      ),
    },
  }[status];

  return (
    <div className={`mb-2 rounded-xl p-3 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${config.icon}`}
        >
          <span className={`text-xs font-bold ${config.iconText}`}>
            {formatDateKey(booking.date, { weekday: "short" }).toUpperCase()}
          </span>
          <span className={`text-lg font-bold ${config.iconBold}`}>
            {Number(booking.date.slice(8))}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`truncate text-sm font-semibold ${status === "attended" ? "text-gray-600" : "text-gray-900"}`}
            >
              {booking.programName}
            </p>
            {config.badge}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {dateLabel} • {booking.time}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{COACH_NAME}</p>
        </div>
      </div>
    </div>
  );
}

export interface DashboardProps {
  now: Date;
  name: string;
  avatarUrl: string;
  account: MemberAccount;
  summary: CreditSummary;
  bookings: Booking[];
  payments: Payment[];
}

export function Dashboard({
  now,
  name,
  avatarUrl,
  account,
  summary,
  bookings,
  payments,
}: DashboardProps) {
  const nowMs = now.getTime();
  const todayKey = toDateKey(now);
  const monthStartKey = `${todayKey.slice(0, 8)}01`;
  const startOf = (b: Booking) => classStart(b.date, b.time).getTime();
  const credits = account.credits;

  // Stats (dashboard.js updateBookingStats / loadUpcomingClasses).
  const upcomingFromNow = bookings.filter((b) => startOf(b) >= nowMs && b.status === "confirmed");
  const attendedCount = bookings.filter((b) => b.status === "attended").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const creditsThisMonth = bookings.filter(
    (b) => b.date >= monthStartKey && (b.status === "confirmed" || b.status === "attended"),
  ).length;
  const classesCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "attended",
  ).length;

  const upcoming: Booking[] = [];
  const history: Array<{ booking: Booking; status: ClassStatus }> = [];
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    const isPast = b.date < todayKey;
    if (isPast) {
      if (b.status === "attended") history.push({ booking: b, status: "attended" });
      else history.push({ booking: b, status: "missed" });
    } else {
      upcoming.push(b);
    }
  }
  upcoming.sort((a, b) => startOf(a) - startOf(b));
  history.sort((a, b) => startOf(b.booking) - startOf(a.booking));
  const todayCount = upcoming.filter((b) => b.date === todayKey).length;
  const upcomingToShow = upcoming.slice(0, 3);
  const historyToShow = history.slice(0, 2);

  // Calendar data.
  const booked: string[] = [];
  const attended: string[] = [];
  const details: Record<string, CalendarBooking[]> = {};
  for (const b of bookings) {
    (details[b.date] ??= []).push({
      className: b.programName,
      classTime: b.time,
      status: b.status,
    });
    if (b.status === "attended" && b.date < todayKey) {
      if (!attended.includes(b.date)) attended.push(b.date);
    } else if (b.status === "confirmed" || b.status === "attended") {
      if (!booked.includes(b.date)) booked.push(b.date);
    }
  }

  // Payments.
  const approved = payments.filter((p) => p.status === "verified");
  const totalPaid = approved.reduce((sum, p) => sum + p.amountPhp, 0);
  const totalCredits = approved.reduce((sum, p) => sum + p.credits, 0);
  const pending = payments.find((p) => p.status === "pending");
  const lastPurchase = approved[0];
  const currentPackage = lastPurchase?.packageName ?? "None";
  const isPackageMember = /starter|standard|power|unlimited/i.test(currentPackage);

  // Expiry.
  let expiry: { text: string; cls: string } = { text: "--", cls: "text-xs font-medium" };
  let expiringSoon: string | null = null;
  if (account.creditsExpireAt) {
    const expiresMs = new Date(account.creditsExpireAt).getTime();
    const daysRemaining = Math.ceil((expiresMs - nowMs) / DAY_MS);
    const short = formatInstant(account.creditsExpireAt, { month: "short", day: "numeric" });
    if (daysRemaining <= 0) expiry = { text: "Expired", cls: "text-sm font-medium text-red-600" };
    else if (daysRemaining <= 7)
      expiry = { text: `${daysRemaining} days left`, cls: "text-sm font-medium text-amber-600" };
    else expiry = { text: short, cls: "text-sm font-medium text-gray-900" };
    if (daysRemaining > 0 && daysRemaining <= 14 && credits > 0) expiringSoon = `Expires ${short}`;
  }

  const showReminder = credits > 0 && upcomingFromNow.length === 0;

  return (
    <div className="p-6">
      {/* Top header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {name}! 👋</h1>
          <p className="text-gray-500">Welcome back! Let&apos;s crush your fitness goals today!</p>
        </div>
        <div className="mt-4 flex items-center gap-3 lg:mt-0">
          <DashboardSearch
            bookings={bookings.map((b) => ({
              className: b.programName,
              dateLabel: formatDateKey(b.date, {}),
            }))}
          />
        </div>
      </div>

      {/* Phone number prompt */}
      {!account.profile.phone && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Svg d={icons.phone} className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Add your phone number</p>
                <p className="text-sm text-gray-600">
                  Get class reminders and important updates via SMS
                </p>
              </div>
            </div>
            <Link
              href={routes.member.profile}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Add Phone
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          <DashboardCalendar
            todayKey={todayKey}
            booked={booked}
            attended={attended}
            details={details}
          />

          {/* My Classes */}
          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">My Classes</h3>
                <p className="text-xs text-gray-500">Your bookings and schedule</p>
              </div>
              <Link
                href={routes.member.bookings}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                View All
              </Link>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-3">
              <div className="rounded-xl bg-purple-50 p-3 text-center">
                <p className="text-xl font-bold text-purple-600">{todayCount}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-xl font-bold text-green-600">{upcomingFromNow.length}</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3 text-center">
                <p className="text-xl font-bold text-gray-600">{attendedCount}</p>
                <p className="text-xs text-gray-500">Attended</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-center">
                <p className="text-xl font-bold text-red-500">{cancelledCount}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>

            <div id="upcoming-classes" className="space-y-3" data-tour="upcoming">
              {upcomingToShow.length === 0 && historyToShow.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  <Svg d={icons.calendar} className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <p>No classes yet</p>
                  <p className="mt-1 text-xs">Book a class to get started!</p>
                </div>
              ) : (
                <>
                  {upcomingToShow.length > 0 && (
                    <>
                      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Upcoming
                      </p>
                      {upcomingToShow.map((b) => (
                        <ClassCard key={b.id} booking={b} status="upcoming" todayKey={todayKey} />
                      ))}
                    </>
                  )}
                  {historyToShow.length > 0 && (
                    <>
                      <p
                        className={`mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase ${upcomingToShow.length > 0 ? "mt-4" : ""}`}
                      >
                        Recent History
                      </p>
                      {historyToShow.map(({ booking, status }) => (
                        <ClassCard
                          key={booking.id}
                          booking={booking}
                          status={status}
                          todayKey={todayKey}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <div className="text-sm">
                <span className="text-gray-500">Credits this month:</span>
                <span className="ml-1 font-semibold text-gray-900">{creditsThisMonth}</span>
              </div>
              <Link
                href={routes.member.bookings}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <Svg d={icons.plus} className="h-4 w-4" />
                Book a Class
              </Link>
            </div>
          </div>

          {/* My Payments */}
          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Payments</h3>
              <Link
                href={routes.member.payments}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                View All
              </Link>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-lg font-bold text-green-600">{peso(totalPaid)}</p>
                <p className="text-xs text-gray-500">Total Paid</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{totalCredits}</p>
                <p className="text-xs text-gray-500">Credits Assigned</p>
              </div>
            </div>
            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  <p>No payments yet</p>
                  <Link
                    href={routes.member.payments}
                    className="text-brand-500 hover:text-brand-600"
                  >
                    Buy credits
                  </Link>
                </div>
              ) : (
                payments.slice(0, 3).map((p) => {
                  const config = paymentStatus[p.status];
                  const isPending = p.status === "pending";
                  const isApproved = p.status === "verified";
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg p-3 ${isPending ? "border border-yellow-200 bg-yellow-50" : isApproved ? "border border-green-200 bg-green-50" : "bg-gray-50"}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {peso(p.amountPhp)}
                          </span>
                          <span className="text-xs font-medium text-brand-600">
                            {p.packageName}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                        >
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>
                          {formatInstant(p.createdAt, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className={isApproved ? "font-medium text-green-600" : ""}>
                          {p.credits} credit{p.credits !== 1 ? "s" : ""}
                          {isApproved ? " added" : isPending ? " (pending)" : ""}
                        </span>
                        <span>{methodLabel[p.method]}</span>
                        {p.referenceNumber && (
                          <span className="text-gray-400">Ref: {p.referenceNumber}</span>
                        )}
                      </div>
                      {isPending && (
                        <p className="mt-2 text-xs text-yellow-600">
                          Payment received - awaiting verification
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {showReminder && (
            <div className={`${card} bg-linear-to-r from-pink-50 to-rose-50`}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <Svg d={icons.clock} className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-pink-800">
                    You have credits - book a class!
                  </p>
                  <p className="text-xs text-pink-600">Don&apos;t forget to reserve your spot</p>
                </div>
              </div>
              <Link
                href={routes.schedule}
                className="mt-3 block w-full rounded-lg bg-pink-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-pink-700"
              >
                Book Now
              </Link>
            </div>
          )}

          {/* My Credits */}
          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Credits</h3>
              <Link
                href={routes.member.payments}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                Buy More
              </Link>
            </div>
            <div className="mb-4 rounded-xl bg-linear-to-br from-brand-50 to-brand-100 py-4 text-center">
              <p
                id="available-credits"
                className="text-4xl font-bold text-brand-600"
                data-tour="credits"
              >
                {credits}
              </p>
              <p className="text-sm text-gray-500">Available Credits</p>
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "Total Purchased",
                  value: summary.purchased || credits,
                  d: icons.plus,
                  bg: "bg-blue-100",
                  fg: "text-blue-600",
                },
                {
                  label: "Used",
                  value: summary.used,
                  d: icons.check,
                  bg: "bg-green-100",
                  fg: "text-green-600",
                },
                {
                  label: "Refunded",
                  value: summary.refunded,
                  d: icons.x,
                  bg: "bg-red-100",
                  fg: "text-red-600",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className={`rounded-[4px] p-1.5 ${row.bg}`}>
                      <Svg d={row.d} className={`h-3.5 w-3.5 ${row.fg}`} />
                    </div>
                    <span className="text-sm text-gray-600">{row.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
              {expiringSoon && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-[4px] bg-amber-100 p-1.5">
                      <Svg d={icons.clock} className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-amber-700">Expiring Soon</span>
                      <p className="text-xs text-amber-600">{expiringSoon}</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700">{credits}</span>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Current Package</span>
                <span className="text-xs font-medium text-gray-900">{currentPackage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last Purchase</span>
                <span className="text-xs font-medium text-gray-900">
                  {lastPurchase
                    ? formatInstant(lastPurchase.createdAt, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Expires</span>
                <span className={expiry.cls}>{expiry.text}</span>
              </div>
            </div>
          </div>

          {/* Pending payment alert */}
          {pending && (
            <div className={`${card} bg-linear-to-r from-blue-50 to-indigo-50`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Svg d={icons.checkCircle} className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Payment Pending</span>
                </div>
                <Link
                  href={routes.member.payments}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View Details
                </Link>
              </div>
              <p className="text-center text-xs text-blue-600">
                <span className="font-medium">{peso(pending.amountPhp)}</span> for{" "}
                {pending.packageName}
                <br />
                <span className="text-xs">
                  Payment received • {pending.credits} credits pending transfer
                </span>
              </p>
            </div>
          )}

          {/* Profile card */}
          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Profile</h3>
              <Link
                href={routes.member.profile}
                aria-label="Edit profile"
                className="text-gray-400 hover:text-gray-600"
              >
                <Svg d={icons.cog} className="h-4 w-4" />
              </Link>
            </div>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote generated avatar, as on the source */}
              <img src={avatarUrl} alt="Profile" className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">
                  <span>{credits > 0 ? "Active" : "Member"}</span> •{" "}
                  <span data-tour="credits">{credits}</span> credits
                </p>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-brand-50 p-3 text-center">
                <p className="text-xl font-bold text-brand-600">{classesCount}</p>
                <p className="text-xs text-gray-500">Classes</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-center">
                <p className="text-xl font-bold text-orange-600">0</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-gray-50 py-2">
                <p className="text-sm font-bold text-gray-900">--</p>
                <p className="text-xs text-gray-500">Weight</p>
              </div>
              <div className="rounded-lg bg-gray-50 py-2">
                <p className="text-sm font-bold text-gray-900">--</p>
                <p className="text-xs text-gray-500">Height</p>
              </div>
            </div>
          </div>

          {/* Refer friends — package members only */}
          {isPackageMember && (
            <div className={`${card} bg-linear-to-br from-brand-500 to-brand-600 text-white`}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Svg d={icons.users} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Refer Friends</h3>
                  <p className="text-xs text-brand-100">Earn free credits!</p>
                </div>
              </div>
              <p className="mb-3 text-sm text-brand-100">
                Share your link. When friends book, you both get 1 free class!
              </p>
              <Link
                href={`${routes.member.profile}#referral`}
                className="block w-full rounded-lg bg-white py-2 text-center text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Get My Link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
