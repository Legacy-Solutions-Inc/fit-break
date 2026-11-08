import Link from "next/link";

import { classTimes, routes } from "../links";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Monday–Saturday programme rotation, as printed on how-it-works.html.
const rotation = [
  "Total Body Burn",
  "Tone & Tighten",
  "Cardio Crush",
  "Sculpt & Strength",
  "Core & Balance",
  "Booty & Burn",
] as const;

const lastRow = classTimes.length - 1;

/**
 * "Weekly Class Schedule" (#classes), set as a printed timetable: a ruled grid
 * of times × days on wide screens, one ruled row per day on phones. The last
 * slot runs all programs.
 */
export function ClassScheduleOverview() {
  return (
    <section id="classes" className="scroll-mt-24 border-t border-rule py-20 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 className="fb-display text-[clamp(2.2rem,4.65vw,3.9rem)] lg:col-span-7">
          Weekly Class Schedule
        </h2>
        <p className="text-lg text-mute lg:col-span-5 lg:pb-2">
          All classes are 1 hour long and led by Coach Iren
        </p>
      </div>

      {/* Wide screens: times down the side, days across the top. */}
      <table className="mt-14 hidden w-full table-fixed border-collapse md:table">
        <thead>
          <tr className="border-y-2 border-ink">
            <th
              scope="col"
              className="fb-label w-[11rem] py-4 pr-4 text-left text-mute lg:w-[14rem]"
            >
              Time
            </th>
            {days.map((d) => (
              <th key={d} scope="col" className="fb-label px-3 py-4 text-left text-ink">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/15 border-b border-ink/15">
          {classTimes.map((time, row) => (
            <tr key={time}>
              <th
                scope="row"
                className="fb-display fb-num py-5 pr-4 text-left text-2xl lg:text-3xl"
              >
                {time}
              </th>
              {rotation.map((program) => (
                <td key={program} className="fb-display px-3 py-5 text-base lg:text-lg">
                  {row === lastRow ? "All Programs" : program}
                </td>
              ))}
              <td className="px-3 py-5 text-mute">Closed</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones: one ruled row per day. */}
      <ol className="mt-12 border-y-2 border-ink md:hidden">
        {days.map((d, i) => {
          const program = rotation[i];
          return (
            <li key={d} className="border-b border-ink/15 py-5 last:border-b-0">
              <h3 className="fb-display mb-3 text-2xl">{d}</h3>
              {program ? (
                <dl className="space-y-2">
                  {classTimes.map((time, row) => (
                    <div key={time} className="grid grid-cols-[8.5rem_1fr] gap-3">
                      <dt className="fb-num font-semibold">{time}</dt>
                      <dd className="text-mute">{row === lastRow ? "All Programs" : program}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-mute">Closed</p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-sm text-mute">
        Class schedule may vary. Check the{" "}
        <Link
          href={routes.schedule}
          className="font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep"
        >
          Schedule page
        </Link>{" "}
        for real-time availability.
      </p>
    </section>
  );
}
