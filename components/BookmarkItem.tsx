"use client";

import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { useState } from "react";

// Renders a single bookmark row with a delete button.

interface Props {
  bookmark: Bookmark;
}

export function BookmarkItem({ bookmark }: Props) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id);

    if (error) {
      console.error("Delete failed:", error.message);
      setDeleting(false);
    }
    // On success, the real-time subscription in BookmarkList
    // removes this item automatically.
  };

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-lg
                 border border-gray-800 bg-gray-900 px-4 py-3
                 transition hover:border-gray-700"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-100">
          {bookmark.title}
        </p>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-blue-400 hover:underline"
        >
          {bookmark.url}
        </a>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded-md bg-red-600/20 px-3 py-1.5 text-xs
                   font-medium text-red-400 transition hover:bg-red-600/40
                   disabled:opacity-50"
      >
        {deleting ? "…" : "Delete"}
      </button>
    </div>
  );
}