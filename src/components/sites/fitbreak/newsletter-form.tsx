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
      <form ref={formRef} action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
          className="min-h-12 flex-1 border-0 border-b-2 border-ink bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute focus:border-crimson focus:outline-none"
        />
        <button type="submit" disabled={pending || justSubscribed} className="fb-btn fb-btn--ink">
          {pending ? "Subscribing…" : justSubscribed ? "Subscribed" : "Subscribe"}
        </button>
      </form>
      {/* Live region stays mounted (screen readers need it present) but takes no
          space until there is a message, matching the source's hidden <p>. */}
      <p role="status" className={state.ok ? "mt-4 text-ink" : "sr-only"}>
        {state.ok ? "Thanks for subscribing." : null}
      </p>
      {state.error && (
        <p role="alert" className="mt-2 font-medium text-crimson-deep">
          {state.error}
        </p>
      )}
    </>
  );
}
