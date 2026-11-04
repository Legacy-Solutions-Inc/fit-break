import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  computeBmi,
  estimateCalories,
  getBodyMetrics,
  getGoals,
  getPreferences,
  listTrainerApplications,
  listWorkouts,
  logWorkout,
  saveGoals,
  submitTrainerApplication,
  updateBodyMetrics,
  updatePreferences,
} from "./fitness";
import { getAccount } from "./members";

// Server Actions run against the real in-memory seams; only auth and Next's
// cache are stubbed.
const member = vi.hoisted(() => ({ id: "test-member", email: "member@test.local" }));
vi.mock("@/lib/fitbreak/member", () => ({
  requireMember: vi.fn(async () => ({
    id: member.id,
    name: "Test Member",
    email: member.email,
    avatarUrl: "",
    isDemo: false,
  })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let seq = 0;
function freshMember() {
  member.id = `test-member-${++seq}`;
  return member.id;
}

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("fitness service", () => {
  it("estimates calories per workout type", () => {
    expect(estimateCalories("hiit", 45)).toBe(540);
    expect(estimateCalories("yoga", 30)).toBe(120);
    expect(estimateCalories("other", 10)).toBe(60);
  });

  it("logs workouts newest first, keyed by member, auto-estimating blank calories", async () => {
    const a = freshMember();
    const b = `${a}-other`;
    await logWorkout(a, {
      type: "strength",
      duration: 50,
      loggedAt: new Date("2026-11-01T08:00:00"),
    });
    await logWorkout(a, {
      type: "cardio",
      duration: 30,
      calories: 999,
      notes: "  sweaty  ",
      loggedAt: new Date("2026-11-03T08:00:00"),
    });
    await logWorkout(b, { type: "yoga", duration: 20 });

    const logs = await listWorkouts(a);
    expect(logs.map((l) => l.type)).toEqual(["cardio", "strength"]);
    expect(logs[0]).toMatchObject({ caloriesBurned: 999, notes: "sweaty", userId: a });
    expect(logs[1]?.caloriesBurned).toBe(400);
    expect(await listWorkouts(b)).toHaveLength(1);
  });

  it("rejects a non-positive duration", async () => {
    await expect(logWorkout(freshMember(), { type: "hiit", duration: 0 })).rejects.toThrow(
      "Please enter a valid duration",
    );
  });

  it("caps the list at the 50 newest workouts", async () => {
    const id = freshMember();
    for (let i = 0; i < 55; i++) await logWorkout(id, { type: "walking", duration: 10 + i });
    expect(await listWorkouts(id)).toHaveLength(50);
  });

  it("merges goals over the source defaults", async () => {
    const id = freshMember();
    expect(await getGoals(id)).toEqual({
      weeklyClassesGoal: 3,
      calorieGoal: 2000,
      stepsGoal: 10000,
      waterGoal: 2000,
    });
    await saveGoals(id, { stepsGoal: 8000 });
    expect((await getGoals(id)).stepsGoal).toBe(8000);
    expect((await getGoals(id)).calorieGoal).toBe(2000);
  });

  it("derives BMI when height and weight are both known", async () => {
    const id = freshMember();
    expect(computeBmi(null, 60)).toBeNull();
    await updateBodyMetrics(id, { heightCm: 165 });
    expect((await getBodyMetrics(id)).bmi).toBeNull();
    const next = await updateBodyMetrics(id, { weightKg: 60, gender: "female" });
    expect(next).toEqual({ heightCm: 165, weightKg: 60, gender: "female", bmi: 22 });
  });

  it("defaults class reminders on and persists changes", async () => {
    const id = freshMember();
    expect(await getPreferences(id)).toEqual({ classReminders: true });
    await updatePreferences(id, { classReminders: false });
    expect(await getPreferences(id)).toEqual({ classReminders: false });
  });

  it("stores trainer applications as pending", async () => {
    const app = await submitTrainerApplication({
      fullName: "Ana",
      email: "ana@test.local",
      phone: "0917",
      certifications: "",
      experience: "1-3",
      message: "Hi",
    });
    expect(app.status).toBe("pending");
    expect((await listTrainerApplications()).some((a) => a.id === app.id)).toBe(true);
  });
});

describe("Server Action round-trips", () => {
  beforeEach(() => {
    freshMember();
  });

  it("workout log form → logWorkout → listWorkouts", async () => {
    const { logWorkoutAction } =
      await import("@/app/(fitbreak)/(site)/member/workout-tracker/actions");
    const res = await logWorkoutAction(
      { ok: false },
      form({ type: "hiit", duration: "45", calories: "", notes: "Great class" }),
    );
    expect(res.ok).toBe(true);
    const logs = await listWorkouts(member.id);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      type: "hiit",
      duration: 45,
      caloriesBurned: 540,
      notes: "Great class",
    });

    const bad = await logWorkoutAction({ ok: false }, form({ type: "hiit", duration: "0" }));
    expect(bad).toMatchObject({ ok: false, error: "Please enter a valid duration" });
    expect(await listWorkouts(member.id)).toHaveLength(1);
  });

  it("quick log uses the source's default duration", async () => {
    const { quickLogAction } =
      await import("@/app/(fitbreak)/(site)/member/workout-tracker/actions");
    expect((await quickLogAction("walking")).ok).toBe(true);
    expect((await quickLogAction("swimming")).ok).toBe(false);
    const logs = await listWorkouts(member.id);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ type: "walking", duration: 20, caloriesBurned: 100 });
  });

  it("profile form → updateProfile + body metrics (ft/in stored as cm)", async () => {
    const { saveProfile } = await import("@/app/(fitbreak)/(site)/member/profile/actions");
    const res = await saveProfile(
      { ok: false },
      form({
        fullName: "Maria Santos",
        phone: "+63 917 000 0000",
        emergencyContact: "+63 918 111 1111",
        heightUnit: "ft",
        heightFeet: "5",
        heightInches: "4",
        heightCm: "",
        weight: "58.5",
        birthday: "1995-06-15",
        gender: "female",
      }),
    );
    expect(res.ok).toBe(true);
    const account = await getAccount(member.id);
    expect(account.profile).toMatchObject({
      fullName: "Maria Santos",
      phone: "+63 917 000 0000",
      emergencyContactPhone: "+63 918 111 1111",
      birthday: "1995-06-15",
    });
    expect(await getBodyMetrics(member.id)).toEqual({
      heightCm: 163,
      weightKg: 58.5,
      gender: "female",
      bmi: 22,
    });

    // cm mode, cleared weight
    await saveProfile(
      { ok: false },
      form({
        fullName: "Maria Santos",
        phone: "",
        emergencyContact: "",
        heightUnit: "cm",
        heightCm: "170",
        weight: "",
        birthday: "",
        gender: "",
      }),
    );
    expect(await getBodyMetrics(member.id)).toEqual({
      heightCm: 170,
      weightKg: null,
      gender: "",
      bmi: null,
    });
  });

  it("notification toggles → updateSettings + class-reminder preference", async () => {
    const { saveNotificationSettings } =
      await import("@/app/(fitbreak)/(site)/member/settings/actions");
    const res = await saveNotificationSettings({
      emailNotifications: false,
      classReminders: false,
      marketingEmails: true,
    });
    expect(res).toEqual({ ok: true, message: "Settings saved" });
    const account = await getAccount(member.id);
    expect(account.settings).toMatchObject({ emailReminders: false, promoEmails: true });
    expect(await getPreferences(member.id)).toEqual({ classReminders: false });
  });

  it("goals form → saveGoals, falling back to defaults for junk", async () => {
    const { saveGoalsAction } = await import("@/app/(fitbreak)/(site)/member/settings/actions");
    const res = await saveGoalsAction(
      form({ weeklyClassesGoal: "5", calorieGoal: "1800", stepsGoal: "abc", waterGoal: "2500" }),
    );
    expect(res).toEqual({ ok: true, message: "Goals saved!" });
    expect(await getGoals(member.id)).toEqual({
      weeklyClassesGoal: 5,
      calorieGoal: 1800,
      stepsGoal: 10000,
      waterGoal: 2500,
    });
  });

  it("trainer application form → submitTrainerApplication", async () => {
    const { applyAsTrainer } = await import("@/app/(fitbreak)/(site)/member/trainers/actions");
    const before = (await listTrainerApplications()).length;
    const ok = await applyAsTrainer(
      { ok: false },
      form({
        fullName: "Bea",
        email: "bea@test.local",
        phone: "0917",
        certifications: "ACE",
        experience: "3-5",
        message: "Let me coach",
      }),
    );
    expect(ok.ok).toBe(true);
    const bad = await applyAsTrainer(
      { ok: false },
      form({ fullName: "Bea", email: "nope", phone: "1", experience: "3-5", message: "x" }),
    );
    expect(bad.ok).toBe(false);
    expect((await listTrainerApplications()).length).toBe(before + 1);
  });
});
