"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { z } from "zod";

import { isSupabaseConfigured } from "@/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { paths } from "@/paths";

import { FacebookIcon } from "../icons";

export type AuthMode = "signin" | "signup";
type OAuthProvider = "google" | "facebook";
type Pending = "email" | OAuthProvider | null;
type Message = { kind: "error" | "notice"; text: string } | null;

const NOT_CONFIGURED = "Authentication isn't configured — set your Supabase environment variables.";

const copy = {
  signin: {
    title: "Welcome Back",
    subtitle: "Sign in to continue your fitness journey",
    submit: "Sign In",
    question: "Don't have an account?",
    action: "Sign Up",
  },
  signup: {
    title: "Create Account",
    subtitle: "Join the FitBreak community today",
    submit: "Create Account",
    question: "Already have an account?",
    action: "Sign In",
  },
} as const;

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(1, "Please enter your password."),
});

const signUpSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(6, "Password should be at least 6 characters."),
});

// The source's Firebase error copy, mapped onto Supabase auth error codes.
function describeAuthError(error: AuthError): string {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "This email is already registered.";
    case "email_address_invalid":
      return "Invalid email address.";
    case "weak_password":
      return "Password should be at least 6 characters.";
    case "invalid_credentials":
      return "Invalid email or password. If you signed up with Google, please use the Google button.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many failed attempts. Please try again later.";
    default:
      return `Authentication failed. ${error.message}`;
  }
}

// Messenger, Instagram, Facebook… webviews block Google/Facebook sign-in.
function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor;
  return [
    /FBAN|FBAV/i,
    /Instagram/i,
    /Messenger/i,
    /Line/i,
    /KAKAOTALK/i,
    /Twitter/i,
    /Snapchat/i,
    /WeChat|MicroMessenger/i,
  ].some((p) => p.test(ua));
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-brand-500 focus:outline-hidden";
const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

