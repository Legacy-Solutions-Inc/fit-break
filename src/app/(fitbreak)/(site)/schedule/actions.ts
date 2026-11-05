"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMember } from "@/lib/fitbreak/member";
import { MemberServiceError, bookClass, getAccount } from "@/services/fitbreak/members";

const bookingSchema = z.object({
  programId: z.string().trim().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export type BookingActionResult =
  { ok: true; credits: number } | { ok: false; error: string; code?: MemberServiceError["code"] };

/** Books a class for the signed-in member (schedule.js confirmProgramBooking). */
export async function bookClassAction(input: {
  programId: string;
  date: string;
  time: string;
}): Promise<BookingActionResult> {
  const member = await requireMember();
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That class does not exist.", code: "invalid" };

  try {
    await bookClass({ userId: member.id, ...parsed.data });
    const account = await getAccount(member.id, member.email);
    // Refresh credits/counts everywhere (sidebar, schedule, member pages).
    revalidatePath("/", "layout");
    return { ok: true, credits: account.credits };
  } catch (error) {
    if (error instanceof MemberServiceError) {
      return { ok: false, error: error.message, code: error.code };
    }
    return { ok: false, error: "Failed to book. Please try again." };
  }
}
