import { cn } from "@/lib/utils";

/**
 * Editorial building blocks for the public FitBreak site (ADR 0009). Visual
 * rules live in globals.css (`.fb-display`, `.fb-label`, `.fb-btn`, `.fb-link`).
 */

/** Thin arrow used by text links and rows. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      className={cn("fb-link-arrow h-3 w-5 flex-none", className)}
    >
      <path d="M0 6h18M13 1l5 5-5 5" />
    </svg>
  );
}

/** Underlined text link with a stepping arrow. External links open in a new tab. */
export function ArrowLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn("fb-link", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <Arrow />
    </a>
  );
}

/**
 * Section opening: a small label over a big condensed heading, left-aligned.
 * `aside` sits in the right-hand columns on wide screens.
 */
export function SectionHead({
  label,
  title,
  as: Tag = "h2",
  aside,
  className,
  tone = "light",
}: {
  label?: React.ReactNode;
  title: React.ReactNode;
  as?: "h1" | "h2";
  aside?: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10", className)}>
      <div className="lg:col-span-7">
        {label && (
          <p className={cn("fb-label mb-4", tone === "dark" ? "text-paper/70" : "text-mute")}>
            {label}
          </p>
        )}
        <Tag className="fb-display text-[clamp(2.75rem,7vw,5.75rem)]">{title}</Tag>
      </div>
      {aside && (
        <div
          className={cn(
            "max-w-xl text-lg leading-relaxed lg:col-span-5 lg:pb-2",
            tone === "dark" ? "text-paper/80" : "text-mute",
          )}
        >
          {aside}
        </div>
      )}
    </div>
  );
}

/** Page container: wide, with generous gutters. */
export const wrap = "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12";
