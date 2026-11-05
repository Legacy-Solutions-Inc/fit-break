import { describe, expect, it } from "vitest";

import { reply } from "./assistant";

describe("FitBreak assistant reply()", () => {
  it("answers class-hour questions with every daily slot", () => {
    const answer = reply("What are your class hours?");
    for (const t of ["6:30 AM", "9:00 AM", "4:30 PM", "6:00 PM", "7:30 PM"]) {
      expect(answer).toContain(t);
    }
    expect(answer).toMatch(/closed Sunday/i);
  });

  it("answers pricing with the package prices", () => {
    const answer = reply("How much is the power pack?");
    expect(answer).toContain("₱5,000");
    expect(answer).toContain("₱350");
  });

  it("answers location with the studio address", () => {
    expect(reply("Where are you located?")).toContain("Roxas Drive");
  });

  it("explains credits and GCash payment", () => {
    expect(reply("how do credits work with gcash")).toMatch(/1 credit = 1 class/);
  });

  it("falls back to the topic list for unrelated questions", () => {
    expect(reply("tell me a joke")).toMatch(/schedules, pricing/);
  });
});

describe("FitBreak assistant while the Member Area is parked", () => {
  it("sends booking enquiries to Messenger, never to an account", () => {
    const answer = reply("How do I book a class?");
    expect(answer).toContain("m.me/FitBreakPhilippines");
    expect(answer).not.toMatch(/create an account|sign in|online only/i);
  });

  it("points schedule questions to the timetable and a Booking Enquiry, not live availability", () => {
    const answer = reply("What time are your classes?");
    expect(answer).not.toMatch(/live availability/i);
    expect(answer).toMatch(/timetable/i);
    expect(answer).toMatch(/message us|call/i);
  });

  it("explains the credit policy without account features", () => {
    const answer = reply("How do credits work?");
    expect(answer).toMatch(/1 credit = 1 class/);
    expect(answer).toMatch(/expire/i);
    expect(answer).not.toMatch(/credits are added|account|balance/i);
  });
});
