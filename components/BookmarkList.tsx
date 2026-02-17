"use client";

import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { BookmarkItem } from "./BookmarkItem";

interface Props {
  userId: string;
  initialBookmarks: Bookmark[];
}

export function BookmarkList({ userId, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const supabase = createClient();

  // Function to add a bookmark to the list (used by realtime)
  const addBookmark = useCallback((newBookmark: Bookmark) => {
    setBookmarks((prev) => {
      // Prevent duplicates
      if (prev.some((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });
  }, []);

  // Function to remove a bookmark from the list (used by realtime)
  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, []);

  useEffect(() => {
    // Subscribe to ALL changes on bookmarks table for this user
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",  // Listen to ALL events (INSERT, DELETE, UPDATE)
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime event received:", payload.eventType, payload);

          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            addBookmark(newBookmark);
          }

          if (payload.eventType === "DELETE") {
            const oldBookmark = payload.old as { id: string };
            removeBookmark(oldBookmark.id);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      console.log("Unsubscribing from realtime...");
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, addBookmark, removeBookmark]);

  if (bookmarks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No bookmarks yet. Add one above ☝️
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}



// "use client";

// import { createClient } from "@/lib/supabase/client";
// import type { Bookmark } from "@/lib/types";
// import { useEffect, useState } from "react";
// import { BookmarkItem } from "./BookmarkItem";
// import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// // Fetches the user's bookmarks on mount, then subscribes to
// // Supabase Realtime so any INSERT or DELETE from *any* tab
// // (or device) is reflected instantly.

// interface Props {
//   userId: string;
//   initialBookmarks: Bookmark[];
// }

// export function BookmarkList({ userId, initialBookmarks }: Props) {
//   const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
//   const supabase = createClient();

//   useEffect(() => {
//     // ── Subscribe to real-time changes on the bookmarks table ──
//     // The filter `user_id=eq.${userId}` ensures we only receive
//     // events for the current user's rows.
//     const channel = supabase
//       .channel("bookmarks-realtime")
//       .on<Bookmark>(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "bookmarks",
//           filter: `user_id=eq.${userId}`,
//         },
//         (payload: RealtimePostgresChangesPayload<Bookmark>) => {
//           const newBookmark = payload.new as Bookmark;
//           // Prepend so the newest bookmark appears first
//           setBookmarks((prev) => {
//             // Guard against duplicates (e.g. if the initial fetch
//             // already included this row due to a race condition)
//             if (prev.some((b) => b.id === newBookmark.id)) return prev;
//             return [newBookmark, ...prev];
//           });
//         }
//       )
//       .on<Bookmark>(
//         "postgres_changes",
//         {
//           event: "DELETE",
//           schema: "public",
//           table: "bookmarks",
//           filter: `user_id=eq.${userId}`,
//         },
//         (payload: RealtimePostgresChangesPayload<Bookmark>) => {
//           const oldBookmark = payload.old as Partial<Bookmark>;
//           setBookmarks((prev) =>
//             prev.filter((b) => b.id !== oldBookmark.id)
//           );
//         }
//       )
//       .subscribe();

//     // Cleanup: unsubscribe when the component unmounts
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [supabase, userId]);

//   if (bookmarks.length === 0) {
//     return (
//       <p className="py-12 text-center text-sm text-gray-500">
//         No bookmarks yet. Add one above ☝️
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       {bookmarks.map((bookmark) => (
//         <BookmarkItem key={bookmark.id} bookmark={bookmark} />
//       ))}
//     </div>
//   );
// }