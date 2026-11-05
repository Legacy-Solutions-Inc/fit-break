import { AnalyticsEvents } from "@/components/sites/fitbreak/analytics/analytics-events";
import { ConsentBar } from "@/components/sites/fitbreak/analytics/consent-bar";
import { GoogleAnalyticsScript } from "@/components/sites/fitbreak/analytics/google-analytics-script";
import { Chatbot } from "@/components/sites/fitbreak/chatbot";
import { SiteFooter } from "@/components/sites/fitbreak/site-footer";
import { SiteHeader } from "@/components/sites/fitbreak/site-header";
import { googleAnalyticsMeasurementId, memberAreaEnabled } from "@/config";
import { getMember } from "@/lib/fitbreak/member";

/**
 * Standard FitBreak page chrome: sticky header, footer, assistant bubble.
 * `.fb-ed` applies the editorial system (ADR 0009) to the public site.
 * Google Analytics 4 (ADR 0010) mounts only when a measurement ID is set: its
 * bootstrap first, then the consent bar and the event listener at the end.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Parked Member Area ⇒ the header never shows account UI.
  const member = memberAreaEnabled ? await getMember() : null;

  return (
    <div className="fb-ed">
      {googleAnalyticsMeasurementId && (
        <GoogleAnalyticsScript measurementId={googleAnalyticsMeasurementId} />
      )}
      <SiteHeader user={member} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      {googleAnalyticsMeasurementId && (
        <>
          <ConsentBar />
          <AnalyticsEvents />
        </>
      )}
      <Chatbot />
    </div>
  );
}
