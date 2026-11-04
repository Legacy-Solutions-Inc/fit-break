import "server-only";

import { cookies } from "next/headers";

import { getSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/authz";
import type { SiteMember } from "@/lib/fitbreak/member";
import { getAccount } from "@/services/fitbreak/members";

import { SIDEBAR_COLLAPSED_COOKIE } from "./constants";
import { MemberSidebar } from "./member-sidebar";

/**
 * The source's member page frame — `<div class="flex min-h-screen bg-gray-50">`
 * with the member sidebar beside the page content. Used by `member/layout.tsx`
 * and by `/schedule` for signed-in members.
 */
export async function MemberShell({
  member,
  children,
}: {
  member: SiteMember;
  children: React.ReactNode;
}) {
  const [user, account, cookieStore] = await Promise.all([
    getSession(),
    getAccount(member.id, member.email),
    cookies(),
  ]);
  const isAdmin = hasRole(user, "admin", "superadmin");
  const collapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MemberSidebar
        name={member.name}
        avatarUrl={member.avatarUrl}
        credits={account.credits}
        isAdmin={isAdmin}
        initialCollapsed={collapsed}
      />
      <div className="min-h-screen min-w-0 flex-1 bg-gray-50">{children}</div>
    </div>
  );
}
