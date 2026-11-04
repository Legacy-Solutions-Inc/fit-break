import Image from "next/image";
import Link from "next/link";

import { Icon, SolidCheck } from "../icons";
import { asset, contact, routes } from "../links";
import { CertificationIcon, type CertificationIconName } from "./certification-icons";

const certifications: ReadonlyArray<{
  icon: CertificationIconName;
  /** Literal Tailwind classes: [tile background, icon colour]. */
  tone: readonly [string, string];
  title: string;
  text: string;
}> = [
  {
    icon: "badgeCheck",
    tone: ["bg-brand-100", "text-brand-600"],
    title: "Certified Personal Trainer",
    text: "Professional certification in personal training and fitness instruction",
  },
  {
    icon: "bolt",
    tone: ["bg-accent-100", "text-accent-600"],
    title: "Functional Fitness Essentials",
    text: "Specialized in functional movement patterns and training",
  },
  {
    icon: "clipboard",
    tone: ["bg-purple-100", "text-purple-600"],
    title: "Functional Anatomy & Adaptive Fitness",
    text: "Training in anatomy and adaptive fitness techniques",
  },
  {
    icon: "eye",
    tone: ["bg-yellow-100", "text-yellow-600"],
    title: "Movement Analysis & Corrective Strategies",
    text: "Expert in identifying and correcting movement patterns",
  },
  {
    icon: "heart",
    tone: ["bg-green-100", "text-green-600"],
    title: "Obesity Exercise Specialist",
    text: "Specialized training for weight management clients",
  },
  {
    icon: "bookOpen",
    tone: ["bg-orange-100", "text-orange-600"],
    title: "Nutrition Essentials",
    text: "Certified in nutrition fundamentals and dietary guidance",
  },
  {
    icon: "chartBar",
    tone: ["bg-blue-100", "text-blue-600"],
    title: "Nutrition for Obesity & Weight Management",
    text: "Advanced certification in weight management nutrition",
  },
  {
    icon: "fire",
    tone: ["bg-red-100", "text-red-600"],
    title: "HIIT FIT Certified Instructor",
    text: "Certified to lead high-intensity interval training",
  },
  {
    icon: "bolt",
    tone: ["bg-brand-100", "text-brand-600"],
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

const gallery = [
  { src: "/images/fitbreak5.jpg", alt: "FitBreak gym", width: 1430, height: 953 },
  { src: "/images/fitbreak6.jpg", alt: "Women training together", width: 1430, height: 953 },
  { src: "/images/fitbreak3.jpg", alt: "FitBreak branded mat", width: 1430, height: 911 },
  { src: "/images/stretching-lady.jpg", alt: "Boxing workout", width: 1431, height: 953 },
];

const secondaryPill =
  "rounded-full border border-gray-200 bg-white font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50";
const primaryPill =
  "rounded-full bg-brand-500 font-semibold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl";

/** calapan1/about.html — "Meet Coach Iren" profile (static; no page scripts). */
export function CoachProfile() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-linear-to-br from-brand-500 to-brand-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Meet Coach Iren</h1>
          <p className="text-xl text-white/90">The Woman Behind FitBreak</p>
        </div>
      </section>

      {/* Profile */}
      <section className="bg-linear-to-br from-brand-50 via-white to-accent-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={asset("/images/iren_new.jpg")}
                  alt="Coach Iren San Buenaventura"
                  width={1024}
                  height={1536}
                  sizes="(min-width: 1280px) 584px, (min-width: 1024px) 45vw, 100vw"
                  priority
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute -right-6 -bottom-6 -z-10 h-32 w-32 rounded-full bg-brand-200 opacity-50" />
              <div className="absolute -top-6 -left-6 -z-10 h-24 w-24 rounded-full bg-accent-200 opacity-50" />
            </div>

            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-bold text-brand-700">
                FitBreak Owner &amp; Head Coach
              </span>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
                Iren San Buenaventura
              </h2>
              <p className="mb-6 text-xl font-semibold text-brand-600">
                Certified Personal Trainer, Body Transformation Specialist &amp; Women&apos;s
                Wellness Advocate
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                With more than 7 years of professional experience in the fitness industry, Iren has
                dedicated her career to helping women reclaim their strength, confidence, and
                well-being.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={routes.schedule} className={`${primaryPill} px-6 py-3`}>
                  Book a Class with Iren
                </Link>
                <a href="#certifications" className={`${secondaryPill} px-6 py-3`}>
                  View Certifications
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Meet Iren: The Woman Behind FitBreak
          </h2>
          {/* Source adds `prose prose-lg`, but the typography plugin isn't in its
              compiled CSS, so those classes do nothing on the live page. */}
          <div className="max-w-none text-gray-600">
            <p className="mb-6">
              Iren San Buenaventura is a certified personal trainer, body transformation specialist,
              and one of the few certified women&apos;s fitness coaches in the industry.
            </p>
            <p className="mb-6">
              Her journey into fitness began long before FitBreak was founded. As a woman,
              professional, and mental health advocate, Iren deeply understands the struggle of
              balancing work, family, and personal health. She is also very personally aware of how
              conscious women can be about their bodies.
            </p>
            <p className="mb-6">
              She started FitBreak to become the safe space she wished existed years ago—a
              women-only fitness studio where every woman can feel safe, be empowered, and get
              stronger physically and mentally.
            </p>
            <p className="mt-8 mb-8 text-center text-xl font-semibold text-brand-600">
              Today, FitBreak stands as a reflection of Iren&apos;s philosophy:
              <br />
              <span className="text-gray-900">
                &quot;Strength is not just physical—it is emotional, mental, and deeply
                personal.&quot;
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="bg-linear-to-br from-gray-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Professional Certifications</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Iren has undergone extensive professional development and holds multiple fitness
              training, nutrition, and coaching certifications.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${c.tone[0]}`}
                >
                  <CertificationIcon name={c.icon} className={`h-6 w-6 ${c.tone[1]}`} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Coaching Expertise</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Iren specializes in women-focused fitness programs designed to help members reach
              their transformation goals safely and effectively.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {expertise.map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-xl bg-brand-50 p-4">
                <div className="h-3 w-3 rounded-full bg-brand-500" />
                <span className="font-medium text-gray-800">{item}</span>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-gray-600">
            FitBreak&apos;s signature one-hour bootcamp classes are built from Iren&apos;s training
            methodologies—short, powerful, structured, and proven effective for busy women with
            limited time.
          </p>
        </div>
      </section>

      {/* Why FitBreak */}
      <section className="bg-linear-to-br from-brand-500 to-brand-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold">Why She Built FitBreak</h2>
          <p className="mb-8 text-xl text-brand-100">
            Iren knows what it&apos;s like to prioritize everyone else first—family, work,
            responsibilities—leaving almost no time for self-care. She wanted to change that
            narrative for all women.
          </p>

          <div className="mx-auto mb-12 grid max-w-3xl gap-6 text-left md:grid-cols-2">
            {reasons.map((r) => (
              <div key={r} className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <SolidCheck className="mt-1 h-6 w-6 shrink-0 text-yellow-300" />
                  <span>{r}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xl font-semibold">
            Her mission is simple: Help women become the strongest, healthiest, happiest version of
            themselves.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            The FitBreak Experience
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((img) => (
              <Image
                key={img.src}
                src={asset(img.src)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 25vw, 50vw"
                className="h-48 w-full rounded-xl object-cover shadow-md transition-shadow hover:shadow-xl"
              />
            ))}
          </div>

          <Link
            href={routes.clubRules}
            className="group mt-8 block rounded-xl bg-linear-to-r from-gray-900 to-gray-800 p-6 transition-all hover:from-gray-800 hover:to-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500">
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
                className="h-6 w-6 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-brand-400"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* Message */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-linear-to-br from-brand-50 to-accent-50 p-8 text-center lg:p-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">A Message From Coach Iren</h2>
            {/* v3: a responsive text size resets line-height, so lg uses text-2xl's 2rem. */}
            <blockquote className="mb-8 text-xl leading-relaxed text-gray-700 italic lg:text-2xl lg:leading-8">
              &quot;Fitness is not about perfection. It&apos;s about progress, discipline, and
              choosing yourself every single day. FitBreak is your space to grow, transform, and
              rediscover who you can be when you finally put yourself first.&quot;
            </blockquote>
            <p className="text-lg font-semibold text-brand-600">A Coach Who Walks the Talk</p>
            <p className="mt-2 text-gray-600">
              Whether she&apos;s leading a class, designing a fitness program, or training, Iren
              leads by example. Her passion, discipline, and positive energy inspire every FitBreak
              member to show up—for themselves.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to Train with Coach Iren?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600">
            Join FitBreak and experience coach-led bootcamp classes designed specifically for women.
            Your transformation journey starts here.
          </p>

          <div className="mb-8 flex flex-wrap justify-center gap-6">
            <a
              href={contact.phoneHref}
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-brand-600"
            >
              <Icon name="phone" className="h-5 w-5" />
              <span className="font-medium">{contact.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-brand-600"
            >
              <Icon name="mail" className="h-5 w-5" />
              <span className="font-medium">{contact.email}</span>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href={routes.schedule} className={`${primaryPill} px-8 py-4`}>
              View Class Schedule
            </Link>
            <Link href={routes.pricing} className={`${secondaryPill} px-8 py-4`}>
              See Membership Options
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
