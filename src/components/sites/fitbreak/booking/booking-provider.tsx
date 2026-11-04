"use client";

import { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { bookClassAction } from "@/app/(fitbreak)/(site)/schedule/actions";
import {
  CLASS_MINUTES,
  COACH_NAME,
  addMinutesToTime,
  formatDateKey,
  formatTime,
  getProgram,
} from "@/services/fitbreak/catalog";

import { routes } from "../links";
import { useSourceToast } from "./use-toast";

// The source's booking confirmation modal (schedule.html #modal-booking +
// schedule.js openProgramBookingModal/confirmProgramBooking), backed by the
// bookClassAction Server Action instead of Firestore + a Cloud Function.

export interface SlotRequest {
  programId: string;
  date: string;
  time: string;
}

interface BookingContextValue {
  open: (slot: SlotRequest) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

export function BookingProvider({
  credits,
  toastVariant = "corner",
  children,
}: {
  credits: number;
  toastVariant?: "pill" | "corner";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [slot, setSlot] = useState<SlotRequest | null>(null);
  const [pending, startTransition] = useTransition();
  const { show, node: toastNode } = useSourceToast(toastVariant);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    if (!pending) setSlot(null);
  };

  useEffect(() => {
    if (!slot) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSlot((s) => (pending ? s : null));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [slot, pending]);

  function confirm() {
    if (!slot || pending) return;
    const request = slot;
    startTransition(async () => {
      const result = await bookClassAction(request);
      if (result.ok) {
        setSlot(null);
        show("Class booked successfully!", "success");
        return;
      }
      show(result.error, "error");
      if (
        result.code === "class-full" ||
        result.code === "already-booked" ||
        result.code === "class-started"
      ) {
        setSlot(null);
        router.refresh();
      } else if (result.code === "credits-expired") {
        setTimeout(() => router.push(routes.pricing), 2000);
      }
    });
  }

  const program = slot ? getProgram(slot.programId) : undefined;

  return (
    <BookingContext.Provider value={{ open: setSlot }}>
      {children}

      {slot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-booking-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 id="fb-booking-title" className="mb-4 text-xl font-bold text-gray-900">
              Confirm Booking
            </h2>

            <div className="space-y-4">
              <div
                className={`bg-linear-to-br ${program?.color ?? "from-brand-500 to-brand-600"} mb-4 rounded-xl p-4 text-white`}
              >
                <h3 className="text-lg font-bold">{program?.name}</h3>
                <p className="text-sm text-white/80">{program?.description}</p>
                <p className="mt-1 text-sm text-white/90">
                  {formatDateKey(slot.date, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">
                    {formatTime(slot.time)} -{" "}
                    {formatTime(addMinutesToTime(slot.time, CLASS_MINUTES))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-semibold">{COACH_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-semibold text-brand-600">1 credit</span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your credits:</span>
                  <span className="font-semibold">{credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">After booking:</span>
                  <span className="font-semibold">{credits - 1}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="flex-1 rounded-full bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={confirm}
                disabled={pending}
                className="flex-1 rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                {pending ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastNode}
    </BookingContext.Provider>
  );
}

/** A slot button that opens the confirmation modal for `slot`. */
export function BookSlotButton({
  slot,
  className,
  children,
}: {
  slot: SlotRequest;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={() => open(slot)} className={className}>
      {children}
    </button>
  );
}
