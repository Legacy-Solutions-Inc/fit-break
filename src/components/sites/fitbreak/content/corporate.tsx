import { Arrow, ArrowLink, wrap } from "../editorial";
import { asset, contact } from "../links";
import { DocumentDownloadIcon, MessengerIcon } from "./icons";

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

// Booking Enquiry channel shared by the whole site (FitBreakPhilippines page).
const MESSENGER_URL = contact.messenger;

const h2 = "fb-display text-[clamp(2.2rem,4.65vw,3.9rem)]";
const num = (i: number) => String(i + 1).padStart(2, "0");

/** fitbreak.ph/corporate.html content, set in the editorial system (ADR 0009). */
export function Corporate() {
  return (
    <>
      {/* Opening: big left-aligned headline, the pitch on the right. */}
      <section className="bg-paper pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-8">
            <p className="fb-label mb-5 text-mute">Corporate Group Program</p>
            <h1 className="fb-display text-[clamp(2.5rem,5.7vw,5rem)]">
              Stronger Women. <span className="text-crimson">Healthier Teams.</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl text-ink/80">
              Invest in your team&apos;s wellness with exclusive group rates
            </p>
          </div>
          <div className="space-y-6 border-t-2 border-ink pt-6 lg:col-span-4">
            <p className="text-xl leading-relaxed">
              At FitBreak, we believe that when women are supported in prioritizing their health,
              confidence, and well-being—everyone benefits.
            </p>
            <p className="leading-relaxed text-mute">
              The FitBreak Corporate Group Program is designed for companies, schools, and
              organizations that want to invest in women&apos;s wellness through a safe, supportive,
              and results-driven fitness environment—while enjoying significant group savings.
            </p>
          </div>
        </div>
      </section>

      {/* Why Organizations Choose FitBreak: numbered ruled rows. */}
      <section className="border-t border-rule bg-paper py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-8`}>Why Organizations Choose FitBreak</h2>
            <p className="mb-5 max-w-lg text-lg leading-relaxed text-ink/80">
              FitBreak is proudly the{" "}
              <strong className="font-semibold text-ink">
                first women-only fitness studio in Mindoro
              </strong>
              , created specifically for women who may feel intimidated, unsafe, or uncomfortable in
              traditional gyms.
            </p>
            <p className="max-w-lg leading-relaxed text-mute">
              Our members include beginners, working professionals, mothers, educators, and
              leaders—many of whom are starting their fitness journey for the first time.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="divide-y divide-ink/15 border-y border-ink/20">
              {reasons.map((item, i) => (
                <li
                  key={item}
                  data-reveal
                  className="grid grid-cols-[3rem_1fr] items-baseline gap-4 py-5 text-lg"
                >
                  <span className="fb-label fb-num text-mute">{num(i)}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="fb-display mt-10 text-[clamp(1.75rem,3vw,2.5rem)]">
              This is fitness designed for women, <span className="text-crimson">by women.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Rate: the one big number on the page. */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-6`}>Corporate Group Rate</h2>
            <p className="max-w-md text-lg leading-relaxed text-paper/80">
              Organizations that enroll at least 5 women and maintain 5 active package-paying
              members qualify for our exclusive corporate rate:
            </p>
          </div>
          <div data-reveal className="lg:col-span-6 lg:col-start-7">
            <p className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="fb-display fb-num text-[clamp(4rem,8.5vw,7rem)] leading-[0.8]">
                &#8369;200
              </span>
              <span className="fb-label text-paper/70">per class, per person</span>
            </p>
            <p className="mt-8">
              <span className="fb-label inline-block bg-crimson px-2 py-1 text-white">
                42% OFF the regular drop-in rate
              </span>
            </p>
            <p className="mt-8 max-w-md border-t border-paper/15 pt-6 text-sm leading-relaxed text-paper/70">
              This special rate encourages accountability, consistency, and team motivation—key
              drivers of long-term wellness success.
            </p>
          </div>
        </div>
      </section>

      {/* Eligible Packages: the two qualifying packs side by side. */}
      <section className="bg-paper py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-6`}>Eligible Packages</h2>
            <p className="max-w-md text-lg leading-relaxed text-mute">
              To qualify for the Corporate Group Program, all group members must purchase one of the
              following packages:
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-2 divide-x divide-ink/20 border-y-2 border-ink">
              {["12", "20"].map((count) => (
                <div key={count} data-reveal className="py-8 pl-6 first:pl-0">
                  <p className="fb-display fb-num text-[clamp(3.4rem,6.4vw,5rem)] leading-[0.85]">
                    {count}
                  </p>
                  <p className="fb-label mt-3 text-mute">Class Package</p>
                </div>
              ))}
            </div>
            {/* `mb-10` in the source is absent from its compiled CSS, so it is dropped. */}
            <p className="mt-6 flex gap-4">
              <span className="text-crimson" aria-hidden="true">
                —
              </span>
              <span>
                <strong className="font-semibold">Note:</strong> 6-Class Packages and Drop-In
                Classes are not eligible for this program.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Program Requirements: numbered conditions. */}
      <section className="border-t border-rule bg-bone py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-6`}>Program Requirements &amp; Conditions</h2>
            <p className="max-w-md text-lg leading-relaxed text-mute">
              To ensure fairness and sustainability of the program, the following conditions apply:
            </p>
          </div>
          <ol className="divide-y divide-ink/15 border-y border-ink/20 lg:col-span-6 lg:col-start-7">
            <Step n={1}>
              A minimum of <strong className="font-semibold">5 members</strong> must sign up
              together
            </Step>
            <Step n={2}>
              The group must{" "}
              <strong className="font-semibold">
                maintain at least 5 active, package-paying members
              </strong>{" "}
              at all times
            </Step>
            <Step n={3}>
              If the group falls below the minimum requirement:
              <ul className="mt-4 space-y-2 text-base text-mute">
                <li className="flex gap-3">
                  <span aria-hidden="true">—</span>Corporate group discount will be removed
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true">—</span>Regular FitBreak rates will automatically apply
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true">—</span>Group discount may be reinstated once the minimum
                  number of members is met again
                </li>
              </ul>
            </Step>
          </ol>
        </div>
      </section>

      {/* Who This Program Is For: a plain ruled list. */}
      <section className="border-t border-rule bg-paper py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className={`${h2} mb-6`}>Who This Program Is For</h2>
            <p className="max-w-md text-lg text-mute">
              The FitBreak Corporate Group Program is ideal for:
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="divide-y divide-ink/15 border-y border-ink/20">
              {audiences.map((item) => (
                <li key={item} className="fb-display py-4 text-[clamp(1.5rem,2.6vw,2.25rem)]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-lg text-mute italic">
              Whether you&apos;re promoting health, boosting morale, or building stronger teams—this
              program makes it easy.
            </p>
          </div>
        </div>
      </section>

      {/* A Smarter Wellness Benefit */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-32">
        <div className={`${wrap} grid gap-10 lg:grid-cols-12`}>
          <h2 className={`${h2} lg:col-span-5`}>A Smarter Wellness Benefit</h2>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="mb-8 text-lg leading-relaxed text-paper/80">
              Instead of one-time wellness events or unused gym memberships, FitBreak offers a
              community-driven fitness experience that women actually enjoy and stick with.
            </p>
            <p className="fb-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[0.95]">
              When women feel safe, supported, and confident, they show up stronger—at work and in
              life.
            </p>
          </div>
        </div>
      </section>

      {/* CTA (source `py-10` is absent from its compiled CSS, so dropped) */}
      <section data-placement="corporate" className="bg-paper py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-7">
            <h2 className="fb-display mb-8 text-[clamp(2.5rem,5.7vw,5rem)]">
              Get Your Group Started
            </h2>
            <p className="mb-5 max-w-xl text-lg leading-relaxed text-ink/80">
              Contact FitBreak today to register your group and start packages together for easy
              tracking and accountability.
            </p>
            <p className="max-w-xl text-mute italic">
              Because investing in women&apos;s health is an investment that lasts.
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 border-t-2 border-ink pt-8 lg:col-span-4 lg:col-start-9">
            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn fb-btn--ink"
            >
              <MessengerIcon className="h-5 w-5" />
              Inquire via Messenger
              <Arrow />
            </a>
            <ArrowLink href={contact.phoneHref}>Talk to Our Team</ArrowLink>
            <a href={asset("/fitbreak-corporate-flyer.pdf")} download className="fb-link text-sm">
              <DocumentDownloadIcon className="h-4 w-4" />
              Download Corporate Flyer (PDF)
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li data-reveal className="grid grid-cols-[3rem_1fr] items-baseline gap-4 py-6 text-lg">
      <span className="fb-label fb-num text-mute">{num(n - 1)}</span>
      <div>{children}</div>
    </li>
  );
}
