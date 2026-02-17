import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This helper creates a Supabase client specifically for middleware.
// It refreshes expired sessions automatically by exchanging the
// refresh token and writing new cookies onto the response.

export async function updateSession(request: NextRequest) {
  // Start with a plain "next" response that copies existing headers
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Set on the request so downstream Server Components see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 2. Rebuild the response with updated request
          supabaseResponse = NextResponse.next({ request });
          // 3. Set on the response so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Calling getUser() forces a session refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no user and they're trying to reach /dashboard,
  // redirect them to /login.
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}