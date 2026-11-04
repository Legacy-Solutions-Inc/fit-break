/**
 * Public FitBreak site (cloned from fitbreak.ph). `.fb-site` scopes the
 * Tailwind v3 palette pins in globals.css so the rest of the app is unaffected.
 * Page chrome lives in `(site)/layout.tsx`; `/login` is full-screen without it.
 */
export default function FitBreakLayout({ children }: { children: React.ReactNode }) {
  return <div className="fb-site min-h-svh">{children}</div>;
}
