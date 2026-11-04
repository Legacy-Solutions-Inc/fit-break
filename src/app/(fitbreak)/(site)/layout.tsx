import { Chatbot } from "@/components/sites/fitbreak/chatbot";
import { SiteFooter } from "@/components/sites/fitbreak/site-footer";
import { SiteHeader } from "@/components/sites/fitbreak/site-header";
import { memberAreaEnabled } from "@/config";
import { getMember } from "@/lib/fitbreak/member";

/**
 * Standard FitBreak page chrome: sticky header, footer, assistant bubble.
 * `.fb-ed` applies the editorial system (ADR 0009) to the public site.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Parked Member Area ⇒ the header never shows account UI.
  const member = memberAreaEnabled ? await getMember() : null;

  return (
    <div className="fb-ed">
      <SiteHeader user={member} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <Chatbot />
    </div>
  );
}
