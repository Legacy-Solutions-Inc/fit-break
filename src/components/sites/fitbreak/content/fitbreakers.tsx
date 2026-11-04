import Link from "next/link";

import { Icon } from "../icons";
import { routes } from "../links";
import { HeartIcon, SolidCheckCircle } from "./icons";

const whoTheyAre = [
  "Have spent years putting everyone else first",
  "Carry responsibilities at home, at work, and in their families",
  "Want to feel strong, confident, and comfortable in their own bodies",
  "Are tired of environments that judge, compare, or intimidate",
  "Need a space where they can move freely—without fear or pressure",
];

const theyMayFeel = [
  "Hesitant to walk into a gym",
  "Conscious of how they look",
  "Guilty for taking time for themselves",
];

const understands = [
  "Progress is personal",
  "Strength is built one session at a time",
  "Showing up—no matter how she feels—is already a win",
];

const beliefs = [
  "Fitness should feel safe, welcoming, and empowering",
  "Movement is a form of self-respect",
  "Confidence is built through consistency, not pressure",
  "A healthy woman creates a healthier family and community",
];

const mindset = [
  "Taking a break from guilt",
  "Taking a break from comparison",
  "Taking a break from shrinking yourself",
];

const card = "mb-6 rounded-xl bg-white p-8 shadow-xs";

