import { describe, expect, it } from "vitest";

import { newsletterEnabled } from "@/config";

import { subscribeToNewsletter } from "./actions";

function form(email: string) {
  const data = new FormData();
  data.set("email", email);
  data.set("source", "homepage");
  return data;
}

describe("subscribeToNewsletter while the newsletter is switched off", () => {
  it.skipIf(newsletterEnabled)("never reports a sign-up it did not keep", async () => {
    const state = await subscribeToNewsletter({ ok: false }, form("visitor@example.com"));
    expect(state.ok).toBe(false);
  });
});
