"use client";

import { useActionState, useEffect, useState } from "react";

import {
  applyAsTrainer,
  type ApplicationState,
} from "@/app/(fitbreak)/(site)/member/trainers/actions";

import { Icon } from "../icons";

const initial: ApplicationState = { ok: false };

const field =
  "w-full rounded-lg border border-gray-300 px-4 py-2 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500";

/** "Want to Join Our Team?" CTA + the application modal (trainers.html). */
export function TrainerApplication() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="mt-12 rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-8 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">Want to Join Our Team?</h2>
        <p className="mx-auto mb-6 max-w-xl text-brand-100">
          We&apos;re always looking for passionate fitness professionals to join the FitBreak
          family.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Apply Now
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
            className="my-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-brand-50 to-brand-100 p-6">
              <div>
                <h2 id="application-title" className="text-xl font-bold text-gray-900">
                  Join Our Team
                </h2>
                <p className="text-sm text-gray-600">Apply to become a FitBreak trainer</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition hover:bg-gray-200"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <ApplicationForm
              key={formKey}
              onClose={() => {
                setOpen(false);
                setFormKey((k) => k + 1);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function ApplicationForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(applyAsTrainer, initial);

  if (state.ok) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icon name="check" className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Application Submitted!</h3>
          <p className="mb-4 text-gray-600">
            Thank you for your interest in joining FitBreak. We&apos;ll review your application and
            get back to you soon.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-500 px-6 py-2 text-white transition hover:bg-brand-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex-1 space-y-4 overflow-y-auto p-6">
      <div>
        <label htmlFor="ta-name" className="mb-1 block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <input id="ta-name" type="text" name="fullName" required className={field} />
      </div>
      <div>
        <label htmlFor="ta-email" className="mb-1 block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input id="ta-email" type="email" name="email" required className={field} />
      </div>
      <div>
        <label htmlFor="ta-phone" className="mb-1 block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <input id="ta-phone" type="tel" name="phone" required className={field} />
      </div>
      <div>
        <label htmlFor="ta-certs" className="mb-1 block text-sm font-medium text-gray-700">
          Certifications
        </label>
        <input
          id="ta-certs"
          type="text"
          name="certifications"
          placeholder="e.g., ACE, NASM, CPT"
          className={field}
        />
      </div>
      <div>
        <label htmlFor="ta-exp" className="mb-1 block text-sm font-medium text-gray-700">
          Years of Experience *
        </label>
        <select id="ta-exp" name="experience" required defaultValue="" className={field}>
          <option value="">Select...</option>
          <option value="0-1">Less than 1 year</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5+">5+ years</option>
        </select>
      </div>
      <div>
        <label htmlFor="ta-message" className="mb-1 block text-sm font-medium text-gray-700">
          Why do you want to join FitBreak? *
        </label>
        <textarea
          id="ta-message"
          name="message"
          rows={3}
          required
          placeholder="Tell us about yourself and why you'd be a great fit..."
          className={field}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600"
      >
        {pending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
