import Image from "next/image";
import Link from "next/link";

import {
  COACH_NAME,
  formatDateKey,
  scheduleEndKey,
  toDateKey,
  upcomingClassDateKeys,
} from "@/services/fitbreak/catalog";

import { asset, routes } from "../links";
import { ScheduleDays, type ScheduleMemberState } from "./schedule-days";

export type { ScheduleMemberState };

// schedule.html + schedule.js displaySchedule(): every Monday–Saturday from
// today through the end of next month, six programs per day, five slots each.
// All dates and "Passed" checks are in studio time (Asia/Manila) via catalog.

export function Schedule({ now, member }: { now: Date; member: ScheduleMemberState | null }) {
  const nowMs = now.getTime();
  const todayKey = toDateKey(now);
  const days = upcomingClassDateKeys(now);
  const weekRange = `${formatDateKey(todayKey, { month: "short", day: "numeric" })} - ${formatDateKey(
    scheduleEndKey(todayKey),
    { month: "short", day: "numeric", year: "numeric" },
  )}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600">Book your spot in our upcoming bootcamp classes</p>
        </div>
        <div className="relative hidden h-48 overflow-hidden rounded-2xl shadow-lg lg:block">
          <Image
            src={asset("/images/fitbreak7.jpg")}
            alt="FitBreak workout session"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Credits display (members only, as on the source) */}
      {member && (
        <div
          id="credits-banner"
          className="mb-6 rounded-xl bg-linear-to-r from-brand-500 to-brand-600 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-brand-100">Your Credits</p>
              <p id="credits-count" className="text-3xl font-bold">
                {member.credits}
              </p>
            </div>
            <Link
              href={routes.member.payments}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              Buy Credits
            </Link>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Schedule for</p>
            <p id="week-range" className="text-lg font-bold text-gray-900">
              {weekRange}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">All classes by</p>
            <p className="font-semibold text-gray-900">{COACH_NAME}</p>
          </div>
        </div>
      </div>

      {/* Schedule by day */}
      <ScheduleDays days={days} nowMs={nowMs} member={member} />

      {/* Sunday closed notice */}
      <div className="mt-6 rounded-xl bg-gray-100 p-4 text-center">
        <p className="text-gray-600">
          <span className="font-semibold">Sunday:</span> Studio Closed
        </p>
      </div>
    </div>
  );
}
