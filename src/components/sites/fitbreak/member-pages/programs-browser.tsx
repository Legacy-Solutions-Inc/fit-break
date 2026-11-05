"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { routes } from "../links";

export interface ClassFormat {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  goals: readonly string[];
  rating: number;
  instructorName: string;
  icon: string;
  gradient: string;
}

const FILTERS = [
  ["all", "All Programs"],
  ["balance", "Balance"],
  ["cardio", "Cardio"],
  ["core", "Core"],
  ["endurance", "Endurance"],
  ["fat burn", "Fat Burn"],
  ["flexibility", "Flexibility"],
  ["full body", "Full Body"],
  ["glutes", "Glutes"],
  ["hiit", "HIIT"],
  ["lower body", "Lower Body"],
  ["posture", "Posture"],
  ["stability", "Stability"],
  ["strength", "Strength"],
  ["toning", "Toning"],
  ["upper body", "Upper Body"],
  ["weight loss", "Weight Loss"],
] as const;

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
  "all levels": "bg-blue-100 text-blue-800",
};

/** Filter bar + class-format grid (programs.html / programs.js). */
export function ProgramsBrowser({ programs }: { programs: readonly ClassFormat[] }) {
  const [filter, setFilter] = useState<string>("all");
  const shown =
    filter === "all"
      ? programs
      : programs.filter((p) => p.goals.some((g) => g.toLowerCase().includes(filter)));

  return (
    <>
      <div className="mb-6 rounded-xl bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {FILTERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium",
                  filter === value
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <span className="text-sm text-gray-600" role="status">
              {shown.length} program{shown.length !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-600">No programs found matching your filters.</p>
          </div>
        ) : (
          shown.map((program) => (
            <div
              key={program.id}
              className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <div
                className={cn(
                  "flex h-48 items-center justify-center bg-linear-to-br",
                  program.gradient,
                )}
              >
                <div className="text-center text-white">
                  <div className="mb-2 text-5xl" aria-hidden="true">
                    {program.icon}
                  </div>
                  <div className="text-sm font-semibold tracking-wide uppercase">Daily</div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-semibold uppercase",
                      difficultyColors[program.difficulty] ?? difficultyColors.beginner,
                    )}
                  >
                    {program.difficulty}
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600">{program.description}</p>

                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span aria-hidden="true">⭐</span>
                    <span>
                      <span className="sr-only">Rating </span>
                      {program.rating}
                    </span>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  By <span className="font-semibold text-brand-600">{program.instructorName}</span>
                </div>

                {program.goals.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {program.goals.map((goal) => (
                      <span
                        key={goal}
                        className="rounded-full bg-brand-50 px-2 py-1 text-xs text-brand-700"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={routes.schedule}
                  className="block w-full rounded-lg bg-green-500 py-3 text-center font-semibold text-white transition-colors hover:bg-green-600"
                >
                  Sign up - see schedule
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
