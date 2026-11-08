import { cn } from "@/lib/utils";

import { classTimes } from "./links";

/**
 * The five daily class times as a timetable strip: start times in big
 * condensed numerals along a rule, the end time small beneath each.
 */
export function TimetableStrip({ className }: { className?: string }) {
  return (
    <div className={cn("border-t-2 border-ink pt-5", className)}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="fb-label text-ink">Daily class times · Monday – Saturday</h3>
        <p className="fb-label text-mute">Closed every Sunday</p>
      </div>
      <ol className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {classTimes.map((t) => {
          const [start, end] = t.split(" - ");
          return (
            <li key={t} className="border-l border-rule pr-3 pl-4">
              <span className="sr-only">{t}</span>
              <span aria-hidden="true" className="block">
                <span className="fb-display fb-num block text-[clamp(2.35rem,4.05vw,3.45rem)]">
                  {start}
                </span>
                <span className="fb-label mt-2 block text-mute">to {end}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
