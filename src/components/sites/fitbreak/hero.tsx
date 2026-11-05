import Image from "next/image";

import { Arrow, wrap } from "./editorial";
import { asset, contact } from "./links";
import { Scene } from "./motion/home-scenes";

/**
 * Full-bleed poster hero (ADR 0009): the studio photo edge to edge under a dark
 * scrim, a huge condensed headline, one crimson action and one text link.
 */
export function Hero() {
  return (
    <Scene kind="hero" className="fb-pre">
      <section
        data-placement="hero"
        className="fb-grain relative flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-ink text-paper"
      >
        <div data-hero-photo className="absolute inset-0 z-0">
          <Image
            src={asset("/images/fitbreak12.webp")}
            alt="A FitBreak member throwing a punch in a boxing glove"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          {/* Scrim: dark on the text side and along the bottom, clear over the face. */}
          <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/55 to-ink/0 max-lg:from-ink/85 max-lg:via-ink/70" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/80 to-transparent" />
        </div>

        <div className={`${wrap} relative z-10 pt-28 pb-14 lg:pb-20`}>
          <p data-hero-in className="fb-label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="bg-crimson px-2 py-1 text-white">Now open</span>
            <span className="text-paper/80">
              Women-only · 2nd Floor Roxas Drive, Brgy Ilaya, Calapan City
            </span>
          </p>

          <h1
            data-hero-title
            className="fb-display max-w-[14ch] text-[clamp(3.5rem,10.5vw,9.5rem)] text-paper"
          >
            FitBreak: For Every Moment You <span className="text-crimson">Choose Yourself</span>
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p data-hero-in className="max-w-xl text-lg leading-relaxed text-paper/85">
                A women-only fitness club offering one-hour bootcamp workouts that fit your busy
                life—so you can be strong, healthy, and happy.
              </p>
              <p data-hero-in className="fb-label mt-5 text-paper/65">
                Coach-led · Air-conditioned · Circuit training
              </p>
            </div>

            <div
              data-hero-in
              className="flex flex-wrap items-center gap-x-8 gap-y-5 lg:col-span-6 lg:justify-end"
            >
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-btn fb-btn--crimson min-h-14 px-8 text-lg"
              >
                Book Your First Class
              </a>
              <a href="#programs" className="fb-link text-paper hover:text-white">
                See Schedule
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>
    </Scene>
  );
}
