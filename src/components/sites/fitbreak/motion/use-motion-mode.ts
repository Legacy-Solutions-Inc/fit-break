"use client";

import { useSyncExternalStore } from "react";

import { MOTION_QUERIES, getMotionMode, type MotionMode } from "./policy";

function subscribe(onChange: () => void) {
  const lists = Object.values(MOTION_QUERIES).map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

/** The current motion mode, or `null` during SSR/hydration (decide nothing yet). */
export function useMotionMode(): MotionMode | null {
  return useSyncExternalStore(subscribe, getMotionMode, () => null);
}
