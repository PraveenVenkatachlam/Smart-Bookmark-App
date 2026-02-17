"use client";

import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { useEffect, useState, FormEvent } from "react";
import { AuthButton } from "./AuthButton";

interface Props {
  userId: string;
  userEmail: string;
}

export function Dashboard({ userId, userEmail }: Props) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  // ── 1. FETCH bookmarks on mount ──
  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error.message);
      } else {
        setBookmarks(data as Bookmark[]);
      }
      setFetching(false);
    };

    fetchBookmarks();
  }, [supabase, userId]);

  // ── 2. REALTIME subscription ──
  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const oldId = (payload.old as { id: string }).id;
          setBookmarks((prev) => prev.filter((b) => b.id !== oldId));
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // ── 3. ADD bookmark ──
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setError("Both title and URL are required.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError("Please enter a valid URL (include https://).");
      return;
    }

    setLoading(true);

    const { data, error: insertError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        title: trimmedTitle,
        url: trimmedUrl,
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      // Add to list IMMEDIATELY (don't wait for realtime)
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === (data as Bookmark).id)) return prev;
        return [data as Bookmark, ...prev];
      });
      setTitle("");
      setUrl("");
    }
  };

  // ── 4. DELETE bookmark ──
  const handleDelete = async (id: string) => {
    // Remove from UI IMMEDIATELY (optimistic)
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      // If delete failed, refetch to restore the list
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setBookmarks(data as Bookmark[]);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔖 My Bookmarks</h1>
          <p className="mt-1 text-sm text-gray-400">{userEmail}</p>
        </div>
        <AuthButton showSignOut />
      </div>

      {/* ── Add Form ── */}
      <form onSubmit={handleAdd} className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800
                       px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
                       outline-none transition focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800
                       px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
                       outline-none transition focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold
                       text-white transition hover:bg-blue-500
                       disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {/* ── Bookmark List ── */}
      {fetching ? (
        <p className="py-12 text-center text-sm text-gray-500">
          Loading bookmarks...
        </p>
      ) : bookmarks.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No bookmarks yet. Add one above ☝️
        </p>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
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
                  className="block truncate text-xs text-blue-400 hover:underline"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="shrink-0 rounded-md bg-red-600/20 px-3 py-1.5
                           text-xs font-medium text-red-400 transition
                           hover:bg-red-600/40"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}