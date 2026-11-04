import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { paths } from "@/paths";

// Exchanges the OAuth / email-link PKCE `code` for a session, then redirects.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  // Same-origin paths only ("/x", never "//host" or absolute URLs).
  const next =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : paths.dashboard.overview;

  if (code) {
    const supabase = createClient(cookies());
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // FitBreak member sign-ins start on /login; send failures back there.
  const failure = next.startsWith("/member") ? "/login" : paths.auth.signIn;
  return NextResponse.redirect(`${origin}${failure}?error=auth_callback`);
}
