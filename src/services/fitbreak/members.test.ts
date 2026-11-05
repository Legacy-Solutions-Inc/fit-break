import { beforeEach, describe, expect, it } from "vitest";

import {
  MAX_CLASS_CAPACITY,
  classStart,
  formatDateKey,
  toDateKey,
  upcomingClassDateKeys,
  weekdayOf,
} from "./catalog";
import {
  DEMO_STARTING_CREDITS,
  MemberServiceError,
  bookClass,
  cancelBooking,
  getAccount,
  getBookingCounts,
  getCreditSummary,
  listBookings,
  rescheduleBooking,
  resetMemberStore,
} from "./members";

// Wednesday 4 Nov 2026, 08:00 in Manila (UTC+8).
const NOW = new Date("2026-11-04T00:00:00Z");
const HOUR = 3_600_000;
const USER = "user-a";

async function expectCode(promise: Promise<unknown>, code: MemberServiceError["code"]) {
  await expect(promise).rejects.toBeInstanceOf(MemberServiceError);
  await expect(promise).rejects.toMatchObject({ code });
}

beforeEach(() => {
  resetMemberStore();
});

describe("studio calendar (Asia/Manila)", () => {
  it("keys dates in Manila time regardless of the runtime timezone", () => {
    expect(toDateKey(new Date("2026-11-04T15:59:00Z"))).toBe("2026-11-04");
    expect(toDateKey(new Date("2026-11-04T16:00:00Z"))).toBe("2026-11-05");
  });

  it("computes class starts as Manila wall-clock times", () => {
    expect(classStart("2026-11-04", "06:30").toISOString()).toBe("2026-11-03T22:30:00.000Z");
    expect(classStart("2026-11-04", "19:30").toISOString()).toBe("2026-11-04T11:30:00.000Z");
  });

  it("lists Mon–Sat from today through the end of next month", () => {
    const days = upcomingClassDateKeys(NOW);
    expect(days[0]).toBe("2026-11-04");
    expect(days.at(-1)).toBe("2026-12-31");
    expect(days.some((d) => weekdayOf(d) === 0)).toBe(false);
    expect(formatDateKey(days[0]!, { weekday: "long", month: "long", day: "numeric" })).toBe(
      "Wednesday, November 4",
    );
  });
});

describe("bookClass", () => {
  const slot = { userId: USER, programId: "cardio-crush", date: "2026-11-05", time: "18:00" };

  it("books a class, spends one credit and shows up in the member's bookings", async () => {
    const booking = await bookClass(slot, NOW);
    expect(booking).toMatchObject({
      status: "confirmed",
      programName: "Cardio Crush",
      endTime: "19:00",
    });
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS - 1);
    expect(await listBookings(USER)).toEqual([booking]);
    expect((await getBookingCounts())["2026-11-05|18:00|cardio-crush"]).toBe(1);
  });

  it("refuses classes that have started or passed (Manila time)", async () => {
    // 06:30 Manila on 4 Nov is before NOW (08:00 Manila).
    await expectCode(
      bookClass({ ...slot, date: "2026-11-04", time: "06:30" }, NOW),
      "class-started",
    );
    await bookClass({ ...slot, date: "2026-11-04", time: "09:00" }, NOW);
  });

  it("refuses Sundays, unknown slots/programs and dates past the schedule window", async () => {
    await expectCode(bookClass({ ...slot, date: "2026-11-08" }, NOW), "invalid"); // Sunday
    await expectCode(bookClass({ ...slot, time: "07:00" }, NOW), "invalid");
    await expectCode(bookClass({ ...slot, programId: "yoga" }, NOW), "invalid");
    await expectCode(bookClass({ ...slot, date: "2027-01-04" }, NOW), "invalid");
  });

  it("requires a credit", async () => {
    const account = await getAccount(USER);
    account.credits = 0;
    await expectCode(bookClass(slot, NOW), "insufficient-credits");
  });

  it("refuses expired credits", async () => {
    const account = await getAccount(USER);
    account.creditsExpireAt = new Date(NOW.getTime() - HOUR).toISOString();
    await expectCode(bookClass(slot, NOW), "credits-expired");
    expect(account.credits).toBe(DEMO_STARTING_CREDITS);
  });

  it("refuses a second booking for the same class or the same time", async () => {
    await bookClass(slot, NOW);
    await expectCode(bookClass(slot, NOW), "already-booked");
    await expectCode(bookClass({ ...slot, programId: "booty-and-burn" }, NOW), "already-booked");
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS - 1);
  });

  it("refuses a full class", async () => {
    for (let i = 0; i < MAX_CLASS_CAPACITY; i++) {
      await bookClass({ ...slot, userId: `other-${i}` }, NOW);
    }
    await expectCode(bookClass(slot, NOW), "class-full");
    // Another program at the same time still has room.
    await bookClass({ ...slot, programId: "core-and-balance" }, NOW);
  });
});

