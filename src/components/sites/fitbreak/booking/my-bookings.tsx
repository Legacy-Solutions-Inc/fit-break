"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  cancelBookingAction,
  rescheduleBookingAction,
} from "@/app/(fitbreak)/(site)/member/bookings/actions";
import {
  CANCEL_CUTOFF_HOURS,
  MAX_CLASS_CAPACITY,
  TIME_SLOTS,
  addDays,
  classStart,
  formatDateKey,
  formatTime,
  toDateKey,
  weekdayOf,
} from "@/services/fitbreak/catalog";

import { CheckInQr } from "./check-in-qr";
import { useSourceToast } from "./use-toast";

// "My Bookings" list from bookings.js (createBookingCard, cancelBooking,
// reschedule modal, QR modal). confirm() prompts are replaced by in-page
// dialogs; Firestore writes by Server Actions.

export interface BookingView {
  id: string;
  programId: string;
  programName: string;
  date: string;
  time: string;
  status: "confirmed" | "cancelled" | "attended";
}

const HOUR = 3_600_000;

function CloseIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/** Closes on Escape and on a backdrop click. */
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

function weekdayLong(date: string): string {
  return formatDateKey(date, { weekday: "long" });
}

function QrModal({
  booking,
  onClose,
  onDownloaded,
}: {
  booking: BookingView;
  onClose: () => void;
  onDownloaded: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `fitbreak-booking-${booking.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
    onDownloaded();
  }
  return (
    <Overlay onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-qr-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
        <div className="text-center">
          <h3 id="fb-qr-title" className="mb-2 text-2xl font-bold text-gray-900">
            Check-In QR Code
          </h3>
          <p className="mb-6 text-gray-600">
            {booking.programName} - {weekdayLong(booking.date)} {formatTime(booking.time)}
          </p>
          <div className="mb-6 inline-block rounded-lg border-4 border-pink-500 bg-white p-6">
            <CheckInQr ref={canvasRef} bookingId={booking.id} size={256} />
          </div>
          <p className="mb-6 text-sm text-gray-600">Show this code to staff when you arrive</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300"
            >
              Close
            </button>
            <button
              type="button"
              onClick={download}
              className="flex-1 rounded-lg bg-pink-600 px-4 py-3 font-medium text-white transition-colors hover:bg-pink-700 active:bg-pink-800"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function CancelDialog({
  pending,
  onConfirm,
  onClose,
}: {
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fb-cancel-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="fb-cancel-title" className="mb-2 text-xl font-bold text-gray-900">
          Cancel Booking
        </h2>
        <p className="text-gray-600">
          Are you sure you want to cancel this booking? Your credit will be refunded.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-full bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            autoFocus
            className="flex-1 rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            {pending ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function RescheduleModal({
  booking,
  counts,
  nowMs,
  pending,
  onConfirm,
  onClose,
}: {
  booking: BookingView;
  counts: Record<string, number>;
  nowMs: number;
  pending: boolean;
  onConfirm: (date: string, time: string) => void;
  onClose: () => void;
}) {
  const [target, setTarget] = useState<{ date: string; time: string } | null>(null);
  const today = toDateKey(new Date(nowMs));
  const dates: string[] = [];
  for (let i = 0; i < 21; i++) {
    const date = addDays(today, i);
    if (weekdayOf(date) !== 0) dates.push(date);
  }
  const shortDate = (date: string) =>
    formatDateKey(date, { weekday: "short", month: "short", day: "numeric" });

  return (
    <Overlay onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-reschedule-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-brand-50 to-brand-100 p-6">
          <div>
            <h2 id="fb-reschedule-title" className="text-xl font-bold text-gray-900">
              Reschedule Class
            </h2>
            <p className="text-sm text-gray-600">
              {booking.programName} - {booking.date} at {formatTime(booking.time)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 transition hover:bg-gray-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {target && (
          <div className="border-b border-gray-200 bg-brand-50 px-6 py-4">
            <p className="text-sm text-gray-800">
              Reschedule to <strong>{booking.programName}</strong> on{" "}
              <strong>{shortDate(target.date)}</strong> at{" "}
              <strong>{formatTime(target.time)}</strong>?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTarget(null)}
                disabled={pending}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => onConfirm(target.date, target.time)}
                disabled={pending}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {pending ? "Rescheduling..." : "Confirm"}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {dates.map((date) => (
              <div key={date} className="overflow-hidden rounded-xl border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                  <p className="font-semibold text-gray-900">{shortDate(date)}</p>
                  <p className="text-sm text-gray-600">{booking.programName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  {TIME_SLOTS.map((time) => {
                    const count = counts[`${date}|${time}|${booking.programId}`] ?? 0;
                    const isCurrent = booking.date === date && booking.time === time;
                    const isPast = nowMs > classStart(date, time).getTime();
                    if (isCurrent) {
                      return (
                        <div
                          key={time}
                          className="rounded-lg border-2 border-brand-500 bg-brand-100 p-3 text-center"
                        >
                          <p className="font-semibold text-brand-700">{formatTime(time)}</p>
                          <p className="text-xs text-brand-600">Current</p>
                        </div>
                      );
                    }
                    if (isPast) {
                      return (
                        <div
                          key={time}
                          className="rounded-lg bg-gray-100 p-3 text-center opacity-50"
                        >
                          <p className="font-semibold text-gray-400">{formatTime(time)}</p>
                          <p className="text-xs text-gray-400">Passed</p>
                        </div>
                      );
                    }
                    if (count >= MAX_CLASS_CAPACITY) {
                      return (
                        <div key={time} className="rounded-lg bg-red-50 p-3 text-center">
                          <p className="font-semibold text-red-600">{formatTime(time)}</p>
                          <p className="text-xs text-red-500">Full</p>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setTarget({ date, time })}
                        className="rounded-lg border border-gray-200 bg-white p-3 text-center transition hover:border-brand-500 hover:bg-brand-50"
                      >
                        <p className="font-semibold text-gray-900">{formatTime(time)}</p>
                        <p className="text-xs text-brand-600">{count} registered</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function BookingCard({
  booking,
  nowMs,
  onQr,
  onCancel,
  onReschedule,
}: {
  booking: BookingView;
  nowMs: number;
  onQr: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const start = classStart(booking.date, booking.time).getTime();
  const todayKey = toDateKey(new Date(nowMs));
  const isPast = start < nowMs;
  const isToday = booking.date === todayKey;
  const isCancelled = booking.status === "cancelled";
  const checkedIn = booking.status === "attended";
  // QR visible from 24 h before until 4 h after class start (and all day on class day).
  const canShowQR = isToday || (nowMs >= start - 24 * HOUR && nowMs < start + 4 * HOUR);
  const hoursUntil = (start - nowMs) / HOUR;
  const canCancel = hoursUntil >= CANCEL_CUTOFF_HOURS;

  const badge = isCancelled
    ? { text: "Cancelled", cls: "bg-red-100 text-red-700" }
    : isPast
      ? { text: "Completed", cls: "bg-gray-100 text-gray-600" }
      : isToday
        ? { text: "Today", cls: "bg-green-100 text-green-700" }
        : { text: "Upcoming", cls: "bg-blue-100 text-blue-700" };

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-xs ${isPast || isCancelled ? "opacity-60" : ""}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{booking.programName}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {weekdayLong(booking.date)}, {formatDateKey(booking.date, {})} at{" "}
            {formatTime(booking.time)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {!isCancelled && canShowQR && !checkedIn && (
        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Check-In QR Code</h4>
            <button
              type="button"
              onClick={onQr}
              className="text-sm font-medium text-pink-600 hover:text-pink-700"
            >
              View Full Size
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-[4px] bg-white p-2">
              <CheckInQr bookingId={booking.id} size={100} />
            </div>
            <div className="flex-1 text-sm text-gray-600">
              <p>Show this QR code when you arrive at the studio for quick check-in.</p>
            </div>
          </div>
        </div>
      )}

      {!isCancelled && !isPast && !checkedIn && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReschedule}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Reschedule
            </button>
            {canCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Cancel Booking
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Cancellation not available within 2 hours of class"
                className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400"
              >
                Cancel Booking
              </button>
            )}
          </div>
          {!canCancel && (
            <p className="mt-1 text-xs text-gray-500">
              ⚠️ Cancellation not available within 2 hours of class (
              {Math.max(0, Math.floor(hoursUntil * 60))} min remaining)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function MyBookings({
  bookings,
  counts,
  nowMs,
}: {
  bookings: BookingView[];
  counts: Record<string, number>;
  nowMs: number;
}) {
  const { show, node: toastNode } = useSourceToast("pill");
  const [pending, startTransition] = useTransition();
  const [qrFor, setQrFor] = useState<BookingView | null>(null);
  const [cancelFor, setCancelFor] = useState<BookingView | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<BookingView | null>(null);

  function confirmCancel() {
    if (!cancelFor) return;
    const id = cancelFor.id;
    startTransition(async () => {
      const result = await cancelBookingAction(id);
      setCancelFor(null);
      show(result.ok ? "Booking cancelled. Your credit has been refunded." : result.error);
    });
  }

  function confirmReschedule(date: string, time: string) {
    if (!rescheduleFor) return;
    const id = rescheduleFor.id;
    startTransition(async () => {
      const result = await rescheduleBookingAction({ bookingId: id, date, time });
      if (result.ok) {
        setRescheduleFor(null);
        show("Class rescheduled successfully!");
      } else {
        show(result.error);
      }
    });
  }

  return (
    <>
      {bookings.length === 0 ? (
        <div id="my-bookings-list" className="py-8 text-center text-gray-500">
          No bookings yet. Book your first class!
        </div>
      ) : (
        <div id="my-bookings-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              nowMs={nowMs}
              onQr={() => setQrFor(booking)}
              onCancel={() => setCancelFor(booking)}
              onReschedule={() => setRescheduleFor(booking)}
            />
          ))}
        </div>
      )}

      {qrFor && (
        <QrModal
          booking={qrFor}
          onClose={() => setQrFor(null)}
          onDownloaded={() => show("QR code downloaded")}
        />
      )}
      {cancelFor && (
        <CancelDialog
          pending={pending}
          onConfirm={confirmCancel}
          onClose={() => !pending && setCancelFor(null)}
        />
      )}
      {rescheduleFor && (
        <RescheduleModal
          booking={rescheduleFor}
          counts={counts}
          nowMs={nowMs}
          pending={pending}
          onConfirm={confirmReschedule}
          onClose={() => !pending && setRescheduleFor(null)}
        />
      )}
      {toastNode}
    </>
  );
}
