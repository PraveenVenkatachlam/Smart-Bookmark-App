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
  new: Bookmark;   
  old: Bookmark;  
}
