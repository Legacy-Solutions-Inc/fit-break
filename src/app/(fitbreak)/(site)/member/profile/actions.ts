"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/components/sites/fitbreak/links";
import { requireMember } from "@/lib/fitbreak/member";
import { updateBodyMetrics } from "@/services/fitbreak/fitness";
import { updateProfile } from "@/services/fitbreak/members";

/** Blank → null; otherwise a positive number. */
const optionalPositive = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().positive().max(max).nullable(),
  );

const profileSchema = z.object({
  fullName: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  emergencyContact: z.string().trim().max(40),
  heightUnit: z.enum(["ft", "cm"]),
  heightFeet: optionalPositive(8),
  heightInches: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).max(11).nullable(),
  ),
  heightCm: optionalPositive(272),
  weight: optionalPositive(500),
  birthday: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")]),
  gender: z.enum(["", "female", "male", "other"]),
});

export interface ProfileState {
  ok: boolean;
  error?: string;
  /** Bumped on every successful save so the toast re-fires. */
  savedAt?: number;
}

/** profile.js submit: ft/in is converted to cm for storage; BMI is derived. */
export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const member = await requireMember();
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    emergencyContact: formData.get("emergencyContact") ?? "",
    heightUnit: formData.get("heightUnit") ?? "ft",
    heightFeet: formData.get("heightFeet"),
    heightInches: formData.get("heightInches"),
    heightCm: formData.get("heightCm"),
    weight: formData.get("weight"),
    birthday: formData.get("birthday") ?? "",
    gender: formData.get("gender") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Error updating profile. Please try again." };
  }
  const d = parsed.data;

  let heightCm: number | null;
  if (d.heightUnit === "ft") {
    const feet = Math.trunc(d.heightFeet ?? 0);
    const inches = Math.trunc(d.heightInches ?? 0);
    heightCm = feet > 0 || inches > 0 ? Math.round((feet * 12 + inches) * 2.54) : null;
  } else {
    heightCm = d.heightCm;
  }

  try {
    await updateProfile(member.id, {
      fullName: d.fullName,
      phone: d.phone,
      emergencyContactPhone: d.emergencyContact,
      birthday: d.birthday,
    });
    await updateBodyMetrics(member.id, { heightCm, weightKg: d.weight, gender: d.gender });
    revalidatePath(routes.member.profile);
    return { ok: true, savedAt: Date.now() };
  } catch {
    return { ok: false, error: "Error updating profile. Please try again." };
  }
}
