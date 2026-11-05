"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMember } from "@/lib/fitbreak/member";
import { MemberServiceError, submitPayment } from "@/services/fitbreak/members";

import { MAX_PROOF_BYTES, sanitizeFileName, sniffProofType } from "./proof";

export interface PaymentFormState {
  ok: boolean;
  error?: string;
  /** Bumped on every successful submit so the form can react to repeats. */
  submittedAt?: number;
}

const paymentSchema = z.object({
  packageId: z.enum(["drop-in", "starter", "standard", "power"]),
  method: z.enum(["gcash", "bpi"]),
  referenceNumber: z
    .string()
    .trim()
    .min(4, "Enter the reference number from your payment confirmation.")
    .max(40, "Reference number is too long.")
    .regex(/^[A-Za-z0-9 -]+$/, "Reference number may only contain letters, numbers and dashes."),
});

/**
 * Records a GCash/BPI payment with its proof of payment (replaces the source's
 * checkout.html upload). The proof is validated by size and by its actual
 * bytes (JPEG/PNG/WebP/GIF/HEIC or PDF, ≤ 5 MB); only its sanitised file name
 * is stored — the file itself is never written anywhere.
 */
export async function submitPaymentAction(
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const member = await requireMember();
  const parsed = paymentSchema.safeParse({
    packageId: formData.get("packageId"),
    method: formData.get("method"),
    referenceNumber: formData.get("referenceNumber"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payment details." };
  }

  const proof = formData.get("proof");
  if (!(proof instanceof File) || proof.size === 0) {
    return { ok: false, error: "Please upload your proof of payment." };
  }
  if (proof.size > MAX_PROOF_BYTES) {
    return { ok: false, error: "File is too large. Maximum size is 5 MB." };
  }
  const head = new Uint8Array(await proof.slice(0, 16).arrayBuffer());
  if (!sniffProofType(head)) {
    return { ok: false, error: "Please upload an image (JPG, PNG, WebP, GIF, HEIC) or a PDF." };
  }

  try {
    await submitPayment({
      userId: member.id,
      ...parsed.data,
      proofFileName: sanitizeFileName(proof.name),
    });
    revalidatePath("/", "layout");
    return { ok: true, submittedAt: Date.now() };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof MemberServiceError
          ? error.message
          : "Failed to submit payment. Please try again.",
    };
  }
}
