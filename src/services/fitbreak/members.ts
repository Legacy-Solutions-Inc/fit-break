import {
  CANCEL_CUTOFF_HOURS,
  CLASS_MINUTES,
  MAX_CLASS_CAPACITY,
  PACKAGES,
  addMinutesToTime,
  classStart,
  getProgram,
  isDateKey,
  isTimeSlot,
  scheduleEndKey,
  toDateKey,
  weekdayOf,
  type ClassPackage,
} from "@/services/fitbreak/catalog";

// ─────────────────────────────────────────────────────────────────────────────
// FitBreak Member Service Seam — credits, bookings, payments, profile.
//
// The live site keeps all of this in Firebase (users, bookings, payments
// collections + Cloud Functions). This clone is mock-first (docs/adr/0003): an
// in-memory store keyed by the Supabase user id. Swap these function bodies for
// Drizzle/Supabase queries later; callers (Server Components / Actions) don't
// change. Everything here runs server-side only.
//
// MOCK-ONLY behaviour (documented so it is never mistaken for production):
//   • every new account is seeded with DEMO_STARTING_CREDITS so the booking
//     flow is usable locally without an admin verifying a payment;
//   • submitted payments stay "pending" (verification is an admin task the
//     live site does in admin.html, which is out of scope).
//
// Every rule that depends on the clock takes an optional `now` (defaults to
// the real time) so the rules are unit-testable — see members.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_STARTING_CREDITS = 8;
/** Credits from the demo seed expire this many days after the account is created. */
const DEMO_CREDIT_VALIDITY_DAYS = 30;
export { CANCEL_CUTOFF_HOURS };

export type BookingStatus = "confirmed" | "cancelled" | "attended";

export interface Booking {
  id: string;
  userId: string;
  programId: string;
  programName: string;
  /** Local date key "YYYY-MM-DD". */
  date: string;
  /** Start time "HH:MM" (24h). */
  time: string;
  endTime: string;
  status: BookingStatus;
  creditsUsed: number;
  creditRefunded: boolean;
  createdAt: string;
  cancelledAt?: string;
  rescheduledAt?: string;
  rescheduledFrom?: { programName: string; date: string; time: string };
}

export type PaymentStatus = "pending" | "verified" | "rejected";
export type PaymentMethod = "gcash" | "bpi";

export interface Payment {
  id: string;
  userId: string;
  packageId: ClassPackage["id"];
  packageName: string;
  credits: number;
  amountPhp: number;
  method: PaymentMethod;
  referenceNumber: string;
  proofFileName?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface MemberProfile {
  fullName: string;
  phone: string;
  birthday: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  fitnessGoal: string;
  healthNotes: string;
}

export interface MemberSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  promoEmails: boolean;
}

export interface MemberAccount {
  userId: string;
  email: string;
  credits: number;
  creditsExpireAt: string | null;
  membershipStatus: "free" | "member";
  memberSince: string;
  referralCode: string;
  profile: MemberProfile;
  settings: MemberSettings;
}

interface Store {
  accounts: Map<string, MemberAccount>;
  bookings: Booking[];
  payments: Payment[];
  seq: number;
}

// Survive dev HMR module reloads (otherwise every edit wipes the mock data).
const g = globalThis as typeof globalThis & { __fitbreakMemberStore?: Store };
const store: Store = (g.__fitbreakMemberStore ??= {
  accounts: new Map(),
  bookings: [],
  payments: [],
  seq: 1,
});

function nextId(prefix: string): string {
  return `${prefix}-${String(store.seq++).padStart(5, "0")}`;
}

/** Test-only: wipes the in-memory store. */
export function resetMemberStore(): void {
  store.accounts.clear();
  store.bookings.length = 0;
  store.payments.length = 0;
  store.seq = 1;
}

export class MemberServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "insufficient-credits"
      | "credits-expired"
      | "class-full"
      | "already-booked"
      | "class-started"
      | "cancel-window"
      | "not-found"
      | "invalid",
  ) {
    super(message);
  }
}

