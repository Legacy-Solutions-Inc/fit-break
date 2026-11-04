import { describe, expect, it } from "vitest";

import { sanitizeFileName, sniffProofType } from "./proof";

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)].slice(0, 16));

describe("sniffProofType", () => {
  it("accepts images and PDFs by their magic bytes", () => {
    expect(sniffProofType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
    expect(sniffProofType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(sniffProofType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe("gif");
    expect(sniffProofType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe(
      "webp",
    );
    expect(sniffProofType(new TextEncoder().encode("\0\0\0\x18ftypheic0000"))).toBe("heic");
    expect(sniffProofType(new TextEncoder().encode("%PDF-1.7\n"))).toBe("pdf");
  });

  it("rejects anything else, whatever its name or claimed type", () => {
    expect(sniffProofType(new TextEncoder().encode("<html><script>"))).toBeNull();
    expect(sniffProofType(bytes(0x4d, 0x5a))).toBeNull(); // .exe
    expect(sniffProofType(new Uint8Array())).toBeNull();
  });
});

describe("sanitizeFileName", () => {
  it("drops paths, control characters and markup characters", () => {
    expect(sanitizeFileName("C:\\Users\\me\\gcash receipt.png")).toBe("gcash receipt.png");
    expect(sanitizeFileName("../../etc/<b>x</b>.pdf")).toBe("b.pdf");
    expect(sanitizeFileName("a\u0000b\u001f.jpg")).toBe("ab.jpg");
    expect(sanitizeFileName("")).toBe("proof-of-payment");
    expect(sanitizeFileName("x".repeat(300))).toHaveLength(120);
  });
});
