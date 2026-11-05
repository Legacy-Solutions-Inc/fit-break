import { JsonLd } from "@/components/sites/fitbreak/json-ld";
import { STUDIO } from "@/components/sites/fitbreak/studio";
import { config } from "@/config";
import { buildBusiness } from "@/lib/seo/structured-data";

/**
 * Public FitBreak site (cloned from fitbreak.ph). `.fb-site` scopes the
 * Tailwind v3 palette pins in globals.css so the rest of the app is unaffected.
 * Page chrome lives in `(site)/layout.tsx`; `/login` is full-screen without it.
 * Every page carries the one FitBreak business record that other structured
 * data refers to by `@id`.
 */
export default function FitBreakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fb-site min-h-svh">
      <JsonLd data={buildBusiness(STUDIO, config.site.url)} />
      {children}
    </div>
  );
}
