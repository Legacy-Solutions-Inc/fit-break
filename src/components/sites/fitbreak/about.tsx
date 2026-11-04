import Image from "next/image";

import { ArrowLink, wrap } from "./editorial";
import { asset, routes } from "./links";
import { Scene } from "./motion/home-scenes";

/** The studio in four numbers — set as one line of type, not tiles. */
const stats = [
  { value: "60", label: "minutes per class." },
  { value: "4", label: "classes a day." },
  { value: "6", label: "days a week." },
  { value: "8–12", label: "women per class." },
];

export function About() {
  return (
    <Scene kind="about">
      <section id="about" className="overflow-hidden border-t border-rule bg-paper py-20 lg:py-32">
        <div className={wrap}>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5 lg:pt-6">
              <p data-about-in className="fb-label mb-4 text-mute">
                Why we exist
              </p>
              <h2 data-about-in className="fb-display mb-8 text-[clamp(2.75rem,7vw,5.75rem)]">
                About FitBreak
              </h2>
              <p data-about-lines className="mb-8 max-w-lg text-xl leading-relaxed text-ink/80">
                You juggle being a mother, wife, and a professional. We built FitBreak so you can
                finally put <em>you</em> on the list—without guilt. We redefine the pause as fuel.
                When you stop to move, you return stronger for everyone and everything that matters.
              </p>
              <div data-about-in>
                <ArrowLink href={routes.ourStory}>Read Our Full Story</ArrowLink>
              </div>
            </div>

            {/* Two photos, offset and overlapping — not a matched pair. */}
            <div className="relative lg:col-span-6 lg:col-start-7">
              <div
                data-about-photo
                className="relative ml-auto aspect-[4/5] w-[78%] overflow-hidden bg-bone"
              >
                <Image
                  src={asset("/images/fitbreak7.jpg")}
                  alt="Women working out together"
                  fill
                  sizes="(min-width: 1024px) 40vw, 78vw"
                  className="object-cover object-top"
                />
              </div>
              <div
                data-about-photo
                className="absolute bottom-[-8%] left-0 aspect-square w-[46%] overflow-hidden border-8 border-paper bg-bone"
              >
                <Image
                  src={asset("/images/fitbreak3.jpg")}
                  alt="A member stretching on a FitBreak yoga mat"
                  fill
                  sizes="(min-width: 1024px) 24vw, 46vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <p
            data-about-stats
            className="fb-display mt-28 max-w-[22ch] text-[clamp(2.25rem,5.6vw,5rem)] leading-[0.95] lg:mt-36"
          >
            {stats.map((s) => (
              <span key={s.label} data-about-stat className="mr-[0.25em] inline-block">
                <span className="fb-num">{s.value}</span>{" "}
                <span className="text-mute/70">{s.label}</span>
              </span>
            ))}
          </p>
        </div>
      </section>
    </Scene>
  );
}
