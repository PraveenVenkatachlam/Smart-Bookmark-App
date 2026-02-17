"use client";

import { createBrowserClient } from "@supabase/ssr";

// This function returns a Supabase client that runs in the browser.
// It automatically reads/writes the auth session from cookies set by
// the middleware, keeping the session in sync across tabs.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}