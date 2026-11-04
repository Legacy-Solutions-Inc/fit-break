"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/components/sites/fitbreak/links";
import { requireMember } from "@/lib/fitbreak/member";
import {
  FitnessServiceError,
  logWorkout,
  QUICK_LOG_MINUTES,
  WORKOUT_TYPES,
  type WorkoutLog,
} from "@/services/fitbreak/fitness";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().nonnegative().max(10_000).optional(),
);

const logSchema = z.object({
  type: z.enum(WORKOUT_TYPES),
  duration: z.coerce
    .number({ message: "Please enter a valid duration" })
    .int("Please enter a valid duration")
    .positive("Please enter a valid duration")
    .max(1440, "Please enter a valid duration"),
  calories: optionalNumber,
  notes: z.string().trim().max(500).default(""),
});

export interface LogWorkoutState {
  ok: boolean;
  error?: string;
  /** Bumped on every successful save so the form can close/reset. */
  savedAt?: number;
  workout?: WorkoutLog;
}

function revalidateMemberFitness() {
  revalidatePath(routes.member.workoutTracker);
  revalidatePath(routes.member.statistics);
  revalidatePath(routes.member.profile);
}

/** "Log Workout" modal (useActionState). */
export async function logWorkoutAction(
  _prev: LogWorkoutState,
  formData: FormData,
): Promise<LogWorkoutState> {
  const member = await requireMember();
  const parsed = logSchema.safeParse({
    type: formData.get("type"),
    duration: formData.get("duration"),
    calories: formData.get("calories"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please enter a valid duration" };
  }
  try {
    const workout = await logWorkout(member.id, parsed.data);
    revalidateMemberFitness();
    return { ok: true, savedAt: Date.now(), workout };
  } catch (e) {
    const error =
      e instanceof FitnessServiceError ? e.message : "Error saving workout. Please try again.";
    return { ok: false, error };
  }
}

const quickSchema = z.enum(Object.keys(QUICK_LOG_MINUTES) as [keyof typeof QUICK_LOG_MINUTES]);

/** "Quick Log" buttons: a default-length session of the given type. */
export async function quickLogAction(type: string): Promise<LogWorkoutState> {
  const member = await requireMember();
  const parsed = quickSchema.safeParse(type);
  if (!parsed.success) return { ok: false, error: "Error saving workout. Please try again." };
  try {
    const workout = await logWorkout(member.id, {
      type: parsed.data,
      duration: QUICK_LOG_MINUTES[parsed.data],
    });
    revalidateMemberFitness();
    return { ok: true, savedAt: Date.now(), workout };
  } catch {
    return { ok: false, error: "Error saving workout. Please try again." };
  }
}
