"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { routes } from "../links";
import { useSourceToast } from "./use-toast";

// Interactive bits of dashboard.html/dashboard.js: the booking calendar (month
// navigation, hover tooltip, day click toast) and the header search.

export interface CalendarBooking {
  className: string;
  classTime: string;
  status: "confirmed" | "attended" | "cancelled";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ChevronLeft() {
  return (
    <svg
      className="h-5 w-5 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-5 w-5 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function DashboardCalendar({
  todayKey,
  booked,
  attended,
  details,
}: {
  /** Studio-time "YYYY-MM-DD". */
  todayKey: string;
  booked: string[];
  attended: string[];
  details: Record<string, CalendarBooking[]>;
}) {
  const [ty = 2026, tm = 1] = todayKey.split("-").map(Number);
  const [month, setMonth] = useState({ year: ty, month: tm - 1 });
  const [tip, setTip] = useState<{ key: string; x: number; top: number; bottom: number } | null>(
    null,
  );
  const { show, node: toastNode } = useSourceToast("pill");

  const firstDay = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
  const label = new Date(Date.UTC(month.year, month.month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function changeMonth(delta: number) {
    setTip(null);
    setMonth(({ year, month: m }) => {
      const d = new Date(Date.UTC(year, m + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }

  const tipBookings = tip ? (details[tip.key] ?? []) : [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500">Your class schedule</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-sm font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`e${i}`} className="p-3" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = key === todayKey;
          const isAttended = attended.includes(key);
          const isBooked = booked.includes(key);
          let cls = "relative cursor-pointer rounded-xl p-3 text-sm transition hover:bg-gray-100";
          if (isToday)
            cls =
              "relative cursor-pointer rounded-xl bg-brand-500 p-3 text-sm font-bold text-white transition";
          else if (isAttended)
            cls =
              "relative cursor-pointer rounded-xl bg-gray-300 p-3 text-sm font-medium text-gray-700 transition";
          else if (isBooked)
            cls =
              "relative cursor-pointer rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700 transition";
          const dayBookings = details[key] ?? [];
          const dot =
            isBooked || isAttended ? (
              <span
                className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${isAttended ? "bg-gray-600" : "bg-green-500"}`}
              />
            ) : null;
          if (dayBookings.length === 0) {
            return (
              <div key={key} className={cls}>
                {day}
              </div>
            );
          }
          return (
            <button
              key={key}
              type="button"
              className={cls}
              aria-label={`${key}: ${dayBookings.map((b) => b.className).join(", ")}`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTip({ key, x: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom });
              }}
              onMouseLeave={() => setTip(null)}
              onClick={() => {
                const b = dayBookings[0]!;
                show(`${b.className} - ${b.status === "attended" ? "Attended" : "Booked"}`);
              }}
            >
              {day}
              {dot}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-brand-500" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-600" />
          <span className="text-xs text-gray-600">Attended</span>
        </div>
      </div>

      {tip && tipBookings.length > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[9999] max-w-[200px] rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          style={
            tip.top > 80
              ? { left: tip.x, top: tip.top - 8, transform: "translate(-50%, -100%)" }
              : { left: tip.x, top: tip.bottom + 8, transform: "translateX(-50%)" }
          }
        >
          {tipBookings.map((b, i) => {
            const isAttended = b.status === "attended" && tip.key < todayKey;
            return (
              <div key={i} className="py-0.5">
                <span className="font-medium">{b.className}</span>
                {b.classTime ? ` @ ${b.classTime}` : ""}
                <br />
                <span className={isAttended ? "text-gray-300" : "text-green-400"}>
                  {isAttended ? "Attended" : "Booked"}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {toastNode}
    </div>
  );
}

interface SearchResult {
  type: "class" | "page" | "booking";
  title: string;
  subtitle: string;
  href: string;
}

const searchClasses = [
  { name: "Total Body Burn", day: "Monday" },
  { name: "Tone & Tighten", day: "Tuesday" },
  { name: "Cardio Crush", day: "Wednesday" },
  { name: "Sculpt & Strength", day: "Thursday" },
  { name: "Core & Balance", day: "Friday" },
  { name: "Booty & Burn", day: "Saturday" },
];

const searchPages = [
  { name: "My Profile", href: routes.member.profile },
  { name: "Settings", href: routes.member.settings },
  { name: "Bookings", href: routes.member.bookings },
  { name: "Payments", href: routes.member.payments },
  { name: "Schedule", href: routes.schedule },
  { name: "Statistics", href: routes.member.statistics },
  { name: "Pricing", href: routes.pricing },
];

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const d =
    type === "class"
      ? "M13 10V3L4 14h7v7l9-11h-7z"
      : type === "booking"
        ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function DashboardSearch({
  bookings,
}: {
  bookings: Array<{ className: string; dateLabel: string }>;
}) {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounce like the source (300 ms, min 2 characters).
  useEffect(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) {
      setOpen(false);
      setQuery("");
      return;
    }
    const t = setTimeout(() => {
      setQuery(q);
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query) return [];
    const out: SearchResult[] = [];
    for (const c of searchClasses) {
      if (c.name.toLowerCase().includes(query)) {
        out.push({ type: "class", title: c.name, subtitle: c.day, href: routes.member.bookings });
      }
    }
    for (const p of searchPages) {
      if (p.name.toLowerCase().includes(query)) {
        out.push({ type: "page", title: p.name, subtitle: "Page", href: p.href });
      }
    }
    for (const b of bookings) {
      if (b.className.toLowerCase().includes(query)) {
        out.push({
          type: "booking",
          title: b.className,
          subtitle: `Booked for ${b.dateLabel}`,
          href: routes.member.bookings,
        });
      }
    }
    return out;
  }, [query, bookings]);

  return (
    <div ref={wrapRef} className="relative flex-1 lg:w-72">
      <label htmlFor="dashboard-search" className="sr-only">
        Search classes, bookings
      </label>
      <input
        type="text"
        id="dashboard-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          if (value.trim().length >= 2 && query) setOpen(true);
        }}
        placeholder="Search classes, bookings..."
        autoComplete="off"
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-10 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-400 focus:outline-hidden"
      />
      <svg
        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No results found</div>
          ) : (
            results.slice(0, 6).map((r, i) => (
              <Link
                key={`${r.type}-${r.title}-${i}`}
                href={r.href}
                className="flex items-center gap-3 p-3 transition hover:bg-gray-50"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.type === "class" ? "bg-brand-100 text-brand-600" : r.type === "booking" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
                >
                  <ResultIcon type={r.type} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.subtitle}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
