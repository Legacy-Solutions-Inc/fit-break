import { Icon } from "../icons";
import { asset, contact } from "../links";
import { DocumentDownloadIcon, MessengerIcon, SolidCheckCircle } from "./icons";

const reasons = [
  "Women-only fitness studio",
  "Certified female coaches",
  "Fully air-conditioned facility",
  "Beginner-friendly, injury-safe functional workouts",
  "Supportive, non-intimidating environment",
];

const audiences = [
  "Companies and SMEs",
  "Schools, colleges & universities",
  "Government offices & agencies",
  "Banks & financial institutions",
  "NGOs & women-led organizations",
  "Employee wellness programs",
];

const MESSENGER_URL = "https://m.me/fitbreakstudioph";

/** Cloned from fitbreak.ph/corporate.html (main content only). */
export function Corporate() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-brand-500 to-brand-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            Corporate Group Program
          </span>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Stronger Women. Healthier Teams.</h1>
          <p className="text-xl text-white/90">
            Invest in your team&apos;s wellness with exclusive group rates
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="max-w-none">
            <p className="mb-8 text-xl leading-relaxed text-gray-700">
              At FitBreak, we believe that when women are supported in prioritizing their health,
              confidence, and well-being—everyone benefits.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              The FitBreak Corporate Group Program is designed for companies, schools, and
              organizations that want to invest in women&apos;s wellness through a safe, supportive,
              and results-driven fitness environment—while enjoying significant group savings.
            </p>

            {/* Why Organizations Choose FitBreak */}
            <div className="my-10 rounded-2xl bg-brand-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Why Organizations Choose FitBreak
              </h2>
              <p className="mb-6 text-gray-700">
                FitBreak is proudly the <strong>first women-only fitness studio in Mindoro</strong>,
                created specifically for women who may feel intimidated, unsafe, or uncomfortable in
                traditional gyms.
              </p>
              <p className="mb-6 text-gray-700">
                Our members include beginners, working professionals, mothers, educators, and
                leaders—many of whom are starting their fitness journey for the first time.
              </p>
              <ul className="space-y-3 text-gray-700">
                {reasons.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <SolidCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-semibold text-brand-600 italic">
                This is fitness designed for women, by women.
              </p>
            </div>

            {/* Corporate Rate Highlight */}
            <div className="my-10 rounded-2xl bg-gray-900 p-8 text-center text-white">
              <h2 className="mb-2 text-2xl font-bold">Corporate Group Rate</h2>
              <p className="mb-6 text-gray-300">
                Organizations that enroll at least 5 women and maintain 5 active package-paying
                members qualify for our exclusive corporate rate:
              </p>
              <div className="mb-2 text-5xl font-bold text-brand-400">&#8369;200</div>
              <p className="mb-4 text-xl text-gray-300">per class, per person</p>
              <span className="inline-block rounded-full bg-brand-500 px-4 py-2 font-bold text-white">
                42% OFF the regular drop-in rate
              </span>
              <p className="mt-6 text-sm text-gray-400">
                This special rate encourages accountability, consistency, and team motivation—key
                drivers of long-term wellness success.
              </p>
            </div>

            {/* Eligible Packages */}
            <h2 className="mt-12 mb-6 text-2xl font-bold text-gray-900">Eligible Packages</h2>
            <p className="mb-6 text-gray-700">
              To qualify for the Corporate Group Program, all group members must purchase one of the
              following packages:
            </p>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {["12", "20"].map((count) => (
                <div
                  key={count}
                  className="rounded-xl border-2 border-brand-500 bg-white p-6 text-center"
                >
                  <div className="text-3xl font-bold text-brand-600">{count}</div>
                  <p className="font-medium text-gray-700">Class Package</p>
                </div>
              ))}
            </div>

            {/* `mb-10` in the source is absent from its compiled CSS, so it is dropped. */}
            <div className="rounded-r-xl border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-red-700">
                <strong>Note:</strong> 6-Class Packages and Drop-In Classes are not eligible for
                this program.
              </p>
            </div>

            {/* Program Requirements */}
            <h2 className="mt-12 mb-6 text-2xl font-bold text-gray-900">
              Program Requirements &amp; Conditions
            </h2>
            <p className="mb-6 text-gray-700">
              To ensure fairness and sustainability of the program, the following conditions apply:
            </p>

            <ul className="mb-6 space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <Step n={1} />
                <span>
                  A minimum of <strong>5 members</strong> must sign up together
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Step n={2} />
                <span>
                  The group must <strong>maintain at least 5 active, package-paying members</strong>{" "}
                  at all times
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Step n={3} />
                <span>If the group falls below the minimum requirement:</span>
              </li>
            </ul>

            {/* Source's `border-amber-500` / `mb-10` are absent from its compiled CSS, so the
                left border falls back to the v3 default border colour (gray-200). */}
            <div className="ml-9 rounded-r-xl border-l-4 border-gray-200 bg-amber-50 p-4">
              <ul className="space-y-2 text-amber-800">
                <li>• Corporate group discount will be removed</li>
                <li>• Regular FitBreak rates will automatically apply</li>
                <li>
                  • Group discount may be reinstated once the minimum number of members is met again
                </li>
              </ul>
            </div>

            {/* Who This Program Is For */}
            <div className="my-10 rounded-2xl bg-brand-50 p-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Who This Program Is For</h2>
              <p className="mb-6 text-gray-700">
                The FitBreak Corporate Group Program is ideal for:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {audiences.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <SolidCheckCircle className="h-5 w-5 text-brand-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-gray-600 italic">
                Whether you&apos;re promoting health, boosting morale, or building stronger
                teams—this program makes it easy.
              </p>
            </div>

            {/* A Smarter Wellness Benefit */}
            <div className="my-10 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 p-8 text-white">
              <h2 className="mb-4 text-2xl font-bold">A Smarter Wellness Benefit</h2>
              <p className="mb-4 leading-relaxed text-white/90">
                Instead of one-time wellness events or unused gym memberships, FitBreak offers a
                community-driven fitness experience that women actually enjoy and stick with.
              </p>
              <p className="text-lg font-semibold text-white">
                When women feel safe, supported, and confident, they show up stronger—at work and in
                life.
              </p>
            </div>

            {/* CTA Section (source `py-10` is absent from its compiled CSS, so dropped) */}
            <div className="my-12 border-t border-b border-gray-200 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Get Your Group Started</h2>
              <p className="mb-8 text-gray-600">
                Contact FitBreak today to register your group and start packages together for easy
                tracking and accountability.
              </p>
              <p className="mb-8 font-semibold text-brand-600 italic">
                Because investing in women&apos;s health is an investment that lasts.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href={MESSENGER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl"
                >
                  <MessengerIcon className="h-5 w-5" />
                  Inquire via Messenger
                </a>
                <a
                  href={contact.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-500 bg-white px-8 py-4 font-bold text-brand-600 transition-all hover:bg-brand-50"
                >
                  <Icon name="phone" className="h-5 w-5" />
                  Talk to Our Team
                </a>
              </div>
              <div className="mt-6">
                <a
                  href={asset("/fitbreak-corporate-flyer.pdf")}
                  download
                  className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-brand-600"
                >
                  <DocumentDownloadIcon className="h-4 w-4" />
                  Download Corporate Flyer (PDF)
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
      {n}
    </span>
  );
}
