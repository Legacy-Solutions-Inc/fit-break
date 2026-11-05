"use client";

import Link from "next/link";

import {
  COACH_NAME,
  MAX_CLASS_CAPACITY,
  PROGRAMS,
  TIME_SLOTS,
  classStart,
  formatDateKey,
  formatTime,
} from "@/services/fitbreak/catalog";

import { routes } from "../links";
import { BookSlotButton } from "./booking-provider";

// The day cards of schedule.js displaySchedule(). Rendered from compact props
// (rather than as a Server Component tree) because ~1,500 slot cells would
// otherwise bloat the RSC payload. `nowMs` comes from the server so SSR and
// hydration agree on which slots have "Passed".

export interface ScheduleMemberState {
  credits: number;
  /** Confirmed headcount, keyed `${date}|${time}|${programId}`. */
  counts: Record<string, number>;
  /** The member's own confirmed bookings, same key format. */
  mine: readonly string[];
}

const slotBase = "block rounded-lg px-2 py-2 text-xs";
const slotButton =
  "w-full rounded-lg bg-white px-2 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-100";

function Slot({
  date,
  time,
  programId,
  now,
  member,
}: {
  date: string;
  time: string;
  programId: string;
  now: number;
  member: ScheduleMemberState | null;
}) {
  const label = formatTime(time);
  const key = `${date}|${time}|${programId}`;
  const isTimePast = now > classStart(date, time).getTime();
  const bookedCount = member?.counts[key] ?? 0;
  const isFull = bookedCount >= MAX_CLASS_CAPACITY;

  if (isTimePast) {
    return (
      <span className={`${slotBase} bg-white/20 text-white/50`}>
        {label}
        <br />
        <span className="text-[10px]">Passed</span>
      </span>
    );
  }
  if (member?.mine.includes(key)) {
    return (
      <span className={`${slotBase} bg-white font-semibold text-gray-800`}>
        {label}
        <br />
        <span className="text-[10px] text-green-600">✓ Booked</span>
      </span>
    );
  }
  if (isFull) {
    return (
      <span className={`${slotBase} bg-red-100 font-semibold text-red-600`}>
        {label}
        <br />
        <span className="text-[10px]">Full ({bookedCount})</span>
      </span>
    );
  }
  if (member && member.credits >= 1) {
    return (
      <BookSlotButton slot={{ programId, date, time }} className={slotButton}>
        {label}
        <br />
        <span className="text-[10px] text-brand-600">
          {bookedCount > 0 ? `${bookedCount} booked` : "Available"}
        </span>
      </BookSlotButton>
    );
  }
  if (member) {
    return (
      <Link
        href={routes.pricing}
        className={`${slotBase} bg-white/30 text-white transition hover:bg-white/40`}
      >
        {label}
        <br />
        <span className="text-[10px]">Get Credits</span>
      </Link>
    );
  }
  return (
    <Link href={routes.login} className={`block ${slotButton}`}>
      {label}
      <br />
      <span className="text-[10px]">Sign In</span>
    </Link>
  );
}

export function ScheduleDays({
  days,
  nowMs,
  member,
}: {
  days: readonly string[];
  nowMs: number;
  member: ScheduleMemberState | null;
}) {
  return (
    <div id="schedule-container" className="space-y-4">
      {days.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center">
          <p className="text-gray-600">No upcoming classes available.</p>
        </div>
      ) : (
        days.map((date) => (
          <section
            key={date}
            aria-label={formatDateKey(date, { weekday: "long", month: "long", day: "numeric" })}
            className="mb-6 overflow-hidden rounded-xl border border-brand-500 bg-brand-50 shadow-xs"
          >
            <div className="bg-linear-to-r from-brand-500 to-brand-600 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {formatDateKey(date, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-brand-100">
                    Choose your program • 60 min • {COACH_NAME}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-brand-100">6 Programs Available</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PROGRAMS.map((program) => (
                  <div
                    key={program.id}
                    className={`bg-linear-to-br ${program.color} rounded-xl p-4 text-white`}
                  >
                    <Link href={`${routes.home}#${program.id}`} className="mb-3 block">
                      <h3 className="text-lg font-bold">{program.name}</h3>
                      <p className="text-sm text-white/80">{program.description}</p>
                    </Link>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <div key={time} className="text-center">
                          <Slot
                            date={date}
                            time={time}
                            programId={program.id}
                            now={nowMs}
                            member={member}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
