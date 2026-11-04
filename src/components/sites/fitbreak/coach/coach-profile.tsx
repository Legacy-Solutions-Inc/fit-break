import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Arrow, ArrowLink, SectionHead, wrap } from "../editorial";
import { asset, contact, routes } from "../links";
import { CertificationIcon, type CertificationIconName } from "./certification-icons";

const certifications: ReadonlyArray<{
  icon: CertificationIconName;
  title: string;
  text: string;
}> = [
  {
    icon: "badgeCheck",
    title: "Certified Personal Trainer",
    text: "Professional certification in personal training and fitness instruction",
  },
  {
    icon: "bolt",
    title: "Functional Fitness Essentials",
    text: "Specialized in functional movement patterns and training",
  },
  {
    icon: "clipboard",
    title: "Functional Anatomy & Adaptive Fitness",
    text: "Training in anatomy and adaptive fitness techniques",
  },
  {
    icon: "eye",
    title: "Movement Analysis & Corrective Strategies",
    text: "Expert in identifying and correcting movement patterns",
  },
  {
    icon: "heart",
    title: "Obesity Exercise Specialist",
    text: "Specialized training for weight management clients",
  },
  {
    icon: "bookOpen",
    title: "Nutrition Essentials",
    text: "Certified in nutrition fundamentals and dietary guidance",
  },
  {
    icon: "chartBar",
    title: "Nutrition for Obesity & Weight Management",
    text: "Advanced certification in weight management nutrition",
  },
  {
    icon: "fire",
    title: "HIIT FIT Certified Instructor",
    text: "Certified to lead high-intensity interval training",
  },
  {
    icon: "bolt",
    title: "Certified MetCon L1 Specialist",
    text: "Metabolic conditioning specialist certification",
  },
];

const expertise = [
  "Body Transformation",
  "Weight Loss & Fat Loss",
  "Muscle Gain & Strength Building",
  "Weight Gain Programs",
  "Functional & Circuit Training",
  "HIIT & MetCon Workouts",
  "Body Toning & Sculpting",
  "Fitness for Obesity & Weight Management",
  "Corrective Exercise for Movement Issues",
];

const reasons = [
  "A supportive and judgment-free community",
  "A safe space designed exclusively for women",
  "Training that fits into their demanding lives",
  "A way to reclaim their energy, health, and confidence",
];

/** Mixed sizes, bottom-aligned (as on the homepage photo strip). */
const gallery = [
  {
    src: "/images/fitbreak5.jpg",
    alt: "FitBreak gym",
    cls: "col-span-12 aspect-[3/2] sm:col-span-5",
  },
  {
    src: "/images/fitbreak6.jpg",
    alt: "Women training together",
    cls: "col-span-7 aspect-[4/5] sm:col-span-3",
  },
  {
    src: "/images/fitbreak3.jpg",
    alt: "FitBreak branded mat",
    cls: "col-span-5 aspect-square sm:col-span-2",
  },
  {
    src: "/images/stretching-lady.jpg",
    alt: "Boxing workout",
    cls: "col-span-12 aspect-[3/2] sm:col-span-2 sm:aspect-[3/4]",
  },
];

const h2 = "fb-display text-[clamp(2.5rem,6vw,5rem)]";
const num = (i: number) => String(i + 1).padStart(2, "0");

