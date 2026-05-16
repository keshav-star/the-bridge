import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" is set during sign-up to route to onboarding
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If a specific "next" path is provided (e.g. /onboarding/student), use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Otherwise resolve role and route to the correct dashboard
      return NextResponse.redirect(`${origin}/auth/resolve-role`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
