import Link from "next/link";

import {
  PROGRAMS,
  TIME_SLOTS,
  addDays,
  classStart,
  formatDateKey,
  formatTime,
  toDateKey,
  weekdayOf,
} from "@/services/fitbreak/catalog";
import type { Booking } from "@/services/fitbreak/members";

import { routes } from "../links";
import { BookSlotButton } from "./booking-provider";
import { MyBookings, type BookingView } from "./my-bookings";

// bookings.html + bookings.js: "Book a Class" weekly cards (one program per
// weekday, each time books the next occurrence) and the member's bookings.

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** bookings.js getNextClassDate: next studio date for `weekday` whose `time` hasn't passed. */
function nextClassDate(weekday: number, time: string, now: Date): string {
  const today = toDateKey(now);
  let daysUntil = (weekday - weekdayOf(today) + 7) % 7;
  if (daysUntil === 0 && classStart(today, time).getTime() < now.getTime()) daysUntil = 7;
  return addDays(today, daysUntil);
}

export function Bookings({
  now,
  bookings,
  counts,
}: {
  now: Date;
  bookings: Booking[];
  counts: Record<string, number>;
}) {
  // Weekly cards, sorted by their next available date (bookings.js renderSchedule).
  const days = DAY_NAMES.map((day, i) => {
    const program = PROGRAMS[i]!;
    return { day, program, weekday: i + 1, nextDate: nextClassDate(i + 1, TIME_SLOTS[0], now) };
  }).sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const views: BookingView[] = [...bookings]
    .sort((a, b) => classStart(b.date, b.time).getTime() - classStart(a.date, a.time).getTime())
    .map(({ id, programId, programName, date, time, status }) => ({
      id,
      programId,
      programName,
      date,
      time,
      status,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Book a Class</h1>
        <p className="text-gray-600">Choose your class and reserve your spot</p>
      </div>

      {/* Weekly schedule */}
      <div className="mb-12" id="book-class">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Weekly Schedule</h2>
        <div id="weekly-schedule" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {days.map(({ day, program, weekday, nextDate }) => (
            <div
              key={day}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all hover:shadow-lg"
            >
              <Link
                href={`${routes.home}#programs`}
                className="mb-1 block text-xl font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                {program.name}
              </Link>
              <span className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                {day} • Next: {formatDateKey(nextDate, { month: "short", day: "numeric" })}
              </span>
              <p className="mb-4 text-sm text-gray-600">{program.description}</p>
              <div className="space-y-2">
                {TIME_SLOTS.map((time) => (
                  <BookSlotButton
                    key={time}
                    slot={{ programId: program.id, date: nextClassDate(weekday, time, now), time }}
                    className="w-full rounded-xl bg-linear-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg"
                  >
                    Book {formatTime(time)}
                  </BookSlotButton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My bookings */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Bookings</h2>
        <MyBookings bookings={views} counts={counts} nowMs={now.getTime()} />
      </div>
    </div>
  );
}
