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

/** Cloned from fitbreak.ph/club-rules.html (main content only). */
export function ClubRules() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 p-8 text-center text-white md:p-12">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Club House Rules</h1>
        <p className="text-xl text-brand-100">
          A safe, empowering, and respectful space for every woman.
        </p>
      </div>

      {/* Rules Cards */}
      <div className="space-y-4">
        {rules.map((rule, i) => (
          <div
            key={rule.title}
            className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500">
              <span className="text-xl font-bold text-white">{i + 1}</span>
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">{rule.title}</h3>
              <p className="text-gray-600">{rule.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Thank You Note */}
      <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="font-medium text-brand-700">
          Thank you for helping keep FitBreak a safe, supportive, and empowering space for all
          women!
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={contact.messenger}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
        >
          Message Us to Book
        </a>
      </div>
    </div>
  );
}
