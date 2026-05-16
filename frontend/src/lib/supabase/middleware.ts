import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase keys missing. Skipping auth middleware.");
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // ── Public routes (no auth required) ──────────────────────────────────────
  const publicPaths = ["/", "/auth/callback", "/auth/auth-code-error", "/auth/resolve-role"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p));

  // ── Protect dashboard routes ───────────────────────────────────────────────
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // ── Protect onboarding routes ──────────────────────────────────────────────
  if (pathname.startsWith("/onboarding") && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // ── If logged in, redirect away from /auth (but not /auth/callback etc.) ──
  if (pathname === "/auth" && user) {
    // Role is checked by /auth/resolve-role — redirect there
    return NextResponse.redirect(new URL("/auth/resolve-role", request.url));
  }

  return response;
}
