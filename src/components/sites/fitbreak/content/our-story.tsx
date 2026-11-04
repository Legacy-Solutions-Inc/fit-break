import Image from "next/image";
import Link from "next/link";

import { Icon } from "../icons";
import { asset, routes } from "../links";
import { SolidCheckCircle } from "./icons";

const forList = [
  "Every Filipina woman who feels hesitant",
  "Those who lack confidence in their bodies",
  "Those who feel guilty putting themselves first",
  "Those who think they have to earn rest, strength, or self-care",
];

const gallery = [
  { src: "/images/fitbreak1.jpg", alt: "FitBreak community" },
  { src: "/images/fitbreak4.jpg", alt: "FitBreak training" },
  { src: "/images/fitbreak7.jpg", alt: "FitBreak equipment" },
];

/** Cloned from fitbreak.ph/our-story.html (main content only). */
export function OurStory() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-brand-500 to-brand-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Story</h1>
          <p className="text-xl text-white/90">Why FitBreak Was Born</p>
        </div>
      </section>

      {/* Story Content */}
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={asset("/images/fitbreak5.jpg")}
              alt="Women doing fitness at FitBreak"
              width={1430}
              height={953}
              priority
              sizes="(min-width: 768px) 704px, 100vw"
              className="h-auto w-full"
            />
          </div>

          <article className="max-w-none">
            <p className="mb-8 text-xl leading-relaxed text-gray-700">
              FitBreak was born from my own journey—not just as a fitness professional, but as a
              mother, a woman, and someone who understands how easily we forget ourselves while
              taking care of everyone else.
            </p>

            <p className="mb-6 leading-relaxed text-gray-700">
              For many years, I saw the same story repeat itself. Women wanted to be healthy. They
              wanted to be strong. They wanted to move their bodies and feel good again.
            </p>

            <p className="mb-6 leading-relaxed text-gray-700">
              But many of them never walked through the doors of a gym—or if they did, they
              didn&apos;t stay.
            </p>

            <p className="mb-6 leading-relaxed text-gray-700">
              Not because they were lazy. Not because they didn&apos;t care. But because they
              didn&apos;t feel safe, comfortable, or accepted.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              Too often, fitness spaces made women feel watched, judged, or out of place. They felt
              conscious about their bodies. They felt pressure to &quot;look a certain way.&quot;
              They felt like they had to shrink themselves—physically and emotionally—just to
              belong.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              And when fitness no longer feels safe or enjoyable, it becomes easy to avoid it
              altogether.
            </p>

            {/* Highlight Quote */}
            <div className="my-10 rounded-r-xl border-l-4 border-brand-500 bg-brand-50 p-6">
              <p className="text-xl font-semibold text-brand-700 italic">
                &quot;That&apos;s when I realized something important: Women don&apos;t just need
                another gym. They need a space where they can be themselves.&quot;
              </p>
            </div>

            <p className="mb-6 leading-relaxed text-gray-700">
              That realization became <strong>FitBreak</strong>.
            </p>

            <p className="mb-6 leading-relaxed text-gray-700">
              FitBreak was created as a safe and comfortable space for women—a place where you
              don&apos;t have to explain yourself, compare yourself, or apologize for where you are
              in your journey. A place where you can show up exactly as you are.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              This is where women can relax, breathe, laugh, struggle, sweat, and grow—without fear
              of judgment.
            </p>

            {/* Highlight Box */}
            <div className="my-10 rounded-2xl bg-gray-900 p-8 text-white">
              <h2 className="mb-4 text-2xl font-bold">
                FitBreak is more than a workout. It&apos;s me-time.
              </h2>
              <p className="leading-relaxed text-gray-300">
                It&apos;s the break you give yourself so you can recharge—physically, mentally, and
                emotionally. It&apos;s an investment in yourself, not because you are selfish, but
                because you matter.
              </p>
            </div>

            <p className="mb-6 leading-relaxed text-gray-700">
              FitBreak was built to empower wives, mothers, sisters, daughters—women who are so used
              to making everyone else a priority that they&apos;ve forgotten what it feels like to
              choose themselves.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              Here, we believe that when women become stronger—inside and out—they show up better
              for their families, their work, and their communities.
            </p>

            {/* Image Grid */}
            <div className="my-10 grid grid-cols-3 gap-4">
              {gallery.map((img) => (
                <div key={img.src} className="relative h-32 w-full overflow-hidden rounded-xl">
                  <Image
                    src={asset(img.src)}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 224px, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Who We're For */}
            <div className="my-10 rounded-2xl bg-brand-50 p-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">FitBreak is for:</h3>
              <ul className="space-y-3 text-gray-700">
                {forList.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <SolidCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mb-6 leading-relaxed text-gray-700">
              These women are what we proudly call{" "}
              <strong className="text-brand-600">FitBreakers</strong>.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              FitBreakers are women who choose themselves. Women who discover that they are
              stronger, more capable, and more confident than they ever imagined.
            </p>

            {/* Tagline */}
            <div className="my-12 border-t border-b border-gray-200 py-8 text-center">
              <p className="text-2xl font-bold text-brand-600 italic md:text-3xl">
                &quot;Because sometimes, stopping... is what makes you go.&quot;
              </p>
            </div>

            {/* Welcome */}
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Welcome to FitBreak</h2>
              <p className="mb-8 text-xl text-gray-600">
                Your strength. Your space. Your FitBreak.
              </p>

              <div className="inline-flex items-center gap-4 rounded-full bg-gray-100 px-6 py-4">
                <Image
                  src={asset("/images/iren_new.jpg")}
                  alt="Iren San Buenaventura"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <div className="text-left">
                  <p className="font-bold text-gray-900">Iren San Buenaventura</p>
                  <p className="text-sm text-gray-600">FitBreak Owner &amp; Coach</p>
                </div>
              </div>
            </div>
          </article>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href={routes.schedule}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl"
            >
              Start Your FitBreak Journey
              <Icon name="arrowRight" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
