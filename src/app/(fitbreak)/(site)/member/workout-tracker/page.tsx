import type { Metadata } from "next";

import { WorkoutTracker } from "@/components/sites/fitbreak/member-pages/workout-tracker";
import { requireMember } from "@/lib/fitbreak/member";
import { listWorkouts } from "@/services/fitbreak/fitness";

export const metadata: Metadata = {
  title: { absolute: "Workout Tracker — FitBreak" },
  description: "Log and track your daily workouts",
};

export default async function WorkoutTrackerPage() {
  const member = await requireMember();
  const workouts = await listWorkouts(member.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <WorkoutTracker workouts={workouts} />
      </div>
    </div>
  );
}
