"use client";

import { useState } from "react";

import { STUDIO_TIME_ZONE } from "@/services/fitbreak/catalog";

import { useSourceToast } from "./use-toast";

// payments.html "Credit Usage History" + payments.js loadCreditUsageHistory /
// renderUsageHistory / exportUsageHistory.

export interface UsageItem {
  type: "credit_added" | "credit_used" | "credit_refunded";
  /** ISO timestamp. */
  date: string;
  credits: number;
  description: string;
  amount?: number;
  classTime?: string;
  status?: "confirmed" | "attended";
}

type Filter = "all" | "week" | "month" | "3months";

const icons = {
  credit_added: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  credit_used: "M20 12H4",
  credit_refunded:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

function Svg({ d, className }: { d: string; className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function CreditUsage({
  items,
  nowMs,
  purchased,
  used,
  attended,
}: {
  items: UsageItem[];
  nowMs: number;
  purchased: number;
  used: number;
  attended: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { show, node: toastNode } = useSourceToast("pill");

  const firstMs = items.length > 0 ? new Date(items[items.length - 1]!.date).getTime() : nowMs;
  const weeks = Math.max(1, Math.ceil((nowMs - firstMs) / (7 * 86_400_000)));
  const avg = items.length > 0 ? (attended / weeks).toFixed(1) : "0";

  const cutoff = (() => {
    const d = new Date(nowMs);
    if (filter === "week") d.setDate(d.getDate() - 7);
    else if (filter === "month") d.setMonth(d.getMonth() - 1);
    else if (filter === "3months") d.setMonth(d.getMonth() - 3);
    else return null;
    return d.getTime();
  })();
  const filtered =
    cutoff === null ? items : items.filter((i) => new Date(i.date).getTime() >= cutoff);
  const thisYear = new Date(nowMs).toLocaleDateString("en-PH", {
    year: "numeric",
    timeZone: STUDIO_TIME_ZONE,
  });

  function exportCsv() {
    if (items.length === 0) {
      show("No usage history to export");
      return;
    }
    const header = ["Date", "Type", "Description", "Credits", "Amount"];
    const rows = items.map((i) => [
      i.date.split("T")[0],
      i.type.replace("credit_", "").replace("_", " "),
      `"${i.description.replace(/"/g, '""')}"`,
      String(i.credits),
      i.amount ? String(i.amount) : "",
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitbreak-credit-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show("Usage history exported!");
  }

  const stats = [
    {
      label: "Credits Purchased",
      value: purchased,
      bg: "bg-brand-100",
      fg: "text-brand-600",
      d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Credits Used",
      value: used,
      bg: "bg-green-100",
      fg: "text-green-600",
      d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Classes Attended",
      value: attended,
      bg: "bg-blue-100",
      fg: "text-blue-600",
      d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Avg Classes/Week",
      value: avg,
      bg: "bg-purple-100",
      fg: "text-purple-600",
      d: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Credit Usage History</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="usage-filter" className="sr-only">
            Time period
          </label>
          <select
            id="usage-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:outline-hidden"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.bg}`}>
                <Svg d={s.d} className={`h-5 w-5 ${s.fg}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border border-gray-100 bg-white shadow-xs"
        data-tour="credit-history"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900">Recent Credit Activity</h3>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Svg
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              className="h-4 w-4"
            />
            Export
          </button>
        </div>
        <div id="credit-usage-history" className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Svg
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                className="mx-auto mb-4 h-12 w-12 text-gray-300"
              />
              <p>No activity in this period</p>
            </div>
          ) : (
            filtered.slice(0, 50).map((item, i) => {
              const d = new Date(item.date);
              const sameYear =
                d.toLocaleDateString("en-PH", { year: "numeric", timeZone: STUDIO_TIME_ZONE }) ===
                thisYear;
              const dateStr = d.toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: sameYear ? undefined : "numeric",
                timeZone: STUDIO_TIME_ZONE,
              });
              const timeStr = d.toLocaleTimeString("en-PH", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: STUDIO_TIME_ZONE,
              });
              const tone =
                item.type === "credit_added"
                  ? { bg: "bg-green-100", fg: "text-green-600" }
                  : item.type === "credit_refunded"
                    ? { bg: "bg-yellow-100", fg: "text-yellow-600" }
                    : item.status === "attended"
                      ? { bg: "bg-brand-100", fg: "text-brand-600" }
                      : { bg: "bg-blue-100", fg: "text-blue-600" };
              return (
                <div
                  key={`${item.date}-${i}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className={`shrink-0 rounded-lg p-2 ${tone.bg}`}>
                    <Svg d={icons[item.type]} className={`h-5 w-5 ${tone.fg}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      {dateStr} at {timeStr}
                      {item.classTime ? ` • ${item.classTime}` : ""}
                      {item.amount ? ` • ₱${item.amount.toLocaleString("en-US")}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-bold ${item.credits > 0 ? "text-green-600" : "text-gray-700"}`}
                    >
                      {item.credits > 0 ? `+${item.credits}` : item.credits} credit
                      {Math.abs(item.credits) !== 1 ? "s" : ""}
                    </p>
                    {item.status && (
                      <span
                        className={`text-xs ${item.status === "attended" ? "text-green-600" : "text-blue-600"}`}
                      >
                        {item.status === "attended" ? "Attended" : "Booked"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {toastNode}
    </div>
  );
}
