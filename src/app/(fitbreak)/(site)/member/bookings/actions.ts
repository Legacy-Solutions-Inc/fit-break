"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMember } from "@/lib/fitbreak/member";
import { MemberServiceError, cancelBooking, rescheduleBooking } from "@/services/fitbreak/members";

export type BookingChangeResult = { ok: true } | { ok: false; error: string };

const bookingId = z.string().trim().min(1).max(64);
const rescheduleSchema = z.object({
  bookingId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

function failure(error: unknown, fallback: string): BookingChangeResult {
  return { ok: false, error: error instanceof MemberServiceError ? error.message : fallback };
}

/** Cancels one of the member's bookings and refunds the credit (bookings.js cancelBooking). */
export async function cancelBookingAction(id: string): Promise<BookingChangeResult> {
  const member = await requireMember();
  const parsed = bookingId.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Booking not found." };
  try {
    await cancelBooking(member.id, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return failure(error, "Error cancelling booking");
  }
}

/** Moves one of the member's bookings to another slot (bookings.js confirmReschedule). */
export async function rescheduleBookingAction(input: {
  bookingId: string;
  date: string;
  time: string;
}): Promise<BookingChangeResult> {
  const member = await requireMember();
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That class does not exist." };
  try {
    await rescheduleBooking(member.id, parsed.data.bookingId, {
      date: parsed.data.date,
      time: parsed.data.time,
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return failure(error, "Error rescheduling. Please try again.");
  }
}
