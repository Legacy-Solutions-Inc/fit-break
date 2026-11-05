"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  saveGoalsAction,
  saveNotificationSettings,
} from "@/app/(fitbreak)/(site)/member/settings/actions";
import { isSupabaseConfigured } from "@/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Icon } from "../icons";
import { routes } from "../links";
import { useIsClient, useToast } from "./use-toast";

export interface NotificationValues {
  emailNotifications: boolean;
  classReminders: boolean;
  marketingEmails: boolean;
}

export interface GoalValues {
  weeklyClassesGoal: number;
  calorieGoal: number;
  stepsGoal: number;
  waterGoal: number;
}

const card = "mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs";
const input =
  "w-full rounded-xl border border-gray-200 px-4 py-3 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-400 focus:outline-hidden";
const SYNC =
  "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15";

function Toggle({
  id,
  checked,
  onChange,
  labelledBy,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-labelledby={labelledBy}
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-brand-500 peer-focus:ring-4 peer-focus:ring-brand-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  );
}

const toggles = [
  {
    key: "emailNotifications",
    id: "email-notifications",
    title: "Email Notifications",
    text: "Receive booking confirmations and class reminders",
  },
  {
    key: "classReminders",
    id: "class-reminders",
    title: "Class Reminders",
    text: "Get notified 1 hour before your class",
  },
  {
    key: "marketingEmails",
    id: "marketing-emails",
    title: "Promotional Emails",
    text: "Receive updates about new classes and special offers",
  },
] as const;

export function SettingsPanels({
  email,
  lastSignInAt,
  notifications,
  goals,
}: {
  email: string;
  lastSignInAt: string | null;
  notifications: NotificationValues;
  goals: GoalValues;
}) {
  const [toast, showToast] = useToast();
  const isClient = useIsClient();
  const [prefs, setPrefs] = useState(notifications);
  const [, startSaving] = useTransition();
  const [goalsPending, startGoals] = useTransition();
  const [syncing, setSyncing] = useState(false);

  function toggle(key: keyof NotificationValues, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    startSaving(async () => {
      const res = await saveNotificationSettings(next);
      showToast(res.message);
    });
  }

  function onSaveGoals(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startGoals(async () => {
      const res = await saveGoalsAction(data);
      showToast(res.message);
    });
  }

  function syncAll() {
    // No wearable is connected in this clone, so this resolves like the
    // source's "no wearables document" branch.
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast("No devices connected");
    }, 400);
  }

  return (
    <>
      <div className={card}>
        <h2 className="mb-6 text-xl font-bold text-gray-900">Account Settings</h2>
        {toggles.map((t) => (
          <div key={t.key} className="mb-6">
            <div className="flex items-center justify-between">
              <div id={`${t.id}-label`}>
                <h3 className="font-semibold text-gray-900">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.text}</p>
              </div>
              <Toggle
                id={t.id}
                labelledBy={`${t.id}-label`}
                checked={prefs[t.key]}
                onChange={(v) => toggle(t.key, v)}
              />
            </div>
          </div>
        ))}
      </div>

      <form className={card} onSubmit={onSaveGoals}>
        <h2 className="mb-6 text-xl font-bold text-gray-900">Fitness Goals</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="weekly-goal" className="mb-2 block text-sm font-semibold text-gray-700">
              Weekly Classes Goal
            </label>
            <select
              id="weekly-goal"
              name="weeklyClassesGoal"
              defaultValue={String(goals.weeklyClassesGoal)}
              className={input}
            >
              <option value="2">2 classes/week</option>
              <option value="3">3 classes/week</option>
              <option value="4">4 classes/week</option>
              <option value="5">5 classes/week</option>
              <option value="7">Every day</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="calorie-goal"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Daily Calorie Goal
            </label>
            <input
              id="calorie-goal"
              name="calorieGoal"
              type="number"
              defaultValue={goals.calorieGoal}
              placeholder="2000"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="steps-goal" className="mb-2 block text-sm font-semibold text-gray-700">
              Daily Steps Goal
            </label>
            <input
              id="steps-goal"
              name="stepsGoal"
              type="number"
              defaultValue={goals.stepsGoal}
              placeholder="10000"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="water-goal" className="mb-2 block text-sm font-semibold text-gray-700">
              Daily Water Goal (ml)
            </label>
            <input
              id="water-goal"
              name="waterGoal"
              type="number"
              defaultValue={goals.waterGoal}
              placeholder="2000"
              className={input}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={goalsPending}
          className="mt-6 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600"
        >
          Save Goals
        </button>
      </form>

      <div className={card}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Connected Devices</h2>
            <p className="text-sm text-gray-500">Sync your fitness data from wearables</p>
          </div>
          <button
            type="button"
            onClick={syncAll}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-200"
          >
            <svg
              className={cn("h-4 w-4", syncing && "animate-spin")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={SYNC} />
            </svg>
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>

        <p className="mb-4 text-xs text-gray-400">Last synced: Never</p>

        <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-600">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="4" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="20" r="2" />
                <circle cx="4" cy="8" r="2" />
                <circle cx="20" cy="8" r="2" />
                <circle cx="4" cy="16" r="2" />
                <circle cx="20" cy="16" r="2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fitbit</h3>
              <p className="text-sm text-gray-500">Not connected</p>
            </div>
          </div>
          <button
            type="button"
            // The source reads its Fitbit OAuth client id from Firestore config; none is set.
            onClick={() => showToast("Fitbit not configured. Contact admin.")}
            className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white transition-all hover:bg-brand-600"
          >
            Connect
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          {/* `from-gray-400 to-gray-600` are absent from the source's compiled CSS, so this tile has no fill there either. */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Icon name="clock" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Other Devices</h4>
            <p className="text-xs text-gray-500">
              Using Xiaomi, Amazfit, Apple Watch, or Garmin? You can manually log your data in your{" "}
              <a href={routes.member.profile} className="text-brand-500 hover:underline">
                Profile
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-800">What gets synced?</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            {[
              "Steps & Distance",
              "Heart Rate",
              "Weight & Body Metrics",
              "Calories Burned",
              "Sleep",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={card}>
        <h2 className="mb-6 text-xl font-bold text-gray-900">Security</h2>
        <PasswordChange />
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm text-gray-600">
            Signed in as: <span className="font-semibold">{email}</span>
          </p>
          <p className="text-xs text-gray-500">
            Last login:{" "}
            <span>
              {isClient && lastSignInAt ? new Date(lastSignInAt).toLocaleString() : "Just now"}
            </span>
          </p>
        </div>
      </div>

      <DangerZone />
      {toast}
    </>
  );
}

