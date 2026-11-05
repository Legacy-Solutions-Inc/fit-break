import { wrap } from "../editorial";
import { contact } from "../links";

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

const body = "text-lg leading-relaxed text-ink/80";
const lead = "text-xl leading-snug font-medium text-ink lg:text-2xl";
const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * A chapter of the page: the heading holds the left columns (sticky on wide
 * screens), the text runs in the right-hand measure. Rules separate chapters.
 */
function Chapter({
  index,
  title,
  children,
}: {
  index: number;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-rule py-16 lg:py-24">
      <div className={`${wrap} grid gap-8 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p aria-hidden="true" className="fb-label fb-num mb-4 text-mute">
              {num(index)}
            </p>
            <h2 className="fb-display text-[clamp(2.25rem,4.5vw,4rem)]">{title}</h2>
          </div>
        </div>
        <div className="max-w-[44rem] lg:col-span-7 lg:col-start-6">{children}</div>
      </div>
    </section>
  );
}

/** A ruled list with a crimson dash marker (used for the plain bullet lists). */
function DashList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`border-t border-ink/20 ${className ?? ""}`}>
      {items.map((item) => (
        <li
          key={item}
          className="grid grid-cols-[1.75rem_1fr] border-b border-ink/20 py-4 text-lg text-ink/85"
        >
          <span aria-hidden="true" className="font-semibold text-crimson-deep">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Cloned from fitbreak.ph/fitbreakers.html (main content only). */
export function Fitbreakers() {
  return (
    <>
      {/* Opening */}
      <header className={`${wrap} pt-16 pb-14 lg:pt-28 lg:pb-20`}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="fb-display max-w-[12ch] text-[clamp(3rem,8vw,7rem)] lg:col-span-8">
            Who Are the FitBreakers?
          </h1>
          <p className="fb-display text-[clamp(1.75rem,3.2vw,3rem)] text-mute lg:col-span-4 lg:pb-2">
            The Story Behind the Name
          </p>
        </div>
      </header>

      {/* The meaning */}
      <section className="border-t border-rule py-16 lg:py-24">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-10`}>
          <div className="space-y-6 lg:col-span-6">
            <p className="text-[clamp(1.4rem,2.2vw,1.9rem)] leading-snug font-medium text-ink">
              <strong className="font-bold">FitBreak</strong> comes from a simple but powerful idea:
              a <strong className="font-bold">&quot;Fitness Break.&quot;</strong>
            </p>
            <p className={body}>
              A FitBreak is a short pause in the middle of life&apos;s hustle—a moment where a woman
              steps away from her responsibilities, expectations, and pressures to focus on herself.
            </p>
          </div>

          <blockquote
            data-reveal
            className="fb-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[0.98] lg:col-span-5 lg:col-start-8 lg:row-span-2"
          >
            <span aria-hidden="true" className="mb-6 block h-1 w-16 bg-crimson" />
            <p>
              It&apos;s the break she gives her body to move.
              <br />
              The break she gives her mind to breathe.
              <br />
              <span className="text-crimson">
                The break she gives her heart to remember who she is.
              </span>
            </p>
          </blockquote>

          <div className="max-w-[44rem] space-y-6 lg:col-span-6">
            <p className={body}>
              In a world where women are constantly expected to give, serve, and show up for
              everyone else, FitBreak is the reminder that{" "}
              <strong className="font-semibold text-ink">self-care is not selfish.</strong>
            </p>
            <p className={lead}>
              And the women who take that break? They are called{" "}
              <strong className="font-bold text-crimson-deep">FitBreakers.</strong>
            </p>
          </div>
        </div>
      </section>

      <Chapter index={0} title="The FitBreaker Identity">
        <div className="space-y-6">
          <p className={body}>
            FitBreakers are women who choose themselves—sometimes for the first time in their lives.
          </p>
          <p className={body}>
            They are not defined by a number on the scale, a dress size, or how long they&apos;ve
            been working out.
          </p>
        </div>

        <p
          data-reveal
          className="fb-display my-12 border-y border-ink/20 py-10 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95]"
        >
          They are defined by a decision:
          <br />
          <span className="text-crimson">&quot;Today, I choose me.&quot;</span>
        </p>

        <div className="space-y-6">
          <p className={body}>
            FitBreakers understand that strength is not just physical—it is mental, emotional, and
            deeply personal.
          </p>
          <p className={body}>
            They are wives, mothers, daughters, sisters, professionals, students. Some are starting
            their fitness journey again. Some are starting for the very first time.
          </p>
          <p className={lead}>
            What they have in common is not where they came from—but{" "}
            <strong className="font-bold">why they showed up.</strong>
          </p>
        </div>
      </Chapter>

      <Chapter index={1} title="Who FitBreakers Are">
        <p className="fb-label mb-4 text-mute">FitBreakers are women who:</p>
        <DashList items={whoTheyAre} className="mb-12" />

        <p className="fb-label mb-4 text-mute">They may feel:</p>
        <DashList items={theyMayFeel} />

        <p className="fb-display mt-12 text-[clamp(1.75rem,3vw,2.5rem)]">
          But when they step into FitBreak, something changes.
        </p>
      </Chapter>

      <Chapter index={2} title="What Makes a FitBreaker Different">
        <div className="space-y-6">
          <p className={body}>A FitBreaker doesn&apos;t wait for the &quot;perfect time.&quot;</p>
          <p className={body}>
            She doesn&apos;t wait to be confident before she starts.
            <br />
            <strong className="font-semibold text-ink">She starts to become confident.</strong>
          </p>
        </div>

        <p className="fb-label mt-12 mb-4 text-mute">A FitBreaker understands that:</p>
        <ol className="mb-12 border-t border-ink/20">
          {understands.map((item, i) => (
            <li
              key={item}
              className="grid grid-cols-[3rem_1fr] items-baseline border-b border-ink/20 py-4"
            >
              <span aria-hidden="true" className="fb-label fb-num text-mute">
                {num(i)}
              </span>
              <span className="text-xl text-ink">{item}</span>
            </li>
          ))}
        </ol>

        <p className={body}>
          She celebrates effort, not perfection. She supports other women instead of comparing
          herself to them. She grows stronger in a space designed for her, not against her.
        </p>
      </Chapter>

      <Chapter index={3} title="FitBreakers Believe That:">
        <ol className="border-t border-ink/20">
          {beliefs.map((item, i) => (
            <li
              key={item}
              data-reveal
              className="grid grid-cols-[3.5rem_1fr] items-baseline gap-2 border-b border-ink/20 py-6 sm:grid-cols-[4.5rem_1fr]"
            >
              <span
                aria-hidden="true"
                className="fb-display fb-num text-[clamp(1.6rem,2.6vw,2.25rem)] text-crimson"
              >
                {num(i)}
              </span>
              <span className="fb-display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1]">
                {item}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-lg leading-relaxed text-ink/80">
          At FitBreak, FitBreakers are not just members.
          <br />
          <strong className="font-semibold text-ink">
            They are a community of women lifting each other up—physically and mentally.
          </strong>
        </p>
      </Chapter>

      <Chapter index={4} title="The FitBreaker Mindset">
        <p className="fb-label mb-4 text-mute">Being a FitBreaker means:</p>
        <ul className="mb-10 border-t border-ink/20">
          {mindset.map((item) => (
            <li
              key={item}
              className="fb-display border-b border-ink/20 py-5 text-[clamp(1.75rem,3.2vw,2.75rem)]"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <p className={body}>
            It means giving yourself permission to sweat, struggle, laugh, rest, and grow.
          </p>
          <p className={lead}>
            Because sometimes, stopping—taking a break—is what makes you stronger.
          </p>
        </div>
      </Chapter>

      {/* What it means: the one dark band on the page */}
      <section className="fb-grain bg-ink py-20 text-paper lg:py-32">
        <div className={`${wrap} relative z-10 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="lg:col-span-5">
            <h2 className="fb-display mb-8 text-[clamp(2.25rem,4.5vw,4rem)]">
              This Is What It Means to Be a FitBreaker
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-paper/75">
              A FitBreaker is not trying to become someone else.
              <br />
              She is reconnecting with who she has always been.
            </p>
          </div>
          <div
            data-reveal
            className="fb-display text-[clamp(4rem,11vw,10rem)] leading-[0.85] lg:col-span-6 lg:col-start-7"
          >
            <p>Strong.</p>
            <p>Capable.</p>
            <p className="text-crimson">Worthy.</p>
          </div>
        </div>
      </section>

      {/* Welcome + booking */}
      <section className="py-20 lg:py-32">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <div className="fb-display text-[clamp(2.5rem,6vw,5.25rem)] leading-[0.92] lg:col-span-8">
            <p>Welcome to FitBreak.</p>
            <p className="text-mute">Welcome to the community.</p>
            <p className="text-crimson">You are a FitBreaker.</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <a
              href={contact.messenger}
              data-placement="fitbreakers"
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn fb-btn--crimson min-h-14 px-8 text-lg"
            >
              Book Your First Class
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