describe("cancelBooking", () => {
  const slot = { userId: USER, programId: "tone-and-tighten", date: "2026-11-04", time: "18:00" };
  const start = classStart(slot.date, slot.time).getTime();

  it("cancels and refunds the credit up to 2 hours before class", async () => {
    const booking = await bookClass(slot, NOW);
    const cancelled = await cancelBooking(USER, booking.id, new Date(start - 2 * HOUR));
    expect(cancelled).toMatchObject({ status: "cancelled", creditRefunded: true });
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS);
    expect(await getCreditSummary(USER)).toEqual({
      purchased: DEMO_STARTING_CREDITS,
      used: 0,
      refunded: 1,
    });
    expect((await getBookingCounts())["2026-11-04|18:00|tone-and-tighten"]).toBeUndefined();
  });

  it("refuses cancellation inside the 2-hour window and after start", async () => {
    const booking = await bookClass(slot, NOW);
    await expectCode(
      cancelBooking(USER, booking.id, new Date(start - 2 * HOUR + 60_000)),
      "cancel-window",
    );
    await expectCode(cancelBooking(USER, booking.id, new Date(start + 60_000)), "class-started");
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS - 1);
  });

  it("only cancels the member's own confirmed bookings, once", async () => {
    const booking = await bookClass(slot, NOW);
    await expectCode(cancelBooking("someone-else", booking.id, NOW), "not-found");
    await cancelBooking(USER, booking.id, NOW);
    await expectCode(cancelBooking(USER, booking.id, NOW), "not-found");
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS);
  });
});

describe("rescheduleBooking", () => {
  const slot = {
    userId: USER,
    programId: "sculpt-and-strength",
    date: "2026-11-05",
    time: "06:30",
  };

  it("moves a booking to another slot without spending a credit", async () => {
    const booking = await bookClass(slot, NOW);
    const moved = await rescheduleBooking(
      USER,
      booking.id,
      { date: "2026-11-06", time: "19:30" },
      NOW,
    );
    expect(moved).toMatchObject({ date: "2026-11-06", time: "19:30", endTime: "20:30" });
    expect(moved.rescheduledFrom).toMatchObject({ date: "2026-11-05", time: "06:30" });
    expect((await getAccount(USER)).credits).toBe(DEMO_STARTING_CREDITS - 1);
  });

  it("refuses the current slot, passed slots and full classes", async () => {
    const booking = await bookClass(slot, NOW);
    await expectCode(
      rescheduleBooking(USER, booking.id, { date: slot.date, time: slot.time }, NOW),
      "invalid",
    );
    await expectCode(
      rescheduleBooking(USER, booking.id, { date: "2026-11-04", time: "06:30" }, NOW),
      "class-started",
    );
    for (let i = 0; i < MAX_CLASS_CAPACITY; i++) {
      await bookClass({ ...slot, userId: `other-${i}`, date: "2026-11-07" }, NOW);
    }
    await expectCode(
      rescheduleBooking(USER, booking.id, { date: "2026-11-07", time: "06:30" }, NOW),
      "class-full",
    );
  });
});
