"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import {
  logWorkoutAction,
  quickLogAction,
  type LogWorkoutState,
} from "@/app/(fitbreak)/(site)/member/workout-tracker/actions";
import { cn } from "@/lib/utils";
import type { WorkoutLog, WorkoutType } from "@/services/fitbreak/fitness";

import { formatWorkoutDate, todaySummary, workoutsThisWeek } from "./stats";
import { useIsClient, useToast } from "./use-toast";

/** workout-tracker.html WEEKLY_GOAL (fixed; not the Settings goal). */
const WEEKLY_GOAL = 5;

const BOLT = "M13 10V3L4 14h7v7l9-11h-7z";
const TREND = "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6";
const HEART =
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z";

const typeConfig: Record<WorkoutType, { label: string; icon: string; box: string; text: string }> =
  {
    hiit: { label: "HIIT / Bootcamp", icon: BOLT, box: "bg-brand-50", text: "text-brand-500" },
    strength: { label: "Strength Training", icon: TREND, box: "bg-blue-50", text: "text-blue-500" },
    cardio: { label: "Cardio", icon: HEART, box: "bg-orange-50", text: "text-orange-500" },
    yoga: { label: "Yoga / Stretching", icon: HEART, box: "bg-purple-50", text: "text-purple-500" },
    walking: {
      label: "Walking / Running",
      icon: TREND,
      box: "bg-green-50",
      text: "text-green-500",
    },
    other: { label: "Other", icon: BOLT, box: "bg-gray-50", text: "text-gray-500" },
  };

const quickButtons = [
  { type: "cardio", emoji: "🏃‍♀️", label: "Cardio", className: "bg-brand-50 hover:bg-brand-100" },
  { type: "strength", emoji: "💪", label: "Strength", className: "bg-blue-50 hover:bg-blue-100" },
  { type: "yoga", emoji: "🧘‍♀️", label: "Yoga", className: "bg-purple-50 hover:bg-purple-100" },
  { type: "walking", emoji: "🚶‍♀️", label: "Walking", className: "bg-green-50 hover:bg-green-100" },
] as const;

function Svg({ d, className }: { d: string; className?: string }) {
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

const initial: LogWorkoutState = { ok: false };

export function WorkoutTracker({ workouts }: { workouts: WorkoutLog[] }) {
  const isClient = useIsClient();
  const [toast, showToast] = useToast();
  const [open, setOpen] = useState(false);
  const [quickPending, startQuick] = useTransition();
  const [state, action, pending] = useActionState(logWorkoutAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.savedAt) {
      showToast("Workout logged!");
      setOpen(false);
      formRef.current?.reset();
    } else if (state.error) {
      showToast(state.error);
    }
    // React to each action result only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const now = new Date();
  const today = isClient ? todaySummary(workouts, now) : { workouts: 0, minutes: 0, calories: 0 };
  const weekCount = isClient ? workoutsThisWeek(workouts, now) : 0;
  const percent = Math.min(100, Math.round((weekCount / WEEKLY_GOAL) * 100));
  const remaining = Math.max(0, WEEKLY_GOAL - weekCount);
  const weeklyMessage =
    weekCount >= WEEKLY_GOAL
      ? "Goal reached! Amazing work!"
      : weekCount === 0
        ? "Start logging workouts!"
        : `${remaining} more to reach your goal!`;

  function quickLog(type: (typeof quickButtons)[number]["type"]) {
    startQuick(async () => {
      const result = await quickLogAction(type);
      showToast(
        result.ok ? "Workout logged!" : (result.error ?? "Error saving workout. Please try again."),
      );
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Tracker</h1>
          <p className="text-gray-600">Log and track your daily workouts</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-semibold text-white transition hover:bg-brand-600"
        >
          <Svg d="M12 6v6m0 0v6m0-6h6m-6 0H6" className="h-5 w-5" />
          Log Workout
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-6 text-white">
        <h2 className="mb-4 text-lg font-semibold">Today&apos;s Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              [today.workouts, "Workouts"],
              [today.minutes, "Minutes"],
              [today.calories, "Calories"],
            ] as const
          ).map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-brand-100">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Recent Workouts</h2>
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-xs">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Svg d={BOLT} className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No workouts logged yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Click &quot;Log Workout&quot; to get started!
                </p>
              </div>
            ) : (
              workouts.slice(0, 10).map((w) => {
                const c = typeConfig[w.type] ?? typeConfig.other;
                return (
                  <div
                    key={w.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-xs"
                  >
                    <div
                      className={cn("flex h-12 w-12 items-center justify-center rounded-xl", c.box)}
                    >
                      <Svg d={c.icon} className={cn("h-6 w-6", c.text)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{c.label}</p>
                      <p className="text-sm text-gray-500">
                        {isClient ? formatWorkoutDate(new Date(w.loggedAt), now) : " "} •{" "}
                        {w.duration} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", c.text)}>{w.caloriesBurned} cal</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="mb-4 font-bold text-gray-900">Weekly Goal</h3>
            <div className="mb-4 text-center">
              <p className="text-4xl font-bold text-brand-500">
                <span>{weekCount}</span>
                <span className="text-gray-300">/{WEEKLY_GOAL}</span>
              </p>
              <p className="text-sm text-gray-500">workouts this week</p>
            </div>
            <div
              className="h-3 w-full rounded-full bg-gray-200"
              role="progressbar"
              aria-label="Weekly goal progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-3 rounded-full bg-brand-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p
              className={cn(
                "mt-2 text-center text-xs text-gray-500",
                weekCount >= WEEKLY_GOAL && "text-green-600",
              )}
            >
              {weeklyMessage}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="mb-4 font-bold text-gray-900">Quick Log</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickButtons.map((b) => (
                <button
                  key={b.type}
                  type="button"
                  disabled={quickPending}
                  onClick={() => quickLog(b.type)}
                  className={cn("rounded-xl p-3 text-center transition", b.className)}
                >
                  <span className="mb-1 block text-2xl" aria-hidden="true">
                    {b.emoji}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kept mounted (hidden) so the form keeps its state across open/close, like the source. */}
      <div
        className={cn(
          "fixed inset-0 z-50 items-center justify-center bg-black/50 p-4",
          open ? "flex" : "hidden",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-workout-title"
          className="w-full max-w-md rounded-2xl bg-white p-6"
        >
          <h2 id="log-workout-title" className="mb-4 text-xl font-bold text-gray-900">
            Log Workout
          </h2>
          <form ref={formRef} action={action} className="space-y-4">
            <div>
              <label
                htmlFor="workout-type"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Workout Type
              </label>
              <select
                id="workout-type"
                name="type"
                defaultValue="hiit"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5"
              >
                <option value="hiit">HIIT / Bootcamp</option>
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga / Stretching</option>
                <option value="walking">Walking / Running</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="workout-duration"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Duration (minutes)
              </label>
              <input
                id="workout-duration"
                name="duration"
                type="number"
                defaultValue={45}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5"
              />
            </div>
            <div>
              <label
                htmlFor="workout-calories"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Calories Burned (optional)
              </label>
              <input
                id="workout-calories"
                name="calories"
                type="number"
                placeholder="Leave blank for auto-estimate"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label
                htmlFor="workout-notes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="workout-notes"
                name="notes"
                rows={2}
                placeholder="How was your workout?"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast}
    </>
  );
}
