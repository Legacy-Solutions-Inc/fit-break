import { MemberShell } from "@/components/sites/fitbreak/member-shell/member-shell";
import { requireMember } from "@/lib/fitbreak/member";

/** Members-only area: redirects guests to /login and frames pages with the member sidebar. */
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  return <MemberShell member={member}>{children}</MemberShell>;
}
