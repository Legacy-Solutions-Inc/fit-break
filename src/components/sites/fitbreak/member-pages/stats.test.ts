import { describe, expect, it } from "vitest";

import {
  activeStreak,
  formatWorkoutDate,
  overviewStats,
  todaySummary,
  weeklyActivityMinutes,
  weeklyProgress,
  workoutTypeCounts,
  workoutsThisWeek,
  type ActivityBooking,
  type ActivityWorkout,
} from "./stats";

// Wednesday 4 Nov 2026, 10:00 local.
const now = new Date(2026, 10, 4, 10, 0);

const bookings: ActivityBooking[] = [
  { programName: "Total Body Burn", date: "2026-11-02", time: "06:30", status: "confirmed" }, // Mon, past
  { programName: "Sculpt & Strength", date: "2026-11-03", time: "18:00", status: "attended" }, // Tue
  { programName: "Cardio Crush", date: "2026-11-05", time: "09:00", status: "confirmed" }, // Thu, future
  { programName: "Core & Balance", date: "2026-11-04", time: "06:30", status: "cancelled" },
];
const workouts: ActivityWorkout[] = [
  {
    type: "yoga",
    duration: 30,
    caloriesBurned: 120,
    loggedAt: new Date(2026, 10, 4, 7, 0).toISOString(),
  },
  {
    type: "walking",
    duration: 20,
    caloriesBurned: 100,
    loggedAt: new Date(2026, 9, 20, 7, 0).toISOString(),
  },
];

describe("member stats", () => {
  it("counts finished classes plus logged workouts in the overview", () => {
    const s = overviewStats(bookings, workouts, now);
    expect(s.totalWorkouts).toBe(4); // 2 finished classes + 2 logs
    expect(s.calories).toBe(2 * 350 + 220);
    expect(s.hours).toBeCloseTo(1.5 + 50 / 60);
    expect(s.streak).toBe(3); // Mon, Tue, Wed
  });

  it("keeps a streak alive until the end of today", () => {
    expect(activeStreak([new Date(2026, 10, 3, 8)], now)).toBe(1);
    expect(activeStreak([new Date(2026, 10, 1, 8)], now)).toBe(0);
  });

  it("buckets this week's minutes by weekday, 45 per class", () => {
    expect(weeklyActivityMinutes(bookings, workouts, now)).toEqual([0, 45, 45, 30, 45, 0, 0]);
  });

  it("classifies workout types like the source", () => {
    expect(workoutTypeCounts(bookings, workouts)).toEqual({
      cardio: 2,
      strength: 1,
      flexibility: 1,
      hiit: 1,
    });
  });

  it("charts the last four weeks, oldest first", () => {
    expect(weeklyProgress(bookings, workouts, now)).toEqual([0, 1, 0, 4]);
  });

  it("summarises the tracker's today and this-week figures", () => {
    expect(todaySummary(workouts, now)).toEqual({ workouts: 1, minutes: 30, calories: 120 });
    expect(workoutsThisWeek(workouts, now)).toBe(1);
  });

  it("formats relative workout dates", () => {
    expect(formatWorkoutDate(new Date(2026, 10, 4, 7, 0), now)).toBe("Today at 7:00 AM");
    expect(formatWorkoutDate(new Date(2026, 10, 3, 18, 0), now)).toBe("Yesterday at 6:00 PM");
    expect(formatWorkoutDate(new Date(2026, 10, 1, 18, 0), now)).toBe("3 days ago");
    expect(formatWorkoutDate(new Date(2026, 9, 20, 7, 0), now)).toBe("Oct 20");
  });
});
