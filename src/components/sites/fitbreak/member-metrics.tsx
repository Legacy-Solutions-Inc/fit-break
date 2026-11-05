import { Icon, type IconName } from "./icons";
import { cardIn } from "./links";

// Shown only to signed-in members. The values are the fixed sample figures the
// source renders (it has no per-member data wired here yet); replace them with
// a real member-stats service when one exists.
const cards: Array<{
  icon: IconName;
  iconBox: string;
  iconColor: string;
  badge: string;
  badgeClass: string;
  value: string;
  label: string;
  footnote: string;
}> = [
  {
    icon: "checkCircle",
    iconBox: "bg-brand-100",
    iconColor: "text-brand-600",
    badge: "+12%",
    badgeClass: "text-green-600 bg-green-50",
    value: "24",
    label: "Classes Attended",
    footnote: "This month",
  },
  {
    icon: "bolt",
    iconBox: "bg-accent-100",
    iconColor: "text-accent-700",
    badge: "🔥 Hot!",
    badgeClass: "text-orange-600 bg-orange-50",
    value: "7 days",
    label: "Active Streak",
    footnote: "Keep it up!",
  },
  {
    icon: "clock",
    iconBox: "bg-purple-100",
    iconColor: "text-purple-600",
    badge: "Today",
    badgeClass: "text-blue-600 bg-blue-50",
    value: "6:00 PM",
    label: "CARDIO CRUSH",
    footnote: "2 hours left",
  },
  {
    icon: "currency",
    iconBox: "bg-yellow-100",
    iconColor: "text-yellow-600",
    badge: "Active",
    badgeClass: "text-gray-600 bg-gray-50",
    value: "8 / 12",
    label: "Credits Remaining",
    footnote: "Expires in 15 days",
  },
];

const quickStats = [
  { label: "Calories Burned", value: "3,240" },
  { label: "Total Hours", value: "24h" },
  { label: "Favorite Class", value: "💓 Cardio" },
  { label: "Member Since", value: "Jan 2025" },
];

export function MemberMetrics() {
  return (
    <section
      id="metrics-dashboard"
      className="bg-linear-to-br from-pink-50 via-white to-accent-50 py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome back! 👋</h2>
          <p className="text-gray-600">Track your fitness journey with FitBreak</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={c.label}
              style={cardIn(i + 1)}
              className="fb-card-in rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${c.iconBox}`}>
                  <Icon name={c.icon} className={`h-6 w-6 ${c.iconColor}`} />
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${c.badgeClass}`}>
                  {c.badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{c.value}</h3>
              <p className="mt-1 text-sm text-gray-600">{c.label}</p>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">{c.footnote}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
              <p className="mb-1 text-xs text-gray-600">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
