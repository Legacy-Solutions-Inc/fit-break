import Image from "next/image";

import { COACH_NAME, PROGRAMS, TIME_SLOTS, formatTime } from "@/services/fitbreak/catalog";

import { wrap } from "../editorial";
import { asset, classTimes, contact } from "../links";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const inlineLink =
  "font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep";

/**
 * Information Site schedule (Member Area parked): a read-only weekly timetable,
 * set like a printed studio timetable (ADR 0009). Days run as columns on wide
 * screens and as ruled rows on phones; every program runs at every time,
 * Monday–Saturday, and booking is a Messenger Booking Enquiry.
 */
export function WeeklyTimetable() {
  return (
    <>
      {/* Header */}
      <section className="bg-paper pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-7">
            <h1 className="fb-display text-[clamp(2.5rem,5.7vw,5rem)]">Class Schedule</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
              Classes run Monday to Saturday. Message us to book your spot.
            </p>
          </div>
          <div className="relative hidden aspect-[16/10] overflow-hidden bg-bone lg:col-span-5 lg:block">
            <Image
              src={asset("/images/fitbreak7.jpg")}
              alt="FitBreak workout session"
              fill
              sizes="(min-width: 1440px) 560px, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Booking line (replaces the members' credits banner) */}
      <section data-placement="schedule" className="bg-paper">
        <div className={wrap}>
          <div
            data-reveal
            className="flex flex-col gap-6 border-y-2 border-ink py-8 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="fb-label mb-2 text-mute">Ready to join a class?</p>
              <p className="fb-display text-[clamp(1.9rem,3.6vw,2.9rem)]">
                Message us to book your spot
              </p>
              <p className="mt-3 text-mute">
                or call{" "}
                <a href={contact.phoneHref} className={`fb-num ${inlineLink}`}>
                  {contact.phoneDisplay}
                </a>
              </p>
            </div>
            <a
              href={contact.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn fb-btn--crimson shrink-0 self-start lg:self-auto"
            >
              Message Us to Book
            </a>
          </div>
        </div>
      </section>

      {/* The week */}
      <section data-placement="schedule" className="bg-paper py-20 lg:py-28">
        <div className={wrap}>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <h2 className="fb-display text-[clamp(2.2rem,4.65vw,3.9rem)]">Monday – Saturday</h2>
              <p className="mt-4 text-mute">Every program at every time • 60 min • {COACH_NAME}</p>
            </div>
            {/* Week summary */}
            <dl className="divide-y divide-ink/15 border-y border-ink/15 sm:grid sm:grid-cols-[1.4fr_1fr_auto] sm:divide-x sm:divide-y-0 lg:col-span-5">
              <div className="flex items-baseline justify-between gap-4 py-3 sm:block sm:py-4 sm:pr-4">
                <dt className="fb-label text-mute">Schedule for</dt>
                <dd className="font-semibold sm:mt-1">Every Monday – Saturday</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3 sm:block sm:px-4 sm:py-4">
                <dt className="fb-label text-mute">All classes by</dt>
                <dd className="font-semibold sm:mt-1">{COACH_NAME}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3 sm:block sm:py-4 sm:pl-4">
                <dt className="fb-label text-mute">Programs</dt>
                <dd className="fb-num font-semibold sm:mt-1">{PROGRAMS.length}</dd>
              </div>
            </dl>
          </div>

          {/* Printed timetable: days as columns (desktop), ruled rows (phone). */}
          <ol
            aria-label="Class times by day"
            className="mt-14 border-y-2 border-ink lg:mt-20 lg:grid lg:grid-cols-7 lg:divide-x lg:divide-ink/15"
          >
            {days.map((day) => (
              <li
                key={day}
                className="grid grid-cols-[7.25rem_1fr] gap-3 border-b border-ink/15 py-5 last:border-b-0 lg:block lg:border-b-0 lg:px-4 lg:py-6 lg:first:pl-0"
              >
                <h3 className="fb-display pt-1 text-xl sm:text-2xl lg:mb-6 lg:border-b lg:border-ink/15 lg:pt-0 lg:pb-4">
                  {day}
                </h3>
                <ul
                  aria-label={`${day} class times`}
                  className="flex flex-wrap gap-x-5 gap-y-3 lg:block lg:space-y-5"
                >
                  {classTimes.map((t) => {
                    const [start, end] = t.split(" - ");
                    return (
                      <li key={t}>
                        <span className="sr-only">{t}</span>
                        <span aria-hidden="true" className="block">
                          <span className="fb-display fb-num block text-2xl lg:text-[2.25rem]">
                            {start}
                          </span>
                          <span className="fb-label block text-mute">to {end}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            {/* Sunday notice */}
            <li className="grid grid-cols-[7.25rem_1fr] gap-3 py-5 lg:block lg:px-4 lg:py-6">
              <h3 className="fb-display pt-1 text-xl sm:text-2xl lg:mb-6 lg:border-b lg:border-ink/15 lg:pt-0 lg:pb-4">
                Sunday
              </h3>
              <p className="pt-1 font-semibold text-mute lg:pt-0">
                <span className="sr-only">Sunday:</span> Studio Closed
              </p>
            </li>
          </ol>

          {/* Programs: numbered rows, each at every time. */}
          <ol className="mt-20 border-b border-ink/20 lg:mt-28">
            {PROGRAMS.map((program, i) => (
              <li
                key={program.id}
                data-reveal
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-3 border-t border-ink/20 py-7 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-12 lg:gap-x-10 lg:py-9"
              >
                <span className="fb-label fb-num text-mute lg:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lg:col-span-5">
                  <h3 className="fb-display text-[clamp(1.9rem,3.85vw,3.2rem)]">{program.name}</h3>
                  <p className="mt-2 text-mute">{program.description}</p>
                </div>
                <ul
                  className="fb-num col-start-2 flex flex-wrap gap-x-6 gap-y-2 font-semibold lg:col-span-6 lg:col-start-auto lg:justify-end"
                  aria-label={`${program.name} class times`}
                >
                  {TIME_SLOTS.map((time) => (
                    <li key={time}>{formatTime(time)}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <a
              href={contact.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn fb-btn--ink self-start"
            >
              Message Us to Book
            </a>
            <p className="text-mute">
              or call{" "}
              <a href={contact.phoneHref} className={`fb-num ${inlineLink}`}>
                {contact.phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
