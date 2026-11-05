"use server";

import { z } from "zod";

import { requireMember } from "@/lib/fitbreak/member";
import { submitTrainerApplication } from "@/services/fitbreak/fitness";

const applicationSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone number is required").max(40),
  certifications: z.string().trim().max(200).default(""),
  experience: z.enum(["0-1", "1-3", "3-5", "5+"], { message: "Select your years of experience" }),
  message: z.string().trim().min(1, "Tell us why you want to join").max(2000),
});

export interface ApplicationState {
  ok: boolean;
  error?: string;
}

export async function applyAsTrainer(
  _prev: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  await requireMember();
  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    certifications: formData.get("certifications") ?? "",
    experience: formData.get("experience"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid application" };
  }
  try {
    await submitTrainerApplication(parsed.data);
    return { ok: true };
  } catch {
    return { ok: false, error: "Error submitting application. Please try again." };
  }
}
