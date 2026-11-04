// ─────────────────────────────────────────────────────────────────────────────
// FitBreak static catalogue: programs, daily time slots, class packages.
// Values are copied from the live site (schedule.js `allPrograms`/`timeSlots`,
// pricing.html packages). Pure data + pure helpers — safe on server and client.
// ─────────────────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  name: string;
  description: string;
  /** Tailwind gradient stops used for the program card (`bg-linear-to-br …`). */
  color: string;
}

export const PROGRAMS: readonly Program[] = [
  {
    id: "total-body-burn",
    name: "Total Body Burn",
    description: "Full-body strength & endurance",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "tone-and-tighten",
    name: "Tone & Tighten",
    description: "Lower body & core shaping",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "cardio-crush",
    name: "Cardio Crush",
    description: "HIIT-style conditioning",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "sculpt-and-strength",
    name: "Sculpt & Strength",
    description: "Upper body & posture",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "core-and-balance",
    name: "Core & Balance",
    description: "Abs, stability & coordination",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "booty-and-burn",
    name: "Booty & Burn",
    description: "Glutes & endurance",
    color: "from-amber-500 to-yellow-500",
  },
];

/** Daily class start times, 24h "HH:MM" (Monday–Saturday; closed Sunday). */
export const TIME_SLOTS = ["06:30", "09:00", "16:30", "18:00", "19:30"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const CLASS_MINUTES = 60;
/** Hidden from members on the source (schedule.js MAX_CLASS_CAPACITY). */
export const MAX_CLASS_CAPACITY = 20;
export const COACH_NAME = "Coach Iren";
/**
 * Members may cancel (and get the credit back) until this many hours before
 * class start; inside the window cancelling is refused (bookings.js 2-hour
 * rule; FAQ: "Cancel up to 2 hours before class starts for a full credit refund").
 */
export const CANCEL_CUTOFF_HOURS = 2;

export interface ClassPackage {
  id: "drop-in" | "starter" | "standard" | "power";
  name: string;
  credits: number;
  pricePhp: number;
  perClassPhp: number;
  validityDays: number | null;
  advanceBookingDays: number;
  requiresMembership: boolean;
}

export const PACKAGES: readonly ClassPackage[] = [
  {
    id: "drop-in",
    name: "Guest Drop-In",
    credits: 1,
    pricePhp: 350,
    perClassPhp: 350,
    validityDays: null,
    advanceBookingDays: 1,
    requiresMembership: false,
  },
  {
    id: "starter",
    name: "Starter Pack",
    credits: 6,
    pricePhp: 1800,
    perClassPhp: 300,
    validityDays: 30,
    advanceBookingDays: 3,
    requiresMembership: true,
  },
  {
    id: "standard",
    name: "Standard Pack",
    credits: 12,
    pricePhp: 3300,
    perClassPhp: 275,
    validityDays: 30,
    advanceBookingDays: 5,
    requiresMembership: true,
  },
  {
    id: "power",
    name: "Power Pack",
    credits: 20,
    pricePhp: 5000,
    perClassPhp: 250,
    validityDays: 45,
    advanceBookingDays: 7,
    requiresMembership: true,
  },
];

export const ANNUAL_MEMBERSHIP_FEE_PHP = 500;

export const PAYMENT_DETAILS = {
  bpi: { bank: "BPI", accountNumber: "8969-3458-85", accountName: "Iren San Buenaventura" },
} as const;

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

/** "18:00" → "6:00 PM" (schedule.js formatTime). */
export function formatTime(time24: string): string {
  const [h = "0", m = "00"] = time24.split(":");
  const hour = Number.parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${suffix}`;
}

// ── Studio calendar ──────────────────────────────────────────────────────────
// The studio runs on Philippine time (Asia/Manila, UTC+8, no DST). Every date
// key and class start below is computed in studio time explicitly, so results
// are identical whatever timezone the server or browser runs in.

export const STUDIO_TIME_ZONE = "Asia/Manila";
const STUDIO_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

function parseDateKey(dateKey: string): [number, number, number] {
  const [y = 0, m = 1, d = 1] = dateKey.split("-").map(Number);
  return [y, m, d];
}

function keyFromUtcParts(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Studio-calendar (Asia/Manila) "YYYY-MM-DD" for an instant (schedule.js formatDateLocal). */
export function toDateKey(date: Date): string {
  return keyFromUtcParts(new Date(date.getTime() + STUDIO_UTC_OFFSET_MS));
}

/** `dateKey` shifted by `days` calendar days. */
export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = parseDateKey(dateKey);
  return keyFromUtcParts(new Date(Date.UTC(y, m - 1, d + days)));
}

/** Day of week for a date key: 0 = Sunday … 6 = Saturday. */
export function weekdayOf(dateKey: string): number {
  const [y, m, d] = parseDateKey(dateKey);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Formats a date key with `Intl` options, independent of the runtime timezone. */
export function formatDateKey(dateKey: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = parseDateKey(dateKey);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

/** True when `dateKey` is a real calendar date written as "YYYY-MM-DD". */
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parseDateKey(value);
  return keyFromUtcParts(new Date(Date.UTC(y, m - 1, d))) === value;
}

/** Last day of the month after `dateKey`'s month (schedule.js calculateWeekDates). */
export function scheduleEndKey(fromKey: string): string {
  const [y, m] = parseDateKey(fromKey);
  return keyFromUtcParts(new Date(Date.UTC(y, m + 1, 0)));
}

/**
 * Bookable class days as studio date keys: every Monday–Saturday from today
 * (studio time) through the last day of next month — the range the live
 * schedule renders ("Nov 4 - Dec 31, 2026").
 */
export function upcomingClassDateKeys(from: Date = new Date()): string[] {
  const start = toDateKey(from);
  const end = scheduleEndKey(start);
  const out: string[] = [];
  for (let key = start; key <= end; key = addDays(key, 1)) {
    if (weekdayOf(key) !== 0) out.push(key);
  }
  return out;
}

/** Same range as {@link upcomingClassDateKeys}, as the instants of studio midnight. */
export function upcomingClassDates(from: Date = new Date()): Date[] {
  return upcomingClassDateKeys(from).map((key) => classStart(key, "00:00"));
}

/** The class start instant for a studio date key + "HH:MM" studio time. */
export function classStart(dateKey: string, time: string): Date {
  const [y, mo, d] = parseDateKey(dateKey);
  const [h = 0, mi = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - STUDIO_UTC_OFFSET_MS);
}

/** "HH:MM" plus `minutes`, wrapped to 24h. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function isTimeSlot(value: string): value is TimeSlot {
  return (TIME_SLOTS as readonly string[]).includes(value);
}