export function AuthPanel({
  initialMode,
  next,
  initialError,
}: {
  initialMode: AuthMode;
  next: string;
  /** Shown on first render, e.g. after a failed OAuth callback. */
  initialError?: string;
}) {
  const router = useRouter();
  const ids = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [pending, setPending] = useState<Pending>(null);
  const [message, setMessage] = useState<Message>(
    initialError ? { kind: "error", text: initialError } : null,
  );
  const [inAppWarning, setInAppWarning] = useState(false);
  const closeInAppWarning = useCallback(() => setInAppWarning(false), []);
  const text = copy[mode];

  function callbackUrl() {
    return `${window.location.origin}${paths.auth.callback}?next=${encodeURIComponent(next)}`;
  }

  async function onOAuth(provider: OAuthProvider) {
    if (isInAppBrowser()) {
      setInAppWarning(true);
      return;
    }
    if (!isSupabaseConfigured) {
      setMessage({ kind: "notice", text: NOT_CONFIGURED });
      return;
    }
    setMessage(null);
    setPending(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl(),
          ...(provider === "google"
            ? { queryParams: { prompt: "select_account" } }
            : { scopes: "email public_profile" }),
        },
      });
      // On success the browser navigates to the provider; keep the pending state.
      if (error) {
        setMessage({
          kind: "error",
          text:
            provider === "google"
              ? "Failed to sign in with Google."
              : `Failed to sign in with Facebook. ${error.message}`,
        });
        setPending(null);
      }
    } catch {
      setMessage({
        kind: "error",
        text: "Couldn't reach the authentication service. Please try again.",
      });
      setPending(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage({ kind: "notice", text: NOT_CONFIGURED });
      return;
    }
    const form = new FormData(event.currentTarget);
    const raw = {
      name: form.get("auth-name")?.toString() || undefined,
      phone: form.get("auth-phone")?.toString() || undefined,
      email: form.get("auth-email")?.toString() ?? "",
      password: form.get("auth-password")?.toString() ?? "",
    };

    const fail = (text: string) => setMessage({ kind: "error", text });

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse(raw);
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input.");
      const { name, phone, email, password } = parsed.data;
      await run(async (supabase) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callbackUrl(),
            data: { full_name: name ?? null, phone: phone ?? null },
          },
        });
        if (error) return fail(describeAuthError(error));
        router.push(paths.auth.signUpConfirm);
      });
    } else {
      const parsed = signInSchema.safeParse(raw);
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input.");
      await run(async (supabase) => {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) return fail(describeAuthError(error));
        router.push(next);
        router.refresh();
      });
    }
  }

  async function run(task: (supabase: ReturnType<typeof createClient>) => Promise<void>) {
    setMessage(null);
    setPending("email");
    try {
      await task(createClient());
    } catch {
      setMessage({
        kind: "error",
        text: "Couldn't reach the authentication service. Please try again.",
      });
    } finally {
      setPending(null);
    }
  }

  function toggleMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setMessage(null);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">{text.title}</h2>
        <p className="text-gray-600">{text.subtitle}</p>
      </div>

      {/* Social Sign In */}
      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => onOAuth("google")}
          disabled={pending !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 shadow-xs transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Google
        </button>

        <button
          type="button"
          onClick={() => onOAuth("facebook")}
          disabled={pending !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-3 font-semibold text-white shadow-xs transition-all hover:bg-[#166FE5]"
        >
          {pending === "facebook" ? (
            <>
              <Spinner className="h-5 w-5 animate-spin" /> Connecting...
            </>
          ) : (
            <>
              <FacebookIcon className="h-5 w-5" />
              Facebook
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-linear-to-br from-brand-50 via-white to-brand-50 px-4 font-medium text-gray-500">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {message && (
          <div
            role={message.kind === "error" ? "alert" : "status"}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              message.kind === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800",
            )}
          >
            {message.text}
          </div>
        )}

        {mode === "signup" && (
          <>
            <div>
              <label htmlFor={`${ids}-name`} className={labelClass}>
                Full Name
              </label>
              <input
                type="text"
                name="auth-name"
                id={`${ids}-name`}
                placeholder="Jane Dela Cruz"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor={`${ids}-phone`} className={labelClass}>
                Phone Number
              </label>
              <input
                type="tel"
                name="auth-phone"
                id={`${ids}-phone`}
                placeholder="09XX XXX XXXX"
                autoComplete="tel"
                aria-describedby={`${ids}-phone-hint`}
                className={inputClass}
              />
              <p id={`${ids}-phone-hint`} className="mt-1 text-xs text-gray-500">
                So we can contact you about bookings
              </p>
            </div>
          </>
        )}

        <div>
          <label htmlFor={`${ids}-email`} className={labelClass}>
            Email Address
          </label>
          <input
            type="email"
            name="auth-email"
            id={`${ids}-email`}
            placeholder="you@email.com"
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${ids}-password`} className={labelClass}>
            Password
          </label>
          <input
            type="password"
            name="auth-password"
            id={`${ids}-password`}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            className={inputClass}
          />
        </div>

        {mode === "signin" && (
          <div className="text-right">
            <Link
              href={paths.auth.resetPassword}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={pending !== null}
          aria-busy={pending === "email"}
          className="w-full rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg"
        >
          {text.submit}
        </button>
      </form>

      {/* Toggle Sign In / Sign Up */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          <span>{text.question}</span>
          <button
            type="button"
            onClick={toggleMode}
            className="ml-1 font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>{text.action}</span>
          </button>
        </p>
      </div>

      {inAppWarning && <InAppBrowserDialog onClose={closeInAppWarning} />}
    </>
  );
}

function InAppBrowserDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [instructions, setInstructions] = useState("Copy the link and open it in your browser");
  const copyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua))
      setInstructions('Tap the ··· menu and select "Open in Safari"');
    else if (/Android/.test(ua)) setInstructions('Tap the ⋮ menu and select "Open in Chrome"');
    copyRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <h3 id={titleId} className="mb-2 text-xl font-bold text-gray-900">
          Open in Browser
        </h3>
        <p className="mb-4 text-gray-600">
          Google sign-in doesn&apos;t work in this app&apos;s browser. Please open FitBreak in
          Safari or Chrome.
        </p>
        <p className="mb-4 text-sm text-gray-500">{instructions}</p>
        <button
          ref={copyRef}
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
            setCopied(true);
          }}
          className="mb-2 w-full rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-gray-600 transition hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
