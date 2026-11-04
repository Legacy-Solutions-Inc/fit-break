"use client";

import { useActionState, useEffect, useState } from "react";

import { saveProfile, type ProfileState } from "@/app/(fitbreak)/(site)/member/profile/actions";
import { cn } from "@/lib/utils";

import { useToast } from "./use-toast";

export interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  heightCm: number | null;
  weightKg: number | null;
  birthday: string;
  gender: string;
  avatarUrl: string;
}

const input =
  "w-full rounded-xl border border-gray-200 px-4 py-3 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-400 focus:outline-hidden";
const label = "mb-2 block text-sm font-semibold text-gray-700";

function toFeetInches(cm: number | null): { feet: string; inches: string } {
  if (!cm) return { feet: "", inches: "" };
  const totalInches = cm / 2.54;
  return {
    feet: String(Math.floor(totalInches / 12)),
    inches: String(Math.round(totalInches % 12)),
  };
}

const initial: ProfileState = { ok: false };

/** Avatar + "Profile Form" card body (profile.html / profile.js). */
export function ProfileForm({ values }: { values: ProfileFormValues }) {
  const [state, action, pending] = useActionState(saveProfile, initial);
  const [toast, showToast] = useToast();
  const [unit, setUnit] = useState<"ft" | "cm">("ft");
  const start = toFeetInches(values.heightCm);
  const [feet, setFeet] = useState(start.feet);
  const [inches, setInches] = useState(start.inches);
  const [cm, setCm] = useState(values.heightCm ? String(values.heightCm) : "");

  useEffect(() => {
    if (state.ok && state.savedAt) showToast("Profile updated successfully!");
    else if (state.error) showToast(state.error);
    // React to each action result only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function switchUnit(next: "ft" | "cm") {
    if (next === unit) return;
    if (next === "cm") {
      const f = Number.parseInt(feet, 10) || 0;
      const i = Number.parseInt(inches, 10) || 0;
      if (f > 0 || i > 0) setCm(String(Math.round((f * 12 + i) * 2.54)));
    } else {
      const c = Number.parseFloat(cm) || 0;
      if (c > 0) {
        const fi = toFeetInches(c);
        setFeet(fi.feet);
        setInches(fi.inches);
      }
    }
    setUnit(next);
  }

  const unitBtn = (active: boolean) =>
    cn(
      "rounded-md px-2 py-1",
      active ? "bg-white font-medium text-gray-900 shadow-xs" : "text-gray-500",
    );

  return (
    <>
      <div className="-mt-16 mb-6 flex items-end">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote generated avatar, as on the source */}
          <img
            src={values.avatarUrl}
            alt="Profile"
            className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 shadow-lg"
          />
          {/* The source renders this picker but never handles the file (profile.js has no upload). */}
          <label className="absolute right-2 bottom-2 cursor-pointer rounded-full bg-brand-500 p-2 text-white shadow-lg hover:bg-brand-600">
            <span className="sr-only">Change profile photo</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="heightUnit" value={unit} />
        <div>
          <label htmlFor="display-name" className={label}>
            Full Name
          </label>
          <input
            id="display-name"
            name="fullName"
            type="text"
            defaultValue={values.fullName}
            placeholder="Your Name"
            className={input}
          />
        </div>

        <div>
          <label htmlFor="email" className={label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            readOnly
            defaultValue={values.email}
            placeholder="email@example.com"
            aria-describedby="email-help"
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 placeholder:text-gray-400"
          />
          <p id="email-help" className="mt-1 text-xs text-gray-500">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="phone" className={label}>
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={values.phone}
            placeholder="+63 XXX XXX XXXX"
            className={input}
          />
        </div>

        <div>
          <label htmlFor="emergency-contact" className={label}>
            Emergency Contact
          </label>
          <input
            id="emergency-contact"
            name="emergencyContact"
            type="tel"
            defaultValue={values.emergencyContact}
            placeholder="Emergency contact number"
            className={input}
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Body Measurements</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span id="height-label" className="block text-sm font-semibold text-gray-700">
                  Height
                </span>
                <div
                  className="flex rounded-lg bg-gray-100 p-0.5 text-xs"
                  role="group"
                  aria-label="Height unit"
                >
                  <button
                    type="button"
                    aria-pressed={unit === "ft"}
                    onClick={() => switchUnit("ft")}
                    className={unitBtn(unit === "ft")}
                  >
                    ft/in
                  </button>
                  <button
                    type="button"
                    aria-pressed={unit === "cm"}
                    onClick={() => switchUnit("cm")}
                    className={unitBtn(unit === "cm")}
                  >
                    cm
                  </button>
                </div>
              </div>
              <div className={cn("flex gap-2", unit !== "ft" && "hidden")}>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      name="heightFeet"
                      type="number"
                      min={3}
                      max={7}
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      placeholder="5"
                      aria-label="Height in feet"
                      className={cn(input, "pr-10")}
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
                      ft
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      name="heightInches"
                      type="number"
                      min={0}
                      max={11}
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      placeholder="4"
                      aria-label="Height in inches"
                      className={cn(input, "pr-10")}
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
                      in
                    </span>
                  </div>
                </div>
              </div>
              <div className={cn(unit !== "cm" && "hidden")}>
                <input
                  name="heightCm"
                  type="number"
                  step="0.1"
                  value={cm}
                  onChange={(e) => setCm(e.target.value)}
                  placeholder="e.g., 165"
                  aria-label="Height in centimetres"
                  className={input}
                />
              </div>
            </div>
            <div>
              <label htmlFor="weight" className={label}>
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                defaultValue={values.weightKg ?? ""}
                placeholder="e.g., 60"
                className={input}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="birthday" className={label}>
                Date of Birth
              </label>
              {/* `sm:px-4` / `sm:text-base` are absent from the source's compiled CSS, so it stays px-1 text-xs. */}
              <input
                id="birthday"
                name="birthday"
                type="date"
                defaultValue={values.birthday}
                className="w-full rounded-xl border border-gray-200 px-1 py-3 text-xs focus:ring-2 focus:ring-brand-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="gender" className={label}>
                Gender
              </label>
              <select id="gender" name="gender" defaultValue={values.gender} className={input}>
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Used to calculate BMI and personalize your fitness recommendations
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
      {toast}
    </>
  );
}