/** Returns the member's account, creating (and seeding) it on first access. */
export async function getAccount(userId: string, email = ""): Promise<MemberAccount> {
  let account = store.accounts.get(userId);
  if (!account) {
    const now = new Date();
    const expires = new Date(now.getTime() + DEMO_CREDIT_VALIDITY_DAYS * 86_400_000);
    account = {
      userId,
      email,
      credits: DEMO_STARTING_CREDITS,
      creditsExpireAt: expires.toISOString(),
      membershipStatus: "free",
      memberSince: now.toISOString(),
      referralCode: `FB${userId
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 6)
        .toUpperCase()}`,
      profile: {
        fullName: "",
        phone: "",
        birthday: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        fitnessGoal: "",
        healthNotes: "",
      },
      // Defaults mirror settings.html: the Promotional Emails toggle starts unchecked.
      settings: { emailReminders: true, smsReminders: false, promoEmails: false },
    };
    store.accounts.set(userId, account);
  }
  if (email && !account.email) account.email = email;
  return account;
}

export async function updateProfile(
  userId: string,
  patch: Partial<MemberProfile>,
): Promise<MemberAccount> {
  const account = await getAccount(userId);
  account.profile = { ...account.profile, ...patch };
  return account;
}

export async function updateSettings(
  userId: string,
  patch: Partial<MemberSettings>,
): Promise<MemberAccount> {
  const account = await getAccount(userId);
  account.settings = { ...account.settings, ...patch };
  return account;
}

/** Bookings for one member, soonest first. */
export async function listBookings(userId: string): Promise<Booking[]> {
  return store.bookings
    .filter((b) => b.userId === userId)
    .sort((a, b) => classStart(a.date, a.time).getTime() - classStart(b.date, b.time).getTime());
}

