import Image from "next/image";

import { COACH_NAME, PROGRAMS, TIME_SLOTS, formatTime } from "@/services/fitbreak/catalog";

import { asset, contact } from "../links";

/**
 * Information Site schedule (Member Area parked): a read-only weekly timetable.
 * Same look as the live schedule (header, brand banner, day card with program
 * gradients) but every program/time is shown once for Monday–Saturday, slots are
 * plain labels, and booking is a Messenger Booking Enquiry.
 */
export function WeeklyTimetable() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600">
            Classes run Monday to Saturday. Message us to book your spot.
          </p>
        </div>
        <div className="relative hidden h-48 overflow-hidden rounded-2xl shadow-lg lg:block">
          <Image
            src={asset("/images/fitbreak7.jpg")}
            alt="FitBreak workout session"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Booking banner (replaces the members' credits banner) */}
      <div className="mb-6 rounded-xl bg-linear-to-r from-brand-500 to-brand-600 p-5 text-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm text-brand-100">Ready to join a class?</p>
            <p className="text-2xl font-bold">Message us to book your spot</p>
            <p className="mt-1 text-sm text-brand-100">
              or call{" "}
              <a href={contact.phoneHref} className="font-semibold text-white underline">
                {contact.phoneDisplay}
              </a>
            </p>
          </div>
          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Message Us to Book
          </a>
        </div>
      </div>

      {/* Week summary */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Schedule for</p>
            <p className="text-lg font-bold text-gray-900">Every Monday – Saturday</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">All classes by</p>
            <p className="font-semibold text-gray-900">{COACH_NAME}</p>
          </div>
        </div>
      </div>

      {/* Weekly day card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-brand-500 bg-brand-50 shadow-xs">
        <div className="bg-linear-to-r from-brand-500 to-brand-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Monday – Saturday</h2>
              <p className="text-sm text-brand-100">
                Every program at every time • 60 min • {COACH_NAME}
              </p>
            </div>
            <p className="text-right text-sm text-brand-100">{PROGRAMS.length} Programs</p>
          </div>
        </div>
        <div className="p-4">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <li
                key={program.id}
                className={`fb-lift rounded-xl bg-linear-to-br ${program.color} p-4 text-white`}
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold">{program.name}</h3>
                  <p className="text-sm text-white/90">{program.description}</p>
                </div>
                <ul className="grid grid-cols-2 gap-2" aria-label={`${program.name} class times`}>
                  {TIME_SLOTS.map((time) => (
                    <li
                      key={time}
                      className="rounded-lg bg-white/90 px-2 py-2 text-center text-xs font-semibold text-gray-800"
                    >
                      {formatTime(time)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sunday notice */}
      <div className="mb-6 rounded-xl bg-gray-100 p-4 text-center">
        <p className="text-gray-600">
          <span className="font-semibold">Sunday:</span> Studio Closed
        </p>
      </div>

      <div className="text-center">
        <a
          href={contact.messenger}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
        >
          Message Us to Book
        </a>
        <p className="mt-3 text-sm text-gray-500">
          or call{" "}
          <a href={contact.phoneHref} className="font-medium text-brand-700 hover:underline">
            {contact.phoneDisplay}
          </a>
        </p>
      </div>
    </div>
  );
}
