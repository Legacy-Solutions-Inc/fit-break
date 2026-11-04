import { Chatbot } from "@/components/sites/fitbreak/chatbot";
import { SiteFooter } from "@/components/sites/fitbreak/site-footer";
import { SiteHeader } from "@/components/sites/fitbreak/site-header";
import { memberAreaEnabled } from "@/config";
import { getMember } from "@/lib/fitbreak/member";

/** Standard FitBreak page chrome: sticky header, footer, assistant bubble. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Parked Member Area ⇒ the header never shows account UI.
  const member = memberAreaEnabled ? await getMember() : null;

  return (
    <>
      <SiteHeader user={member} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <Chatbot />
    </>
  );
}
