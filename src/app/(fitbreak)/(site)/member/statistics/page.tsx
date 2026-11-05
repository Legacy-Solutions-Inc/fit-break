import type { Metadata } from "next";

import { StatisticsView } from "@/components/sites/fitbreak/member-pages/statistics-view";
import { requireMember } from "@/lib/fitbreak/member";
import { listWorkouts } from "@/services/fitbreak/fitness";
import { getAccount, listBookings } from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "Statistics — FitBreak" },
  description: "Track your fitness progress over time",
};

export default async function StatisticsPage() {
  const member = await requireMember();
  const [account, bookings, workouts] = await Promise.all([
    getAccount(member.id, member.email),
    listBookings(member.id),
    listWorkouts(member.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600">Track your fitness progress over time</p>
        </div>

        <StatisticsView
          memberSince={account.memberSince}
          bookings={bookings.map((b) => ({
            programName: b.programName,
            date: b.date,
            time: b.time,
            status: b.status,
          }))}
          workouts={workouts.map((w) => ({
            type: w.type,
            duration: w.duration,
            caloriesBurned: w.caloriesBurned,
            loggedAt: w.loggedAt,
          }))}
        />
      </div>
    </div>
  );
}
