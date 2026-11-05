import { wrap } from "../editorial";
import { contact } from "../links";

const rules = [
  {
    title: "No Class Video Recording",
    body: "Videos during classes or coaching sessions are not allowed. Let's honor everyone's comfort and privacy.",
  },
  {
    title: "Women's Space Only",
    body: "Male companions (husbands, boyfriends, brothers, etc.) may not wait inside. They're welcome to relax at the coffee shop downstairs.",
  },
  {
    title: "Selfies Allowed — Respect Privacy",
    body: "Feel free to take selfies, but no photos or videos of other members without their permission.",
  },
  {
    title: "Late? Please Ask the Coach First",
    body: "If you arrive late, kindly check with the Coach before joining the class to avoid disruptions.",
  },
  {
    title: "No Food Inside the Club",
    body: "Drinks are allowed. Keep the space clean and fresh for everyone.",
  },
  {
    title: "Watch Your Belongings",
    body: "The club is not responsible for lost items. Please safeguard your personal belongings.",
  },
  {
    title: "Payment Required Before Joining Classes",
    body: "Only paid members may join classes. Settle payments in advance to enjoy uninterrupted sessions.",
  },
  {
    title: "Respectful Behavior Only",
    body: "Unruly or disruptive behavior may result in removal from the premises.",
  },
  {
    title: "Return Equipment After Use",
    body: "Use equipment safely and return everything to its proper place.",
  },
  {
    title: "Proper Attire & Hygiene",
    body: "Wear appropriate workout clothes and clean shoes. Maintain good hygiene to keep our community comfortable.",
  },
];

/**
 * Cloned from fitbreak.ph/club-rules.html (main content only). The ten rules are
 * a numbered list: very large condensed numerals, hairline rules between them.
 */
export function ClubRules() {
  return (
    <>
      {/* Opening */}
      <header className={`${wrap} pt-16 pb-14 lg:pt-28 lg:pb-20`}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="fb-display text-[clamp(3rem,8vw,7rem)] lg:col-span-8">Club House Rules</h1>
          <p className="max-w-md text-xl leading-snug text-mute lg:col-span-4 lg:pb-2">
            A safe, empowering, and respectful space for every woman.
          </p>
        </div>
      </header>

      {/* The rules */}
      <section className={`${wrap} pb-20 lg:pb-28`}>
        <ol className="border-b border-ink/20">
          {rules.map((rule, i) => (
            <li
              key={rule.title}
              data-reveal
              className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-t border-ink/20 py-8 sm:gap-x-8 lg:grid-cols-12 lg:gap-x-10 lg:py-10"
            >
              <span
                aria-hidden="true"
                className="fb-display fb-num row-span-2 w-[2.1ch] text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.8] lg:col-span-2 lg:row-span-1"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="fb-display self-start text-[clamp(1.6rem,3vw,2.75rem)] lg:col-span-5 lg:pt-1">
                {rule.title}
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-mute lg:col-span-5 lg:pt-1">
                {rule.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Thank-you note + booking */}
      <section className="border-t border-rule bg-bone/60 py-20 lg:py-28">
        <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10`}>
          <p className="fb-display max-w-[22ch] text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.95] lg:col-span-8">
            Thank you for helping keep FitBreak a safe, supportive, and empowering space for all
            women!
          </p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <a
              href={contact.messenger}
              data-placement="club-rules"
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn fb-btn--crimson min-h-14 px-8 text-lg"
            >
              Message Us to Book
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
