
"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import type { Bookmark } from "@/lib/types";

interface Props {
  userId: string;
  onBookmarkAdded?: (bookmark: Bookmark) => void;
}

export function BookmarkForm({ userId }: Props) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
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

    const { error: insertError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        title: trimmedTitle,
        url: trimmedUrl,
      });

    setLoading(false);

    if (insertError) {
      setError(`Failed: ${insertError.message}`);
      console.error("Insert error:", insertError);
    } else {
      setTitle("");
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}










// "use client";

// import { createClient } from "@/lib/supabase/client";
// import { FormEvent, useState } from "react";

// interface Props {
//   userId: string;
// }

// export function BookmarkForm({ userId }: Props) {
//   const supabase = createClient();
//   const [title, setTitle] = useState("");
//   const [url, setUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     const trimmedTitle = title.trim();
//     const trimmedUrl = url.trim();

//     if (!trimmedTitle || !trimmedUrl) {
//       setError("Both title and URL are required.");
//       return;
//     }

//     try {
//       new URL(trimmedUrl);
//     } catch {
//       setError("Please enter a valid URL (include https://).");
//       return;
//     }

//     setLoading(true);

//     // DEBUG: Log what we're sending
//     console.log("Inserting bookmark:", {
//       user_id: userId,
//       title: trimmedTitle,
//       url: trimmedUrl,
//     });

//     const { data, error: insertError } = await supabase
//       .from("bookmarks")
//       .insert({
//         user_id: userId,
//         title: trimmedTitle,
//         url: trimmedUrl,
//       })
//       .select();  // <-- Added .select() to return the inserted row

//     // DEBUG: Log the response
//     console.log("Insert response - data:", data);
//     console.log("Insert response - error:", insertError);

//     setLoading(false);

//     if (insertError) {
//       setError(`Insert failed: ${insertError.message}`);
//       console.error("Insert error details:", insertError);
//     } else {
//       setSuccess("Bookmark added!");
//       setTitle("");
//       setUrl("");
//       // Clear success message after 2 seconds
//       setTimeout(() => setSuccess(null), 2000);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-3">
//       {/* DEBUG: Show the userId being used */}
//       <p className="text-xs text-gray-500">
//         Debug — user_id: {userId || "MISSING!"}
//       </p>

//       <div className="flex flex-col gap-3 sm:flex-row">
//         <input
//           type="text"
//           placeholder="Bookmark title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="flex-1 rounded-lg border border-gray-700 bg-gray-800
//                      px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
//                      outline-none transition focus:border-blue-500
//                      focus:ring-1 focus:ring-blue-500"
//         />
//         <input
//           type="text"
//           placeholder="https://example.com"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           className="flex-1 rounded-lg border border-gray-700 bg-gray-800
//                      px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
//                      outline-none transition focus:border-blue-500
//                      focus:ring-1 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold
//                      text-white transition hover:bg-blue-500
//                      disabled:opacity-50"
//         >
//           {loading ? "Adding…" : "Add"}
//         </button>
//       </div>

//       {error && (
//         <p className="text-sm text-red-400">{error}</p>
//       )}
//       {success && (
//         <p className="text-sm text-green-400">{success}</p>
//       )}
//     </form>
//   );
// }











// "use client";

// import { createClient } from "@/lib/supabase/client";
// import { FormEvent, useState } from "react";

// // A controlled form that inserts a new bookmark into Supabase.
// // After insertion, the real-time subscription (in BookmarkList)
// // will automatically pick up the new row — we don't need to
// // manually update local state here.

// interface Props {
//   userId: string;
// }

// export function BookmarkForm({ userId }: Props) {
//   const supabase = createClient();
//   const [title, setTitle] = useState("");
//   const [url, setUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     // Basic client-side validation
//     const trimmedTitle = title.trim();
//     const trimmedUrl = url.trim();
//     if (!trimmedTitle || !trimmedUrl) {
//       setError("Both title and URL are required.");
//       return;
//     }

//     // Simple URL format check
//     try {
//       new URL(trimmedUrl);
//     } catch {
//       setError("Please enter a valid URL (include https://).");
//       return;
//     }

//     setLoading(true);

//     const { error: insertError } = await supabase
//       .from("bookmarks")
//       .insert({
//         user_id: userId,
//         title: trimmedTitle,
//         url: trimmedUrl,
//       });

//     setLoading(false);

//     if (insertError) {
//       setError(insertError.message);
//     } else {
//       // Clear the form on success
//       setTitle("");
//       setUrl("");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-3">
//       <div className="flex flex-col gap-3 sm:flex-row">
//         <input
//           type="text"
//           placeholder="Bookmark title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="flex-1 rounded-lg border border-gray-700 bg-gray-800
//                      px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
//                      outline-none transition focus:border-blue-500
//                      focus:ring-1 focus:ring-blue-500"
//         />
//         <input
//           type="text"
//           placeholder="https://example.com"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           className="flex-1 rounded-lg border border-gray-700 bg-gray-800
//                      px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500
//                      outline-none transition focus:border-blue-500
//                      focus:ring-1 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold
//                      text-white transition hover:bg-blue-500
//                      disabled:opacity-50"
//         >
//           {loading ? "Adding…" : "Add"}
//         </button>
//       </div>

//       {error && (
//         <p className="text-sm text-red-400">{error}</p>
//       )}
//     </form>
//   );
// }