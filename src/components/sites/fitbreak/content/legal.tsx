import type { ReactNode } from "react";

import { contact } from "../links";

// Shared typography for /privacy-policy and /terms-of-service — the two source
// pages use identical markup classes. (`prose prose-gray` is in the source but
// absent from its compiled CSS, so it is dropped.)

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xs md:p-12">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: {updated}</p>
        <div className="max-w-none">{children}</div>
      </div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-4 text-2xl font-bold text-gray-900">{children}</h2>;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 mb-3 text-xl font-semibold text-gray-900">{children}</h3>;
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className ?? "mb-4 text-gray-700"}>{children}</p>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function ContactBlock() {
  return (
    <div className="mb-6 rounded-lg bg-gray-50 p-6">
      <p className="text-gray-700">
        <strong>FitBreak</strong>
      </p>
      <p className="text-gray-700">2nd Floor Roxas Drive, Brgy Ilaya</p>
      <p className="text-gray-700">Calapan City, Oriental Mindoro</p>
      <p className="text-gray-700">Email: {contact.email}</p>
    </div>
  );
}
