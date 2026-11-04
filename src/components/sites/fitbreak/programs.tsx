import Image from "next/image";

import { Icon } from "./icons";
import { asset, cardIn, classTimes, routes } from "./links";

const classes = [
  {
    id: "total-body-burn",
    name: "TOTAL BODY BURN",
    blurb: "Full-body strength and endurance workout.",
  },
  { id: "tone-and-tighten", name: "TONE & TIGHTEN", blurb: "Lower body and core toning session." },
  { id: "cardio-crush", name: "CARDIO CRUSH", blurb: "High-intensity cardio conditioning." },
  {
    id: "sculpt-and-strength",
    name: "SCULPT & STRENGTH",
    blurb: "Upper body strength and posture training.",
  },
  {
    id: "core-and-balance",
    name: "CORE & BALANCE",
    blurb: "Core stability and coordination workout.",
  },
  { id: "booty-and-burn", name: "BOOTY & BURN", blurb: "Glutes-focused endurance training." },
];

export function Programs() {
  return (
    <section id="programs" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Class Formats &amp; Schedule</h2>
            <p className="mb-4 text-gray-600">
              All sessions are one-hour, coach-led bootcamps led by{" "}
              <a href={routes.coach} className="text-brand-600 hover:underline">
                Coach Iren
              </a>
              . Classes run in circuit stations using functional equipment only – no big machines.
            </p>
          </div>
          <div className="relative hidden h-80 overflow-hidden rounded-2xl shadow-lg lg:block">
            <Image
              src={asset("/images/fitbreak2.jpg")}
              alt="FitBreak workout session"
              fill
              sizes="(min-width: 1280px) 600px, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="mb-8 rounded-xl bg-brand-50 p-4">
          <p className="mb-2 font-semibold text-gray-900">Daily Class Times (Monday - Saturday):</p>
          <div className="flex flex-wrap gap-3">
            {classTimes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">Closed every Sunday</p>
        </div>

        <a
          href={routes.clubRules}
          className="group mb-8 block rounded-xl bg-linear-to-r from-gray-900 to-gray-800 p-6 transition-all hover:from-gray-800 hover:to-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-500">
                <Icon name="checkCircle" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold text-white">Club House Rules</h3>
                <p className="text-sm text-gray-300">
                  10 rules to keep FitBreak safe, empowering, and respectful for every woman.
                </p>
              </div>
            </div>
            <Icon
              name="chevronRight"
              className="h-6 w-6 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-brand-400"
            />
          </div>
        </a>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, i) => (
            <a
              key={c.id}
              id={c.id}
              href={routes.schedule}
              style={cardIn(9 + i)}
              className="fb-card-in block scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Daily
              </span>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{c.name}</h3>
              <p className="mb-3 text-sm text-gray-600">{c.blurb}</p>
              <span className="text-sm font-semibold text-brand-600">View Schedule →</span>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={routes.schedule}
            className="relative z-10 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
          >
            <Icon name="calendar" className="pointer-events-none h-5 w-5" />
            View Full Schedule
          </a>
        </div>
      </div>
    </section>
  );
}
