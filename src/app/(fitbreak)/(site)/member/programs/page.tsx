import type { Metadata } from "next";

import {
  ProgramsBrowser,
  type ClassFormat,
} from "@/components/sites/fitbreak/member-pages/programs-browser";
import { requireMember } from "@/lib/fitbreak/member";
import { COACH_NAME, PROGRAMS } from "@/services/fitbreak/catalog";

export const metadata: Metadata = {
  title: { absolute: "Class Formats — FitBreak" },
  description:
    "Discover FitBreak's 6 unique bootcamp-style classes. Each day features a different workout targeting specific muscle groups.",
};

// Per-format details the catalogue does not carry, copied from the source's
// programme documents (programs.js `samplePrograms`) and its hard-coded
// per-id gradients.
const DETAILS: Record<
  string,
  { description: string; goals: string[]; rating: number; icon: string; gradient: string }
> = {
  "total-body-burn": {
    description:
      "Full-body strength and endurance workout. This high-energy Monday class targets all major muscle groups for maximum calorie burn.",
    goals: ["Weight Loss", "Full Body", "Strength", "Endurance"],
    rating: 5.0,
    icon: "🔥",
    gradient: "from-brand-500 to-brand-600",
  },
  "tone-and-tighten": {
    description:
      "Lower body and core toning session. Sculpt your legs, glutes, and core with this targeted Tuesday workout.",
    goals: ["Weight Loss", "Lower Body", "Core", "Toning"],
    rating: 4.9,
    icon: "✨",
    gradient: "from-pink-400 to-pink-600",
  },
  "cardio-crush": {
    description:
      "High-intensity cardio conditioning. Get your heart pumping and boost your metabolism with this intense Wednesday cardio session.",
    goals: ["Weight Loss", "Cardio", "HIIT", "Fat Burn"],
    rating: 4.8,
    icon: "💥",
    gradient: "from-orange-400 to-orange-600",
  },
  "sculpt-and-strength": {
    description:
      "Upper body strength and posture training. Build strong, toned arms and improve your posture every Thursday.",
    goals: ["Weight Loss", "Upper Body", "Posture", "Strength"],
    rating: 4.9,
    icon: "💪",
    gradient: "from-purple-400 to-purple-600",
  },
  "core-and-balance": {
    description:
      "Core stability and coordination workout. Strengthen your core and improve balance every Friday.",
    goals: ["Weight Loss", "Core", "Balance", "Stability"],
    rating: 5.0,
    icon: "🧘‍♀️",
    gradient: "from-blue-400 to-blue-600",
  },
  "booty-and-burn": {
    description:
      "Glutes-focused endurance training. End your week strong with this Saturday booty-building session!",
    goals: ["Weight Loss", "Glutes", "Endurance", "Lower Body"],
    rating: 5.0,
    icon: "🍑",
    gradient: "from-pink-500 to-rose-600",
  },
};

/** programs.js getProgramIcon: the stored icon, unless it is the generic 💪. */
function programIcon(title: string, description: string, goals: string[], icon: string): string {
  if (icon && icon !== "💪") return icon;
  const text = `${title} ${description} ${goals.join(" ")}`.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => text.includes(k));
  if (has("yoga", "flexibility", "stretch", "flow")) return "🧘‍♀️";
  if (has("hiit", "cardio", "fat", "burn", "weight loss")) return "🔥";
  if (has("pilates", "mat")) return "🤸‍♀️";
  if (has("prenatal", "pregnancy", "expecting")) return "🤰";
  if (has("postnatal", "recovery", "mom")) return "👶";
  if (has("glutes", "legs", "booty")) return "🍑";
  if (has("dance", "zumba")) return "💃";
  if (has("beginner", "foundation", "getting started")) return "🌱";
  if (has("wellness", "mindful", "stress")) return "🌸";
  if (has("sculpt", "tone")) return "✨";
  if (has("strength", "muscle", "power", "arms", "core")) return "💪";
  return "🌸";
}

export default async function ProgramsPage() {
  await requireMember();

  const programs: ClassFormat[] = PROGRAMS.map((p) => {
    const d = DETAILS[p.id];
    const description = d?.description ?? p.description;
    const goals = d?.goals ?? [];
    return {
      id: p.id,
      title: p.name,
      description,
      difficulty: "all levels",
      goals,
      rating: d?.rating ?? 5.0,
      instructorName: COACH_NAME,
      icon: programIcon(p.name, description, goals, d?.icon ?? ""),
      gradient: d?.gradient ?? "from-brand-500 to-brand-600",
    };
  }).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 py-12 text-white">
          <div className="px-6 text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Class Formats</h1>
            <p className="mx-auto max-w-2xl text-lg text-brand-50">
              Six unique bootcamp-style classes designed to target different muscle groups
              throughout the week
            </p>
          </div>
        </div>

        <ProgramsBrowser programs={programs} />
      </div>
    </div>
  );
}
