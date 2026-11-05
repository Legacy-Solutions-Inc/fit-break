// Proof-of-payment validation helpers (pure; unit-tested in proof.test.ts).

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

export type ProofKind = "jpeg" | "png" | "gif" | "webp" | "heic" | "pdf";

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((b, i) => bytes[offset + i] === b);
}

/** Identifies an allowed proof file from its first bytes (never trusts the client MIME type). */
export function sniffProofType(head: Uint8Array): ProofKind | null {
  if (startsWith(head, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(head, [0x47, 0x49, 0x46, 0x38])) return "gif";
  if (startsWith(head, [0x52, 0x49, 0x46, 0x46]) && startsWith(head, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "webp";
  }
  if (startsWith(head, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = String.fromCharCode(...head.slice(8, 12));
    if (["heic", "heix", "hevc", "mif1", "msf1"].includes(brand)) return "heic";
  }
  if (startsWith(head, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf";
  return null;
}

/** A display-safe file name: no path, no control characters, at most 120 chars. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[\u0000-\u001f\u007f<>"'`]/g, "").trim();
  return (clean || "proof-of-payment").slice(0, 120);
}
