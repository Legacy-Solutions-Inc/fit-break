import Image from "next/image";
import Link from "next/link";

import { Arrow, wrap } from "../editorial";
import { asset, routes } from "../links";

const forList = [
  "Every Filipina woman who feels hesitant",
  "Those who lack confidence in their bodies",
  "Those who feel guilty putting themselves first",
  "Those who think they have to earn rest, strength, or self-care",
];

/** Three photos, offset and overlapping (not a matched row). */
const gallery = [
  {
    src: "/images/fitbreak1.jpg",
    alt: "FitBreak community",
    frame: "relative ml-auto aspect-[3/2] w-[80%]",
    sizes: "(min-width: 1024px) 36vw, 80vw",
  },
  {
    src: "/images/fitbreak4.jpg",
    alt: "FitBreak training",
    frame: "absolute bottom-0 left-0 aspect-[3/2] w-[50%] border-8 border-paper",
    sizes: "(min-width: 1024px) 23vw, 50vw",
  },
  {
    src: "/images/fitbreak7.jpg",
    alt: "FitBreak equipment",
    frame: "absolute top-0 left-[4%] aspect-[16/9] w-[38%] border-8 border-paper",
    sizes: "(min-width: 1024px) 17vw, 38vw",
  },
];

const body = "text-lg leading-relaxed text-ink/80";
const strongInk = "font-semibold text-ink";

/**
 * Cloned from fitbreak.ph/our-story.html (main content only), set as an
 * editorial long-read (ADR 0009): a 7-column text measure with photos offset to
 * the right, pull-quotes in display type and the "for" list as numbered rows.
 */
