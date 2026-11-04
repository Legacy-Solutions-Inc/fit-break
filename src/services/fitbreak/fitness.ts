// ─────────────────────────────────────────────────────────────────────────────
// FitBreak Fitness Service Seam — workout log, fitness goals, body metrics and
// the notification toggle members.ts does not model.
//
// The live site keeps these in Firestore (`users/{uid}/workoutLogs`,
// `users/{uid}/settings/goals`, body fields on `users/{uid}`, and
// `settings/{uid}.classReminders`). This clone is mock-first (docs/adr/0003):
// an in-memory store keyed by the member id. Swap the function bodies for
// Drizzle/Supabase queries later — callers (Server Components / Actions) don't
// change. Server-side only; mutate exclusively through Server Actions.
// ─────────────────────────────────────────────────────────────────────────────

export const WORKOUT_TYPES = ["hiit", "strength", "cardio", "yoga", "walking", "other"] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

/** Calorie estimate per minute by workout type (workout-tracker.html). */
export const CALORIES_PER_MINUTE: Record<WorkoutType, number> = {
  hiit: 12,
  strength: 8,
  cardio: 10,
  yoga: 4,
  walking: 5,
  other: 6,
};

/** Default durations for the "Quick Log" buttons (workout-tracker.html). */
export const QUICK_LOG_MINUTES = { cardio: 30, strength: 45, yoga: 30, walking: 20 } as const;
export type QuickLogType = keyof typeof QUICK_LOG_MINUTES;

/** The tracker page shows only the newest 50 logs (Firestore `limit(50)`). */
const WORKOUT_LIST_LIMIT = 50;

export interface WorkoutLog {
  id: string;
  userId: string;
  type: WorkoutType;
  /** Minutes. */
  duration: number;
  caloriesBurned: number;
  notes: string;
  /** ISO timestamp. */
  loggedAt: string;
}

export interface FitnessGoals {
  weeklyClassesGoal: number;
  calorieGoal: number;
  stepsGoal: number;
  waterGoal: number;
}

export const DEFAULT_GOALS: FitnessGoals = {
  weeklyClassesGoal: 3,
  calorieGoal: 2000,
  stepsGoal: 10000,
  waterGoal: 2000,
};

export type Gender = "" | "female" | "male" | "other";

export interface BodyMetrics {
  /** Stored in cm, like the source (`users.height`). */
  heightCm: number | null;
  weightKg: number | null;
  gender: Gender;
  /** Derived on save when both height and weight are present. */
  bmi: number | null;
}

/** Notification toggles that MemberSettings (members.ts) does not carry. */
export interface FitnessPreferences {
  classReminders: boolean;
}

interface Store {
  workouts: WorkoutLog[];
  goals: Map<string, FitnessGoals>;
  body: Map<string, BodyMetrics>;
  preferences: Map<string, FitnessPreferences>;
  seq: number;
}

// Survive dev HMR module reloads (otherwise every edit wipes the mock data).
const g = globalThis as typeof globalThis & { __fitbreakFitnessStore?: Store };
const store: Store = (g.__fitbreakFitnessStore ??= {
  workouts: [],
  goals: new Map(),
  body: new Map(),
  preferences: new Map(),
  seq: 1,
});

export class FitnessServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** Calories for a session when the member leaves the field blank. */
export function estimateCalories(type: WorkoutType, minutes: number): number {
  return Math.round(minutes * (CALORIES_PER_MINUTE[type] ?? CALORIES_PER_MINUTE.other));
}

/** Rounded to one decimal, as profile.js stores it. */
export function computeBmi(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

// ── Workout log ─────────────────────────────────────────────────────────────

export async function logWorkout(
  userId: string,
  input: {
    type: WorkoutType;
    duration: number;
    calories?: number | null;
    notes?: string;
    loggedAt?: Date;
  },
): Promise<WorkoutLog> {
  const duration = Math.trunc(input.duration);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new FitnessServiceError("Please enter a valid duration");
  }
  const calories =
    input.calories && input.calories > 0
      ? Math.trunc(input.calories)
      : estimateCalories(input.type, duration);
  const log: WorkoutLog = {
    id: `WO-${String(store.seq++).padStart(5, "0")}`,
    userId,
    type: input.type,
    duration,
    caloriesBurned: calories,
    notes: input.notes?.trim() ?? "",
    loggedAt: (input.loggedAt ?? new Date()).toISOString(),
  };
  store.workouts.push(log);
  return log;
}

/** The member's newest workouts first (at most 50, like the source query). */
export async function listWorkouts(userId: string): Promise<WorkoutLog[]> {
  return store.workouts
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt) || b.id.localeCompare(a.id))
    .slice(0, WORKOUT_LIST_LIMIT);
}

// ── Goals ───────────────────────────────────────────────────────────────────

export async function getGoals(userId: string): Promise<FitnessGoals> {
  return store.goals.get(userId) ?? { ...DEFAULT_GOALS };
}

export async function saveGoals(
  userId: string,
  patch: Partial<FitnessGoals>,
): Promise<FitnessGoals> {
  const next = { ...(await getGoals(userId)), ...patch };
  store.goals.set(userId, next);
  return next;
}

// ── Body metrics ────────────────────────────────────────────────────────────

export async function getBodyMetrics(userId: string): Promise<BodyMetrics> {
  return store.body.get(userId) ?? { heightCm: null, weightKg: null, gender: "", bmi: null };
}

export async function updateBodyMetrics(
  userId: string,
  patch: Partial<Omit<BodyMetrics, "bmi">>,
): Promise<BodyMetrics> {
  const merged = { ...(await getBodyMetrics(userId)), ...patch };
  const next: BodyMetrics = { ...merged, bmi: computeBmi(merged.heightCm, merged.weightKg) };
  store.body.set(userId, next);
  return next;
}

// ── Preferences ─────────────────────────────────────────────────────────────

export async function getPreferences(userId: string): Promise<FitnessPreferences> {
  return store.preferences.get(userId) ?? { classReminders: true };
}

export async function updatePreferences(
  userId: string,
  patch: Partial<FitnessPreferences>,
): Promise<FitnessPreferences> {
  const next = { ...(await getPreferences(userId)), ...patch };
  store.preferences.set(userId, next);
  return next;
}

// ── Trainer applications (trainers.html "Join Our Team") ────────────────────

export interface TrainerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  certifications: string;
  experience: "0-1" | "1-3" | "3-5" | "5+";
  message: string;
  status: "pending";
  createdAt: string;
}

const g2 = globalThis as typeof globalThis & {
  __fitbreakTrainerApplications?: TrainerApplication[];
};
const applications: TrainerApplication[] = (g2.__fitbreakTrainerApplications ??= []);

/** Records an application (the source writes `trainerApplications` in Firestore). */
export async function submitTrainerApplication(
  input: Omit<TrainerApplication, "id" | "status" | "createdAt">,
): Promise<TrainerApplication> {
  const record: TrainerApplication = {
    ...input,
    id: `TA-${String(store.seq++).padStart(5, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  applications.push(record);
  return record;
}

export async function listTrainerApplications(): Promise<TrainerApplication[]> {
  return [...applications];
}
