import { MemberShell } from "@/components/sites/fitbreak/member-shell/member-shell";
import { requireMember } from "@/lib/fitbreak/member";

/** Members-only area: redirects guests to /login and frames pages with the member sidebar. */
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  // The parked Member Area keeps the cloned look (ADR 0009): `.fb-legacy`.
  return (
    <div className="fb-legacy">
      <MemberShell member={member}>{children}</MemberShell>
    </div>
  );
}
