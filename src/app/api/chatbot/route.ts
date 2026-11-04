import { NextResponse } from "next/server";
import { z } from "zod";

import { reply } from "@/services/fitbreak/assistant";

// FitBreak Assistant endpoint. Answers locally from the app's own catalogue
// (see src/services/fitbreak/assistant.ts) — no call to the old fitbreak.ph
// backend. Response shape `{ response }` matches what the chat widget expects.
const bodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().regex(/^[\w-]{1,100}$/, "Invalid session id"),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  return NextResponse.json({ response: reply(parsed.data.message) });
}
