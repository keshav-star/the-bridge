import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * After a sign-in, this route reads the user's role from the backend
 * and redirects them to the correct dashboard.
 * It is used instead of hardcoding /dashboard/student after login.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3000"));
  }

  // Check the backend for user's role
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${apiUrl}/users/${user.id}`);

    if (res.ok) {
      const userData = await res.json();
      const role = userData.role as string;

      if (role === "ALUMNI" || role === "RECRUITER") {
        return NextResponse.redirect(new URL("/dashboard/recruiter", "http://localhost:3000"));
      }
    }
  } catch {
    // Backend not reachable — fall back to metadata
    const metaRole = user.user_metadata?.role;
    if (metaRole === "ALUMNI" || metaRole === "RECRUITER") {
      return NextResponse.redirect(new URL("/dashboard/recruiter", "http://localhost:3000"));
    }
  }

  // Default: student
  return NextResponse.redirect(new URL("/dashboard/student", "http://localhost:3000"));
}
