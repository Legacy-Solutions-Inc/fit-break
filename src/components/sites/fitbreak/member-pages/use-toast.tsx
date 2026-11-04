"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * The member pages' dark pill toast (`#toast` in profile/settings/
 * workout-tracker.html): bottom-centre, gray-900, hidden after 3s.
 */
export function useToast(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const toast = (
    <div
      role="status"
      aria-live="polite"
      className={
        message
          ? "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg"
          : "sr-only"
      }
    >
      {message}
    </div>
  );

  return [toast, show] as const;
}

const noopSubscribe = () => () => {};

/**
 * False during SSR and hydration, true afterwards. Lets time/timezone-dependent
 * figures render in the member's own timezone without a hydration mismatch —
 * the source pages likewise show 0 until their script has loaded the data.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