/** Confirmed headcount per slot, keyed `${date}|${time}|${programId}`. */
export async function getBookingCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const b of store.bookings) {
    if (b.status !== "confirmed") continue;
    const key = `${b.date}|${b.time}|${b.programId}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Throws unless `date`/`time` name a real, bookable class in the schedule window. */
function assertBookableSlot(date: string, time: string, now: Date): void {
  if (!isDateKey(date) || !isTimeSlot(time) || weekdayOf(date) === 0) {
    throw new MemberServiceError("That class does not exist.", "invalid");
  }
  if (date > scheduleEndKey(toDateKey(now))) {
    throw new MemberServiceError("That class is not open for booking yet.", "invalid");
  }
  if (classStart(date, time).getTime() <= now.getTime()) {
    throw new MemberServiceError("This class has already started.", "class-started");
  }
}

/** Throws if `userId` cannot take `programId` at `date`/`time` (duplicate / capacity). */
function assertSlotAvailable(
  userId: string,
  programId: string,
  date: string,
  time: string,
  ignoreBookingId?: string,
): void {
  const sameSlot = store.bookings.filter(
    (b) =>
      b.status === "confirmed" && b.date === date && b.time === time && b.id !== ignoreBookingId,
  );
  const mine = sameSlot.find((b) => b.userId === userId);
  if (mine) {
    throw new MemberServiceError(
      mine.programId === programId
        ? "You already have a booking for this class!"
        : "You already have a booking at this time.",
      "already-booked",
    );
  }
  if (sameSlot.filter((b) => b.programId === programId).length >= MAX_CLASS_CAPACITY) {
    throw new MemberServiceError(
      "Sorry, this class is now full. Please choose another time.",
      "class-full",
    );
  }
}

/** Books one class for one credit (schedule.js confirmProgramBooking rules). */
export async function bookClass(
  input: { userId: string; programId: string; date: string; time: string },
  now: Date = new Date(),
): Promise<Booking> {
  const program = getProgram(input.programId);
  if (!program) throw new MemberServiceError("Unknown program.", "invalid");
  assertBookableSlot(input.date, input.time, now);

  const account = await getAccount(input.userId);
  const creditsRequired = 1;
  if (account.creditsExpireAt && new Date(account.creditsExpireAt).getTime() < now.getTime()) {
    throw new MemberServiceError(
      "Your credits have expired. Please purchase a new package.",
      "credits-expired",
    );
  }
  if (account.credits < creditsRequired) {
    throw new MemberServiceError(
      "Insufficient credits. Please purchase more.",
      "insufficient-credits",
    );
  }
  assertSlotAvailable(input.userId, program.id, input.date, input.time);

  account.credits -= creditsRequired;
  const booking: Booking = {
    id: nextId("BK"),
    userId: input.userId,
    programId: program.id,
    programName: program.name,
    date: input.date,
    time: input.time,
    endTime: addMinutesToTime(input.time, CLASS_MINUTES),
    status: "confirmed",
    creditsUsed: creditsRequired,
    creditRefunded: false,
    createdAt: now.toISOString(),
  };
  store.bookings.push(booking);
  return booking;
}

function findConfirmed(userId: string, bookingId: string): Booking {
  const booking = store.bookings.find((b) => b.id === bookingId && b.userId === userId);
  if (!booking || booking.status !== "confirmed") {
    throw new MemberServiceError("Booking not found.", "not-found");
  }
  return booking;
}

/**
 * Cancels a confirmed booking and refunds its credit. Refused once the class
 * is less than CANCEL_CUTOFF_HOURS away (bookings.js cancelBooking).
 */
export async function cancelBooking(
  userId: string,
  bookingId: string,
  now: Date = new Date(),
): Promise<Booking> {
  const booking = findConfirmed(userId, bookingId);
  const hoursUntil = (classStart(booking.date, booking.time).getTime() - now.getTime()) / 3_600_000;
  if (hoursUntil <= 0)
    throw new MemberServiceError("This class has already started.", "class-started");
  if (hoursUntil < CANCEL_CUTOFF_HOURS) {
    throw new MemberServiceError(
      `Cancellation not allowed within ${CANCEL_CUTOFF_HOURS} hours of class start time`,
      "cancel-window",
    );
  }
  booking.status = "cancelled";
  booking.cancelledAt = now.toISOString();
  const account = await getAccount(userId);
  account.credits += booking.creditsUsed;
  booking.creditRefunded = true;
  return booking;
}

/** Moves a confirmed, not-yet-started booking to another slot of the same program. */
export async function rescheduleBooking(
  userId: string,
  bookingId: string,
  target: { date: string; time: string },
  now: Date = new Date(),
): Promise<Booking> {
  const booking = findConfirmed(userId, bookingId);
  if (classStart(booking.date, booking.time).getTime() <= now.getTime()) {
    throw new MemberServiceError("This class has already started.", "class-started");
  }
  if (booking.date === target.date && booking.time === target.time) {
    throw new MemberServiceError("That is your current booking.", "invalid");
  }
  assertBookableSlot(target.date, target.time, now);
  assertSlotAvailable(userId, booking.programId, target.date, target.time, booking.id);

  booking.rescheduledFrom = {
    programName: booking.programName,
    date: booking.date,
    time: booking.time,
  };
  booking.rescheduledAt = now.toISOString();
  booking.date = target.date;
  booking.time = target.time;
  booking.endTime = addMinutesToTime(target.time, CLASS_MINUTES);
  return booking;
}

export interface CreditSummary {
  /** Demo seed + verified purchases. */
  purchased: number;
  /** Credits spent on bookings that were not refunded. */
  used: number;
  /** Credits returned by cancellations. */
  refunded: number;
}

export async function getCreditSummary(userId: string): Promise<CreditSummary> {
  const verified = store.payments.filter((p) => p.userId === userId && p.status === "verified");
  const mine = store.bookings.filter((b) => b.userId === userId);
  return {
    purchased: DEMO_STARTING_CREDITS + verified.reduce((sum, p) => sum + p.credits, 0),
    used: mine.filter((b) => !b.creditRefunded).reduce((sum, b) => sum + b.creditsUsed, 0),
    refunded: mine.filter((b) => b.creditRefunded).reduce((sum, b) => sum + b.creditsUsed, 0),
  };
}

export async function listPayments(userId: string): Promise<Payment[]> {
  return store.payments
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Records a GCash/BPI payment for verification (stays "pending" in the mock). */
export async function submitPayment(input: {
  userId: string;
  packageId: ClassPackage["id"];
  method: PaymentMethod;
  referenceNumber: string;
  proofFileName?: string;
}): Promise<Payment> {
  const pkg = PACKAGES.find((p) => p.id === input.packageId);
  if (!pkg) throw new MemberServiceError("Unknown package.", "invalid");
  const payment: Payment = {
    id: nextId("PAY"),
    userId: input.userId,
    packageId: pkg.id,
    packageName: pkg.name,
    credits: pkg.credits,
    amountPhp: pkg.pricePhp,
    method: input.method,
    referenceNumber: input.referenceNumber,
    proofFileName: input.proofFileName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.payments.push(payment);
  return payment;
}
