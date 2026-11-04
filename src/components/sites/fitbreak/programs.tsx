import Image from "next/image";

import { Arrow, ArrowLink, SectionHead, wrap } from "./editorial";
import { asset, routes } from "./links";
import { Scene } from "./motion/home-scenes";
import { TimetableStrip } from "./timetable-strip";

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

/** Class formats as numbered rows (ADR 0009) — the rule draws in, the name slides in. */
export function Programs() {
  return (
    <section id="programs" className="scroll-mt-16 border-t border-rule bg-paper py-20 lg:py-32">
      <div className={wrap}>
        <SectionHead
          label="Six formats, every day"
          title={<>Class Formats &amp; Schedule</>}
          aside={
            <p>
              All sessions are one-hour, coach-led bootcamps led by{" "}
              <a
                href={routes.coach}
                className="font-semibold text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-deep"
              >
                Coach Iren
              </a>
              . Classes run in circuit stations using functional equipment only – no big machines.
            </p>
          }
        />

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <TimetableStrip />
            <p className="mt-10">
              <ArrowLink href={routes.clubRules}>Read the 10 club house rules</ArrowLink>
            </p>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden bg-bone lg:col-span-5 lg:block">
            <Image
              src={asset("/images/fitbreak2.jpg")}
              alt="A FitBreak circuit class in session"
              fill
              sizes="(min-width: 1440px) 560px, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        <Scene kind="programs">
          <ol className="mt-20 border-b border-ink/20 lg:mt-28">
            {classes.map((c, i) => (
              <li key={c.id} className="relative">
                <span
                  data-program-rule
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-ink/20"
                />
                <a
                  id={c.id}
                  data-program-card
                  href={routes.schedule}
                  className="group grid scroll-mt-24 grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-2 py-7 transition-colors hover:bg-bone/60 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-12 lg:gap-x-10 lg:py-9"
                >
                  <span className="fb-label fb-num text-mute lg:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    data-program-name
                    className="fb-display text-[clamp(2.25rem,6vw,5.25rem)] transition-[color,translate] duration-300 group-hover:translate-x-2 group-hover:text-crimson lg:col-span-6"
                  >
                    {c.name}
                  </h3>
                  <p className="col-start-2 text-mute lg:col-span-3 lg:col-start-auto">{c.blurb}</p>
                  <span className="fb-label col-start-2 inline-flex items-center gap-2 whitespace-nowrap text-ink lg:col-span-2 lg:col-start-auto lg:justify-self-end">
                    <span className="text-mute">Daily ·</span> View Schedule
                    <Arrow />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </Scene>

        <div className="mt-12">
          <a href={routes.schedule} className="fb-btn fb-btn--ink">
            View Full Schedule
          </a>
        </div>
      </div>
    </section>
  );
}
