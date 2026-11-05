"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The source pages' own toasts (no alert()):
//  • "pill"   — the `#toast` element on dashboard/bookings/payments: a dark pill,
//               bottom-centre, 3 s.
//  • "corner" — schedule.js showToast(): bottom-right, green/red/blue, 3 s.

export type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export function useSourceToast(variant: "pill" | "corner" = "pill") {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const show = useCallback((message: string, type: ToastType = "info") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const node = toast ? (
    <div
      key={toast.id}
      role={toast.type === "error" ? "alert" : "status"}
      className={
        variant === "pill"
          ? "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg"
          : `fixed right-4 bottom-4 z-50 rounded-lg px-6 py-3 text-white shadow-lg ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
            }`
      }
    >
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}
