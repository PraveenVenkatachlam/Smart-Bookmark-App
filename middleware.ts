import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// The middleware runs on every matched request BEFORE
// Next.js renders the page.  It refreshes the Supabase
// auth session and protects private routes.

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run middleware on all paths except static files & images
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};