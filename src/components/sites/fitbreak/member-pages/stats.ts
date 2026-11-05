import { classStart } from "@/services/fitbreak/catalog";
import type { WorkoutType } from "@/services/fitbreak/fitness";
import type { BookingStatus } from "@/services/fitbreak/members";

// Pure, client-safe aggregations for the workout tracker, statistics and
// profile pages. Everything takes `now` so it can run in the member's own
// timezone (client) and be unit-tested deterministically.

/** The slice of a booking the charts need (serialisable for client props). */
export interface ActivityBooking {
  programName: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  time: string;
  status: BookingStatus;
}

export interface ActivityWorkout {
  type: WorkoutType;
  duration: number;
  caloriesBurned: number;
  /** ISO timestamp */
  loggedAt: string;
}

/** statistics.html assumes 45 active minutes per class. */
export const MINUTES_PER_CLASS = 45;
/** statistics.html: classesAttended × 350 calories. */
export const CALORIES_PER_CLASS = 350;

const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Sunday 00:00 of the week containing `now` (the source's week). */
export function startOfWeek(now: Date): Date {
  const s = startOfDay(now);
  s.setDate(s.getDate() - s.getDay());
  return s;
}

/** The source counts `confirmed` and `checked_in` bookings in its charts. */
function isActive(b: ActivityBooking): boolean {
  return b.status === "confirmed" || b.status === "attended";
}

/** Classes actually done: attended, or confirmed and already started. */
export function classesAttended(
  bookings: readonly ActivityBooking[],
  now: Date,
): ActivityBooking[] {
  return bookings.filter(
    (b) =>
      b.status === "attended" ||
      (b.status === "confirmed" && classStart(b.date, b.time).getTime() <= now.getTime()),
  );
}

/**
 * Consecutive days with activity, ending today (or yesterday, so a streak is
 * not lost before today's session).
 */
export function activeStreak(activityDates: readonly Date[], now: Date): number {
  const days = new Set(activityDates.map((d) => startOfDay(d).getTime()));
  let cursor = startOfDay(now);
  if (!days.has(cursor.getTime())) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

export interface OverviewStats {
  totalWorkouts: number;
  calories: number;
  hours: number;
  streak: number;
}

export function overviewStats(
  bookings: readonly ActivityBooking[],
  workouts: readonly ActivityWorkout[],
  now: Date,
): OverviewStats {
  const done = classesAttended(bookings, now);
  const workoutMinutes = workouts.reduce((s, w) => s + w.duration, 0);
  const dates = [
    ...done.map((b) => classStart(b.date, b.time)),
    ...workouts.map((w) => new Date(w.loggedAt)),
  ];
  return {
    totalWorkouts: done.length + workouts.length,
    calories: done.length * CALORIES_PER_CLASS + workouts.reduce((s, w) => s + w.caloriesBurned, 0),
    hours: done.length * 0.75 + workoutMinutes / 60,
    streak: activeStreak(dates, now),
  };
}

/** Active minutes per weekday (Sun…Sat) for the current week. */
export function weeklyActivityMinutes(
  bookings: readonly ActivityBooking[],
  workouts: readonly ActivityWorkout[],
  now: Date,
): number[] {
  const start = startOfWeek(now).getTime();
  const end = start + 7 * DAY_MS;
  const minutes = [0, 0, 0, 0, 0, 0, 0];
  const add = (day: number, m: number) => {
    minutes[day] = (minutes[day] ?? 0) + m;
  };
  for (const b of bookings) {
    if (!isActive(b)) continue;
    const d = classStart(b.date, b.time);
    if (d.getTime() >= start && d.getTime() < end) add(d.getDay(), MINUTES_PER_CLASS);
  }
  for (const w of workouts) {
    const d = new Date(w.loggedAt);
    if (d.getTime() >= start && d.getTime() < end) add(d.getDay(), w.duration);
  }
  return minutes;
}

export interface WorkoutTypeCounts {
  cardio: number;
  strength: number;
  flexibility: number;
  hiit: number;
}

/** statistics.html getWorkoutTypesData, extended with logged workouts. */
export function workoutTypeCounts(
  bookings: readonly ActivityBooking[],
  workouts: readonly ActivityWorkout[],
): WorkoutTypeCounts {
  const types: WorkoutTypeCounts = { cardio: 0, strength: 0, flexibility: 0, hiit: 0 };
  for (const b of bookings) {
    if (!isActive(b)) continue;
    const name = b.programName.toLowerCase();
    if (["yoga", "pilates", "stretch", "flexibility"].some((k) => name.includes(k)))
      types.flexibility++;
    else if (["strength", "tone", "sculpt", "weights"].some((k) => name.includes(k)))
      types.strength++;
    else if (["hiit", "bootcamp", "burn"].some((k) => name.includes(k))) types.hiit++;
    else types.cardio++;
  }
  for (const w of workouts) {
    if (w.type === "yoga") types.flexibility++;
    else if (w.type === "strength") types.strength++;
    else if (w.type === "hiit") types.hiit++;
    else types.cardio++;
  }
  return types;
}

/** Sessions per week for the last four weeks (oldest first). */
export function weeklyProgress(
  bookings: readonly ActivityBooking[],
  workouts: readonly ActivityWorkout[],
  now: Date,
): number[] {
  const thisWeek = startOfWeek(now);
  const weeks: number[] = [];
  for (let i = 3; i >= 0; i--) {
    const ws = new Date(thisWeek.getFullYear(), thisWeek.getMonth(), thisWeek.getDate() - i * 7);
    const we = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 7);
    const inWeek = (d: Date) => d >= ws && d < we;
    const classes = bookings.filter(
      (b) => isActive(b) && inWeek(classStart(b.date, b.time)),
    ).length;
    const logged = workouts.filter((w) => inWeek(new Date(w.loggedAt))).length;
    weeks.push(classes + logged);
  }
  return weeks;
}

// ── Workout tracker ─────────────────────────────────────────────────────────

export function todaySummary(workouts: readonly ActivityWorkout[], now: Date) {
  const today = startOfDay(now).getTime();
  const list = workouts.filter((w) => startOfDay(new Date(w.loggedAt)).getTime() === today);
  return {
    workouts: list.length,
    minutes: list.reduce((s, w) => s + w.duration, 0),
    calories: list.reduce((s, w) => s + w.caloriesBurned, 0),
  };
}

export function workoutsThisWeek(workouts: readonly ActivityWorkout[], now: Date): number {
  const start = startOfWeek(now);
  return workouts.filter((w) => new Date(w.loggedAt) >= start).length;
}

/** "Today at 7:00 AM" / "Yesterday at …" / "3 days ago" / "Nov 4". */
export function formatWorkoutDate(date: Date, now: Date): string {
  const today = startOfDay(now);
  const day = startOfDay(date);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const diff = Math.round((today.getTime() - day.getTime()) / DAY_MS);
  if (diff === 0) return `Today at ${time}`;
  if (diff === 1) return `Yesterday at ${time}`;
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