/** calapan1/about.html — "Meet Coach Iren" profile, set in the editorial system (ADR 0009). */
export function CoachProfile() {
  return (
    <>
      {/* Profile: sharp portrait beside the big name heading (5/7). */}
      <section className="bg-paper pt-10 pb-20 lg:pt-16 lg:pb-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="relative aspect-[2/3] overflow-hidden bg-bone lg:col-span-5">
            <Image
              src={asset("/images/iren_new.jpg")}
              alt="Coach Iren San Buenaventura"
              fill
              sizes="(min-width: 1440px) 560px, (min-width: 1024px) 40vw, 100vw"
              priority
              className="object-cover object-top"
            />
          </div>

          <div className="lg:col-span-7 lg:pb-4">
            <p className="fb-label mb-5 text-mute">The Woman Behind FitBreak</p>
            <h1 className="fb-display text-[clamp(3.5rem,10vw,9rem)]">
              Meet Coach <span className="text-crimson">Iren</span>
            </h1>

            <div className="mt-12 grid gap-8 border-t-2 border-ink pt-8 xl:grid-cols-7 xl:gap-10">
              <div className="xl:col-span-3">
                <p className="fb-label mb-3 text-mute">FitBreak Owner &amp; Head Coach</p>
                <h2 className="fb-display mb-4 text-[clamp(2rem,3.5vw,3rem)]">
                  Iren San Buenaventura
                </h2>
                <p className="font-semibold">
                  Certified Personal Trainer, Body Transformation Specialist &amp; Women&apos;s
                  Wellness Advocate
                </p>
              </div>
              <div className="xl:col-span-4">
                <p className="mb-8 text-lg leading-relaxed text-ink/80">
                  With more than 7 years of professional experience in the fitness industry, Iren
                  has dedicated her career to helping women reclaim their strength, confidence, and
                  well-being.
                </p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                  <a
                    href={contact.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fb-btn fb-btn--crimson"
                  >
                    Book a Class with Iren
                  </a>
                  <ArrowLink href="#certifications">View Certifications</ArrowLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story: heading left, readable text column right, then the philosophy line. */}
      <section className="border-t border-rule bg-paper py-20 lg:py-32">
        <div className={wrap}>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <h2 className={`${h2} lg:col-span-5`}>Meet Iren: The Woman Behind FitBreak</h2>
            {/* Source adds `prose prose-lg`, but the typography plugin isn't in its
                compiled CSS, so those classes do nothing on the live page. */}
            <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-ink/80 lg:col-span-6 lg:col-start-7">
              <p>
                Iren San Buenaventura is a certified personal trainer, body transformation
                specialist, and one of the few certified women&apos;s fitness coaches in the
                industry.
              </p>
              <p>
                Her journey into fitness began long before FitBreak was founded. As a woman,
                professional, and mental health advocate, Iren deeply understands the struggle of
                balancing work, family, and personal health. She is also very personally aware of
                how conscious women can be about their bodies.
              </p>
              <p>
                She started FitBreak to become the safe space she wished existed years ago—a
                women-only fitness studio where every woman can feel safe, be empowered, and get
                stronger physically and mentally.
              </p>
            </div>
          </div>

          <figure data-reveal className="mt-20 border-t-2 border-ink pt-8 lg:mt-28">
            <figcaption className="fb-label mb-6 text-mute">
              Today, FitBreak stands as a reflection of Iren&apos;s philosophy:
            </figcaption>
            <blockquote className="fb-display max-w-[20ch] text-[clamp(2.5rem,6.5vw,6rem)]">
              &quot;Strength is not just physical—it is emotional, mental, and deeply
              personal.&quot;
            </blockquote>
          </figure>
        </div>
      </section>

      {/* Certifications: a numbered ruled list. */}
      <section
        id="certifications"
        className="scroll-mt-16 border-t border-rule bg-bone py-20 lg:py-32"
      >
        <div className={wrap}>
          <SectionHead
            title="Professional Certifications"
            aside={
              <p>
                Iren has undergone extensive professional development and holds multiple fitness
                training, nutrition, and coaching certifications.
              </p>
            }
          />

          <ol className="mt-14 border-b border-ink/20 lg:mt-20">
            {certifications.map((c, i) => (
              <li
                key={c.title}
                data-reveal
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-2 border-t border-ink/20 py-6 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-12 lg:gap-x-10 lg:py-7"
              >
                <span className="fb-label fb-num text-mute lg:col-span-1">{num(i)}</span>
                <h3 className="fb-display text-[clamp(1.6rem,2.6vw,2.4rem)] lg:col-span-6">
                  {c.title}
                </h3>
                <p className="col-start-2 text-mute lg:col-span-4 lg:col-start-auto">{c.text}</p>
                <CertificationIcon
                  name={c.icon}
                  className="hidden h-5 w-5 self-center justify-self-end text-ink/40 lg:col-span-1 lg:block"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Expertise: plain ruled list in columns. */}
      <section className="border-t border-rule bg-paper py-20 lg:py-32">
        <div className={wrap}>
          <SectionHead
            title="Coaching Expertise"
            aside={
              <p>
                Iren specializes in women-focused fitness programs designed to help members reach
                their transformation goals safely and effectively.
              </p>
            }
          />

          <ul className="mt-14 grid border-b border-ink/20 sm:grid-cols-2 sm:gap-x-10 lg:mt-20 lg:grid-cols-3">
            {expertise.map((item) => (
              <li key={item} className="flex gap-4 border-t border-ink/20 py-5 text-lg">
                <span className="text-crimson" aria-hidden="true">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-ink/80">
            FitBreak&apos;s signature one-hour bootcamp classes are built from Iren&apos;s training
            methodologies—short, powerful, structured, and proven effective for busy women with
            limited time.
          </p>
        </div>
      </section>

      {/* Why FitBreak: dark band. */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-8`}>Why She Built FitBreak</h2>
            <p className="max-w-lg text-xl leading-relaxed text-paper/80">
              Iren knows what it&apos;s like to prioritize everyone else first—family, work,
              responsibilities—leaving almost no time for self-care. She wanted to change that
              narrative for all women.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="divide-y divide-paper/15 border-y border-paper/15">
              {reasons.map((r, i) => (
                <li
                  key={r}
                  data-reveal
                  className="grid grid-cols-[3rem_1fr] items-baseline gap-4 py-5 text-lg"
                >
                  <span className="fb-label fb-num text-paper/70">{num(i)}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
            <p className="fb-display mt-12 text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[0.95]">
              Her mission is simple: Help women become the strongest, healthiest, happiest version
              of themselves.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery + club rules link */}
      <section className="bg-paper py-20 lg:py-32">
        <div className={wrap}>
          <h2 className={`${h2} mb-12 lg:mb-16`}>The FitBreak Experience</h2>
          <div className="grid grid-cols-12 items-end gap-3 sm:gap-4">
            {gallery.map((img) => (
              <div key={img.src} className={cn("relative overflow-hidden bg-bone", img.cls)}>
                <Image
                  src={asset(img.src)}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1440px) 600px, (min-width: 640px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <Link
            href={routes.clubRules}
            className="group mt-14 grid grid-cols-[1fr_auto] items-center gap-6 border-y-2 border-ink py-7 transition-colors hover:bg-bone/60 lg:grid-cols-12 lg:gap-10"
          >
            <h3 className="fb-display text-[clamp(2rem,4vw,3.5rem)] transition-colors group-hover:text-crimson lg:col-span-5">
              Club House Rules
            </h3>
            <p className="col-start-1 row-start-2 text-mute lg:col-span-5 lg:col-start-auto lg:row-start-auto">
              10 rules to keep FitBreak safe, empowering, and respectful for every woman.
            </p>
            <Arrow className="h-4 w-8 justify-self-end lg:col-span-2" />
          </Link>
        </div>
      </section>

      {/* Message */}
      <section className="border-t border-rule bg-bone py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <h2 className={`${h2} lg:col-span-4`}>A Message From Coach Iren</h2>
          <div className="lg:col-span-7 lg:col-start-6">
            <blockquote className="mb-12 border-l-2 border-crimson pl-6 text-[clamp(1.375rem,2.4vw,2rem)] leading-snug font-medium lg:pl-10">
              &quot;Fitness is not about perfection. It&apos;s about progress, discipline, and
              choosing yourself every single day. FitBreak is your space to grow, transform, and
              rediscover who you can be when you finally put yourself first.&quot;
            </blockquote>
            <div className="border-t border-ink/20 pt-6">
              <p className="fb-display mb-3 text-3xl">A Coach Who Walks the Talk</p>
              <p className="max-w-2xl leading-relaxed text-mute">
                Whether she&apos;s leading a class, designing a fitness program, or training, Iren
                leads by example. Her passion, discipline, and positive energy inspire every
                FitBreak member to show up—for themselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-rule bg-paper py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-7">
            <h2 className="fb-display mb-8 text-[clamp(3rem,8vw,7rem)]">
              Ready to Train with Coach Iren?
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-ink/80">
              Join FitBreak and experience coach-led bootcamp classes designed specifically for
              women. Your transformation journey starts here.
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <dl className="mb-8 divide-y divide-ink/15 border-y border-ink/20">
              <div className="grid grid-cols-[5rem_1fr] items-baseline gap-4 py-4">
                <dt className="fb-label text-mute">Phone</dt>
                <dd>
                  <a
                    href={contact.phoneHref}
                    className="fb-num font-medium hover:text-crimson-deep"
                  >
                    {contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-[5rem_1fr] items-baseline gap-4 py-4">
                <dt className="fb-label text-mute">Email</dt>
                <dd>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium break-all hover:text-crimson-deep"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={routes.schedule} className="fb-btn fb-btn--ink">
                View Class Schedule
              </Link>
              <ArrowLink href={routes.pricing}>See Membership Options</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