/** Change password via Supabase (replaces the source's Firebase reset-email flow). */
function PasswordChange() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password.length < 8) {
      setOutcome({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setOutcome({ ok: false, text: "Passwords do not match." });
      return;
    }
    setPending(true);
    setOutcome(null);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setOutcome({ ok: false, text: error.message });
        return;
      }
      form.reset();
      setOutcome({ ok: true, text: "Password updated." });
    } catch {
      setOutcome({
        ok: false,
        text: "Couldn't reach the authentication service. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="change-password-panel"
        onClick={() => {
          setOpen((o) => !o);
          setOutcome(null);
        }}
        className="w-full rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-gray-200"
      >
        Change Password
      </button>
      {open && (
        <div id="change-password-panel" className="mt-4">
          {!isSupabaseConfigured ? (
            <p role="status" className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Password changes aren&apos;t available here yet: sign-in isn&apos;t configured for
              this environment.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={input}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={input}
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600"
              >
                {pending ? "Updating..." : "Update Password"}
              </button>
              {outcome && (
                <p
                  role={outcome.ok ? "status" : "alert"}
                  className={cn("text-sm", outcome.ok ? "text-green-600" : "text-red-600")}
                >
                  {outcome.text}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Danger Zone: the source's two confirm() prompts become an inline two-step
 * confirmation. Nothing is ever deleted here — the outcome asks the member to
 * contact the studio.
 */
function DangerZone() {
  const [stage, setStage] = useState<"idle" | "confirm" | "final" | "contact">("idle");

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="mb-4 text-xl font-bold text-red-900">Danger Zone</h2>
      <p className="mb-4 text-sm text-red-700">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      {stage === "idle" && (
        <button
          type="button"
          onClick={() => setStage("confirm")}
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700"
        >
          Delete My Account
        </button>
      )}

      {(stage === "confirm" || stage === "final") && (
        <div
          role="alertdialog"
          aria-labelledby="delete-confirm-text"
          className="rounded-xl border border-red-200 bg-white p-4"
        >
          <p id="delete-confirm-text" className="mb-4 text-sm font-medium text-red-900">
            {stage === "confirm"
              ? "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
              : "Really delete? This is your last chance!"}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStage(stage === "confirm" ? "final" : "contact")}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700"
            >
              {stage === "confirm" ? "Yes, delete my account" : "Delete permanently"}
            </button>
            <button
              type="button"
              onClick={() => setStage("idle")}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {stage === "contact" && (
        <div
          role="status"
          className="rounded-xl border border-red-200 bg-white p-4 text-sm text-gray-700"
        >
          <p className="mb-2 font-semibold text-red-900">We&apos;ll take it from here.</p>
          <p>
            Account deletion is handled by our team so your bookings and credits can be settled
            first. Please contact us at{" "}
            <a
              href="mailto:support@fitbreak.ph"
              className="font-medium text-brand-500 hover:underline"
            >
              support@fitbreak.ph
            </a>{" "}
            and we&apos;ll process your request. Your account has not been changed.
          </p>
          <button
            type="button"
            onClick={() => setStage("idle")}
            className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
