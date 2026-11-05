"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/components/sites/fitbreak/links";
import { requireMember } from "@/lib/fitbreak/member";
import { saveGoals, updatePreferences } from "@/services/fitbreak/fitness";
import { updateSettings } from "@/services/fitbreak/members";

export interface SettingsResult {
  ok: boolean;
  message: string;
}

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  classReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

/**
 * The three notification toggles, saved on every change (settings.js
 * saveSettings). Email/promo map onto MemberSettings; class reminders live in
 * the fitness seam until members.ts carries the field.
 */
export async function saveNotificationSettings(
  input: z.infer<typeof notificationsSchema>,
): Promise<SettingsResult> {
  const member = await requireMember();
  const parsed = notificationsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Error saving settings" };
  try {
    await updateSettings(member.id, {
      emailReminders: parsed.data.emailNotifications,
      promoEmails: parsed.data.marketingEmails,
    });
    await updatePreferences(member.id, { classReminders: parsed.data.classReminders });
    revalidatePath(routes.member.settings);
    return { ok: true, message: "Settings saved" };
  } catch {
    return { ok: false, message: "Error saving settings" };
  }
}

/** settings.js saveGoals: unparsable values fall back to the defaults. */
const goalNumber = (fallback: number) =>
  z.preprocess((v) => {
    const n = Number.parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }, z.number().int().positive().max(1_000_000));

const goalsSchema = z.object({
  weeklyClassesGoal: goalNumber(3),
  calorieGoal: goalNumber(2000),
  stepsGoal: goalNumber(10000),
  waterGoal: goalNumber(2000),
});

export async function saveGoalsAction(formData: FormData): Promise<SettingsResult> {
  const member = await requireMember();
  const parsed = goalsSchema.safeParse({
    weeklyClassesGoal: formData.get("weeklyClassesGoal"),
    calorieGoal: formData.get("calorieGoal"),
    stepsGoal: formData.get("stepsGoal"),
    waterGoal: formData.get("waterGoal"),
  });
  if (!parsed.success) return { ok: false, message: "Error saving goals" };
  try {
    await saveGoals(member.id, parsed.data);
    revalidatePath(routes.member.settings);
    return { ok: true, message: "Goals saved!" };
  } catch {
    return { ok: false, message: "Error saving goals" };
  }
}
