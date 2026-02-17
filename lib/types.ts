// lib/types.ts

// Represents a single bookmark row from the database
export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
}

// Payload shape that Supabase Realtime sends
export interface RealtimeBookmarkPayload {
  eventType: "INSERT" | "DELETE";
  new: Bookmark;   // populated on INSERT
  old: Bookmark;   // populated on DELETE (has at least { id })
}
// // Shared TypeScript types used across the app

// export interface Bookmark {
//   id: string;
//   user_id: string;
//   title: string;
//   url: string;
//   created_at: string;
// }

// // Payload shape that Supabase Realtime sends
// export interface RealtimeBookmarkPayload {
//   eventType: "INSERT" | "DELETE";
//   new: Bookmark;   // populated on INSERT
//   old: Bookmark;   // populated on DELETE (has at least { id })
// }