/** Cloned from fitbreak.ph/fitbreakers.html (main content only). */
export function Fitbreakers() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 p-8 text-center text-white md:p-12">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Who Are the FitBreakers?</h1>
        <p className="text-xl text-brand-100">The Story Behind the Name</p>
      </div>

      {/* The Meaning Section */}
      <div className={card}>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          <strong className="text-brand-600">FitBreak</strong> comes from a simple but powerful
          idea: a <strong>&quot;Fitness Break.&quot;</strong>
        </p>
        <p className="mb-4 leading-relaxed text-gray-600">
          A FitBreak is a short pause in the middle of life&apos;s hustle—a moment where a woman
          steps away from her responsibilities, expectations, and pressures to focus on herself.
        </p>
        <div className="my-6 rounded-lg bg-brand-50 p-6">
          <p className="text-center text-brand-700 italic">
            It&apos;s the break she gives her body to move.
            <br />
            The break she gives her mind to breathe.
            <br />
            The break she gives her heart to remember who she is.
          </p>
        </div>
        <p className="mb-4 leading-relaxed text-gray-600">
          In a world where women are constantly expected to give, serve, and show up for everyone
          else, FitBreak is the reminder that <strong>self-care is not selfish.</strong>
        </p>
        <p className="text-lg font-medium text-gray-800">
          And the women who take that break? They are called{" "}
          <strong className="text-brand-600">FitBreakers.</strong>
        </p>
      </div>

      {/* The FitBreaker Identity */}
      <div className={card}>
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500">
            <HeartIcon className="h-5 w-5 text-white" />
          </span>
          The FitBreaker Identity
        </h2>
        <p className="mb-4 leading-relaxed text-gray-600">
          FitBreakers are women who choose themselves—sometimes for the first time in their lives.
        </p>
        <p className="mb-4 leading-relaxed text-gray-600">
          They are not defined by a number on the scale, a dress size, or how long they&apos;ve been
          working out.
        </p>
        <div className="my-6 rounded-lg bg-gray-900 p-6 text-white">
          <p className="text-center text-xl font-bold">
            They are defined by a decision:
            <br />
            <span className="text-brand-400">&quot;Today, I choose me.&quot;</span>
          </p>
        </div>
        <p className="mb-4 leading-relaxed text-gray-600">
          FitBreakers understand that strength is not just physical—it is mental, emotional, and
          deeply personal.
        </p>
        <p className="leading-relaxed text-gray-600">
          They are wives, mothers, daughters, sisters, professionals, students. Some are starting
          their fitness journey again. Some are starting for the very first time.
        </p>
        <p className="mt-4 text-lg font-medium text-gray-800">
          What they have in common is not where they came from—but{" "}
          <strong>why they showed up.</strong>
        </p>
      </div>

      {/* Who FitBreakers Are */}
      <div className={card}>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Who FitBreakers Are</h2>
        <p className="mb-4 text-gray-600">FitBreakers are women who:</p>
        <ul className="mb-6 space-y-3">
          {whoTheyAre.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <SolidCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <span className="text-gray-600">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 text-gray-600">They may feel:</p>
        <ul className="ml-6 list-disc space-y-2 text-gray-600">
          {theyMayFeel.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-6 text-lg font-medium text-brand-600">
          But when they step into FitBreak, something changes.
        </p>
      </div>

      {/* What Makes a FitBreaker Different */}
      <div className={card}>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">What Makes a FitBreaker Different</h2>
        <p className="mb-4 leading-relaxed text-gray-600">
          A FitBreaker doesn&apos;t wait for the &quot;perfect time.&quot;
        </p>
        <p className="mb-4 leading-relaxed text-gray-600">
          She doesn&apos;t wait to be confident before she starts.
          <br />
          <strong className="text-gray-800">She starts to become confident.</strong>
        </p>
        <div className="my-6 rounded-lg bg-gray-50 p-6">
          <p className="mb-2 text-gray-700">A FitBreaker understands that:</p>
          <ul className="space-y-2 text-gray-600">
            {understands.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-brand-500">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="leading-relaxed text-gray-600">
          She celebrates effort, not perfection. She supports other women instead of comparing
          herself to them. She grows stronger in a space designed for her, not against her.
        </p>
      </div>

      {/* FitBreakers Believe */}
      <div className={card}>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">FitBreakers Believe That:</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {beliefs.map((item) => (
            <div key={item} className="rounded-lg bg-brand-50 p-5">
              <p className="font-medium text-brand-700">{item}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-gray-700">
          At FitBreak, FitBreakers are not just members.
          <br />
          <strong>
            They are a community of women lifting each other up—physically and mentally.
          </strong>
        </p>
      </div>

      {/* The FitBreaker Mindset */}
      <div className={card}>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">The FitBreaker Mindset</h2>
        <p className="mb-4 text-gray-600">Being a FitBreaker means:</p>
        <ul className="mb-6 space-y-3">
          {mindset.map((item) => (
            <li key={item} className="flex items-center gap-3 text-gray-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <Icon name="check" className="h-4 w-4 text-brand-600" />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="leading-relaxed text-gray-600">
          It means giving yourself permission to sweat, struggle, laugh, rest, and grow.
        </p>
        <p className="mt-4 text-lg font-medium text-gray-800">
          Because sometimes, stopping—taking a break—is what makes you stronger.
        </p>
      </div>

      {/* This Is What It Means */}
      <div className="mb-6 rounded-xl bg-linear-to-br from-gray-900 to-gray-800 p-8 text-white">
        <h2 className="mb-6 text-center text-2xl font-bold">
          This Is What It Means to Be a FitBreaker
        </h2>
        <p className="mb-6 text-center leading-relaxed text-gray-300">
          A FitBreaker is not trying to become someone else.
          <br />
          She is reconnecting with who she has always been.
        </p>
        <div className="space-y-2 text-center text-xl font-bold">
          <p className="text-brand-400">Strong.</p>
          <p className="text-brand-400">Capable.</p>
          <p className="text-brand-400">Worthy.</p>
        </div>
      </div>

      {/* Welcome */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="mb-2 text-2xl font-bold text-brand-700">Welcome to FitBreak.</p>
        <p className="mb-2 text-xl text-brand-600">Welcome to the community.</p>
        <p className="text-lg font-semibold text-brand-800">You are a FitBreaker.</p>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href={routes.schedule}
          className="inline-flex items-center rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
        >
          Book Your First Class
        </Link>
      </div>
    </div>
  );
}
