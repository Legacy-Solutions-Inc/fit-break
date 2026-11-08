import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { wrap } from "../editorial";
import { contact } from "../links";

// Shared long-form typography for /privacy-policy and /terms-of-service
// (ADR 0009): condensed headings, a ~65ch text column, hairline section rules.

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className={`${wrap} pt-16 pb-20 lg:pt-24 lg:pb-32`}>
      <h1 className="fb-display text-[clamp(2.5rem,5.7vw,5rem)]">{title}</h1>

      <div className="mt-12 grid gap-8 border-t border-ink/20 pt-8 lg:mt-16 lg:grid-cols-12 lg:gap-10 lg:pt-10">
        <div className="lg:col-span-3">
          <p className="fb-label fb-num text-mute lg:sticky lg:top-28">Last updated: {updated}</p>
        </div>
        <div className="max-w-[65ch] text-[1.0625rem] leading-[1.75] text-ink-soft lg:col-span-8 lg:col-start-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Section heading. A leading "1." (Terms) is set apart as a quiet number. */
export function H2({ children }: { children: ReactNode }) {
  const numbered = typeof children === "string" ? /^(\d+\.)\s+(.*)$/.exec(children) : null;
  return (
    <h2 className="fb-display mt-14 mb-5 border-t border-ink/15 pt-6 text-[clamp(1.875rem,3.4vw,2.75rem)] text-ink first:mt-0">
      {numbered ? (
        <>
          <span className="fb-num text-mute">{numbered[1]}</span> {numbered[2]}
        </>
      ) : (
        children
      )}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="fb-display mt-9 mb-3 text-2xl text-ink">{children}</h3>;
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mb-5", className)}>{children}</p>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-6 list-[square] space-y-2 pl-5 marker:text-crimson">
      {items.map((item, i) => (
        <li key={i} className="pl-1.5 [&_strong]:font-semibold [&_strong]:text-ink">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ContactBlock() {
  return (
    <div className="mb-8 border-l-2 border-ink pl-5 text-ink">
      <p>
        <strong>FitBreak</strong>
      </p>
      <p>2nd Floor Roxas Drive, Brgy Ilaya</p>
      <p>Calapan City, Oriental Mindoro</p>
      <p>Email: {contact.email}</p>
    </div>
  );
}
