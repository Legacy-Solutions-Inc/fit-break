import "server-only";

import { redirect } from "next/navigation";

import { routes } from "@/components/sites/fitbreak/links";
import { authDisabled } from "@/config";
import { getSession } from "@/lib/auth/session";

/** The signed-in FitBreak member, shaped for the site header and member pages. */
export interface SiteMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  /** True only for the dev-only stand-in used when Supabase is not configured. */
  isDemo: boolean;
}

function avatarFor(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E64A8A&color=fff&bold=true`;
}

const DEMO_MEMBER: SiteMember = {
  id: "demo-member",
  name: "Demo Member",
  email: "demo@fitbreak.local",
  avatarUrl: avatarFor("Demo Member"),
  isDemo: true,
};

/** The signed-in member, or `null` for guests. */
export async function getMember(): Promise<SiteMember | null> {
  const user = await getSession();
  if (!user) return null;
  const email = user.email ?? "";
  const meta = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
  const name = meta.full_name ?? meta.name ?? (email.split("@")[0] || "Member");
  return { id: user.id, name, email, avatarUrl: meta.avatar_url ?? avatarFor(name), isDemo: false };
}

/**
 * For members-only pages. Returns the member, or redirects guests to /login.
 * In dev without Supabase (auth disabled) a demo member is returned so the
 * member area stays browsable — mirroring the template's dashboard behaviour.
 */
export async function requireMember(): Promise<SiteMember> {
  const member = await getMember();
  if (member) return member;
  if (authDisabled) return DEMO_MEMBER;
  redirect(routes.login);
}
