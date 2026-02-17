import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/AuthButton";
import { BookmarkForm } from "@/components/BookmarkForm";
import { BookmarkList } from "@/components/BookmarkList";
import type { Bookmark } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔖 My Bookmarks</h1>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
        </div>
        <AuthButton showSignOut />
      </div>

      {/* Add Bookmark Form */}
      <div className="mb-6">
        <BookmarkForm userId={user.id} />
      </div>

      {/* Bookmark List (real-time) */}
      <BookmarkList
        userId={user.id}
        initialBookmarks={(bookmarks as Bookmark[]) ?? []}
      />
    </div>
  );
}



// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import { AuthButton } from "@/components/AuthButton";
// import { BookmarkForm } from "@/components/BookmarkForm";
// import { BookmarkList } from "@/components/BookmarkList";
// import type { Bookmark } from "@/lib/types";

// // This is a SERVER component.  It runs only on the server.
// // 1. It verifies the session (redirect to /login if missing).
// // 2. It fetches the user's bookmarks from Supabase.
// // 3. It passes the data as props to client components.

// export default async function DashboardPage() {
//   const supabase = await createClient();

//   // ── Auth check ──
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/login");
//   }

//   // ── Fetch initial bookmarks (server-side) ──
//   const { data: bookmarks, error } = await supabase
//     .from("bookmarks")
//     .select("*")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false });

//   if (error) {
//     console.error("Failed to fetch bookmarks:", error.message);
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 py-10">
//       {/* ── Header ── */}
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">🔖 My Bookmarks</h1>
//           <p className="mt-1 text-sm text-gray-400">
//             {user.email}
//           </p>
//         </div>
//         <AuthButton showSignOut />
//       </div>

//       {/* ── Add Bookmark Form ── */}
//       <div className="mb-6">
//         <BookmarkForm userId={user.id} />
//       </div>

//       {/* ── Bookmark List (real-time) ── */}
//       <BookmarkList
//         userId={user.id}
//         initialBookmarks={(bookmarks as Bookmark[]) ?? []}
//       />
//     </div>
//   );
// }