export function OurStory() {
  return (
    <article>
      {/* Opening */}
      <header className={`${wrap} pt-16 pb-12 lg:pt-28 lg:pb-16`}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="fb-display text-[clamp(2.8rem,7.3vw,6.65rem)] lg:col-span-8">Our Story</h1>
          <p className="fb-display text-[clamp(1.75rem,2.95vw,2.8rem)] text-mute lg:col-span-4 lg:pb-3">
            Why FitBreak Was Born
          </p>
        </div>
      </header>

      {/* Chapter one: the problem, with the main photo held on the right */}
      <section className="border-t border-rule pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-7">
            <p className="mb-10 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-snug font-medium text-ink">
              FitBreak was born from my own journey—not just as a fitness professional, but as a
              mother, a woman, and someone who understands how easily we forget ourselves while
              taking care of everyone else.
            </p>

            <div className="max-w-[40rem] space-y-6">
              <p className={body}>
                For many years, I saw the same story repeat itself. Women wanted to be healthy. They
                wanted to be strong. They wanted to move their bodies and feel good again.
              </p>
              <p className={body}>
                But many of them never walked through the doors of a gym—or if they did, they
                didn&apos;t stay.
              </p>
              <p className={body}>
                Not because they were lazy. Not because they didn&apos;t care. But because they
                didn&apos;t feel safe, comfortable, or accepted.
              </p>
              <p className={body}>
                Too often, fitness spaces made women feel watched, judged, or out of place. They
                felt conscious about their bodies. They felt pressure to &quot;look a certain
                way.&quot; They felt like they had to shrink themselves—physically and
                emotionally—just to belong.
              </p>
              <p className={body}>
                And when fitness no longer feels safe or enjoyable, it becomes easy to avoid it
                altogether.
              </p>
            </div>
          </div>

          <figure className="max-lg:-order-1 lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[4/5] overflow-hidden bg-bone max-lg:aspect-[3/2] lg:sticky lg:top-24">
              <Image
                src={asset("/images/fitbreak5.jpg")}
                alt="Women doing fitness at FitBreak"
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover object-[45%_center]"
              />
            </div>
          </figure>
        </div>
      </section>

      {/* Pull-quote */}
      <section className="border-t border-rule py-20 lg:py-28">
        <div className={wrap}>
          <span aria-hidden="true" className="mb-8 block h-1 w-16 bg-crimson" />
          <blockquote
            data-reveal
            className="fb-display max-w-[24ch] text-[clamp(2.05rem,3.95vw,3.75rem)] leading-[0.95]"
          >
            <p>
              &quot;That&apos;s when I realized something important: Women don&apos;t just need
              another gym.{" "}
              <span className="text-crimson">
                They need a space where they can be themselves.&quot;
              </span>
            </p>
          </blockquote>
        </div>
      </section>

      {/* Chapter two: FitBreak */}
      <section className="pb-20 lg:pb-28">
        <div className={`${wrap} grid lg:grid-cols-12 lg:gap-10`}>
          <div className="max-w-[40rem] space-y-6 lg:col-span-6 lg:col-start-7">
            <p className="text-[clamp(1.4rem,2.2vw,1.9rem)] leading-snug font-medium text-ink">
              That realization became <strong className="font-bold">FitBreak</strong>.
            </p>
            <p className={body}>
              FitBreak was created as a safe and comfortable space for women—a place where you
              don&apos;t have to explain yourself, compare yourself, or apologize for where you are
              in your journey. A place where you can show up exactly as you are.
            </p>
            <p className={body}>
              This is where women can relax, breathe, laugh, struggle, sweat, and grow—without fear
              of judgment.
            </p>
          </div>
        </div>
      </section>

      {/* Me-time band */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-28">
        <div className={`${wrap} relative z-10 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <h2 className="fb-display text-[clamp(2.2rem,4.65vw,3.9rem)] lg:col-span-7">
            FitBreak is more than a workout. It&apos;s me-time.
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-paper/75 lg:col-span-4 lg:col-start-9 lg:pb-2">
            It&apos;s the break you give yourself so you can recharge—physically, mentally, and
            emotionally. It&apos;s an investment in yourself, not because you are selfish, but
            because you matter.
          </p>
        </div>
      </section>

      {/* Chapter three: who it's for, with the photos offset and overlapping */}
      <section className="overflow-hidden py-20 lg:py-28">
        <div className={`${wrap} grid gap-16 lg:grid-cols-12 lg:gap-10`}>
          <div className="max-w-[40rem] space-y-6 lg:col-span-6">
            <p className={body}>
              FitBreak was built to empower wives, mothers, sisters, daughters—women who are so used
              to making everyone else a priority that they&apos;ve forgotten what it feels like to
              choose themselves.
            </p>
            <p className={body}>
              Here, we believe that when women become stronger—inside and out—they show up better
              for their families, their work, and their communities.
            </p>
          </div>

          <div className="relative pt-[16%] pb-[24%] lg:col-span-6 lg:col-start-7">
            {gallery.map((img) => (
              <div key={img.src} data-reveal className={`overflow-hidden bg-bone ${img.frame}`}>
                <Image
                  src={asset(img.src)}
                  alt={img.alt}
                  fill
                  sizes={img.sizes}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className={`${wrap} mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12 lg:gap-10`}>
          <h3 className="fb-display text-[clamp(1.9rem,3.5vw,3.05rem)] lg:col-span-4">
            FitBreak is for:
          </h3>
          <ol className="border-t border-ink/20 lg:col-span-8">
            {forList.map((item, i) => (
              <li
                key={item}
                data-reveal
                className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-ink/20 py-6 sm:grid-cols-[5rem_1fr] lg:py-7"
              >
                <span
                  aria-hidden="true"
                  className="fb-display fb-num text-[clamp(1.75rem,3vw,2.5rem)] text-crimson"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xl leading-snug text-ink lg:text-2xl">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={`${wrap} mt-20 grid lg:mt-28 lg:grid-cols-12 lg:gap-10`}>
          <div className="max-w-[40rem] space-y-6 lg:col-span-7">
            <p className={body}>
              These women are what we proudly call{" "}
              <strong className="font-bold text-crimson-deep">FitBreakers</strong>.
            </p>
            <p className={body}>
              FitBreakers are women who choose themselves. Women who discover that they are
              stronger, more capable, and more confident than they ever imagined.
            </p>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="border-t border-rule py-20 lg:py-28">
        <div className={wrap}>
          <blockquote
            data-reveal
            className="fb-display max-w-[18ch] text-[clamp(2.35rem,5.05vw,4.7rem)] leading-[0.92]"
          >
            <p>
              &quot;Because sometimes, stopping...{" "}
              <span className="text-crimson">is what makes you go.&quot;</span>
            </p>
          </blockquote>
        </div>
      </section>

      {/* Welcome, signed off by the owner */}
      <section className="border-t border-rule bg-bone/60 py-20 lg:py-28">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-7">
            <h2 className="fb-display mb-6 text-[clamp(2.2rem,4.65vw,3.9rem)]">
              Welcome to FitBreak
            </h2>
            <p className="mb-10 text-2xl leading-snug text-ink/80">
              Your strength. Your space. Your FitBreak.
            </p>

            <div className="flex items-end gap-5">
              <div className="relative h-28 w-20 flex-none overflow-hidden bg-bone">
                <Image
                  src={asset("/images/iren_new.jpg")}
                  alt="Iren San Buenaventura"
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                />
              </div>
              <div className="border-l border-ink/20 pl-5">
                <p className={`${strongInk} text-lg`}>Iren San Buenaventura</p>
                <p className="fb-label mt-1 text-mute">FitBreak Owner &amp; Coach</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <Link
              href={routes.schedule}
              className="group fb-btn fb-btn--ink min-h-14 px-6 sm:px-8 sm:text-lg"
            >
              Start Your FitBreak Journey
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
