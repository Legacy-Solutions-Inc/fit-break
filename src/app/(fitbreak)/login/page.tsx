import type { Metadata } from "next";

import { LoginScreen } from "@/components/sites/fitbreak/auth/login-screen";
import { routes } from "@/components/sites/fitbreak/links";

export const metadata: Metadata = {
  title: { absolute: "Sign In — FitBreak" },
  description: "Sign in to your FitBreak account to book classes and track your fitness journey.",
  alternates: { canonical: "/login" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Same-origin path only — never an absolute or protocol-relative URL. */
function safeRedirect(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return routes.member.dashboard;
  }
  return path;
}

// Full-screen: rendered outside the (site) group, so no header/footer/chatbot.
export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";

  // `key` remounts the panel when /login ↔ /login?mode=signup navigate client-side.
  const initialError =
    params.error === "auth_callback"
      ? "We couldn't complete your sign-in. Please try again."
      : undefined;
  return (
    <LoginScreen
      key={mode}
      mode={mode}
      next={safeRedirect(params.redirect)}
      initialError={initialError}
    />
  );
}
