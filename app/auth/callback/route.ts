import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// After Google redirects the user back, Supabase appends a ?code=
// query parameter. We exchange that code for a session here, then
// redirect the user to /dashboard.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful login → go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Something went wrong → send back to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}