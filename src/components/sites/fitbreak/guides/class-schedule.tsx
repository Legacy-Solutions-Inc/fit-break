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

/** "Weekly Class Schedule" table (#classes). The last slot runs all programs. */
export function ClassScheduleOverview() {
  return (
    <div id="classes" className="mt-12 scroll-mt-24 rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Weekly Class Schedule</h2>
      <p className="mb-8 text-center text-gray-600">
        All classes are 1 hour long and led by Coach Iren
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-brand-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Time</th>
              {days.map((d) => (
                <th key={d} className="px-4 py-3 text-center font-semibold text-gray-900">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classTimes.map((time, row) => (
              <tr key={time}>
                <td className="px-4 py-4 font-semibold text-gray-700">{time}</td>
                {rotation.map((program) => (
                  <td key={program} className="px-4 py-4 text-center text-sm">
                    {row === classTimes.length - 1 ? "All Programs" : program}
                  </td>
                ))}
                <td className="px-4 py-4 text-center text-gray-400">Closed</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Class schedule may vary. Check the{" "}
        <Link href={routes.schedule} className="text-brand-600 hover:underline">
          Schedule page
        </Link>{" "}
        for real-time availability.
      </p>
    </div>
  );
}
