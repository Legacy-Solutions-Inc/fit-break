"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  subscribeToNewsletter,
  type NewsletterSource,
  type NewsletterState,
} from "@/app/(fitbreak)/actions";

const initial: NewsletterState = { ok: false };

export function NewsletterForm({ source }: { source: NewsletterSource }) {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initial);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Mirror the source: clear the field, show "Subscribed!" for 3s, keep the
  // thank-you line visible afterwards.
  useEffect(() => {
    if (!state.ok || !state.submittedAt) return;
    formRef.current?.reset();
    setJustSubscribed(true);
    const t = setTimeout(() => setJustSubscribed(false), 3000);
    return () => clearTimeout(t);
  }, [state.ok, state.submittedAt]);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
      >
        <input type="hidden" name="source" value={source} />
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="flex-1 rounded-xl bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || justSubscribed}
          className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600"
        >
          {pending ? "Subscribing..." : justSubscribed ? "Subscribed!" : "Subscribe"}
        </button>
      </form>
      {/* Live region stays mounted (screen readers need it present) but takes no
          space until there is a message, matching the source's hidden <p>. */}
      <p role="status" className={state.ok ? "mt-4 text-green-400" : "sr-only"}>
        {state.ok ? "Thanks for subscribing!" : null}
      </p>
      {state.error && (
        <p role="alert" className="mt-2 text-red-400">
          {state.error}
        </p>
      )}
    </>
  );
}
