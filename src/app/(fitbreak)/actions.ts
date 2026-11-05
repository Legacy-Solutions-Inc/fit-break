"use server";

import { z } from "zod";

import { newsletterEnabled } from "@/config";
import { subscribe } from "@/services/newsletter";

/** Where the sign-up came from (the live site tags homepage vs blog_page). */
const NEWSLETTER_SOURCES = ["homepage", "blog_page"] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  source: z.enum(NEWSLETTER_SOURCES).catch("homepage"),
});

export interface NewsletterState {
  ok: boolean;
  error?: string;
  /** Bumped on every successful submit so the form can react to repeats. */
  submittedAt?: number;
}

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Never confirm a sign-up that is not kept (the newsletter is switched off).
  if (!newsletterEnabled) {
    return { ok: false, error: "Newsletter sign-ups are not open yet." };
  }
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  try {
    await subscribe(parsed.data.email, parsed.data.source);
    return { ok: true, submittedAt: Date.now() };
  } catch {
    return { ok: false, error: "Failed to subscribe. Please try again." };
  }
}
