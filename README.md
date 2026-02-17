# 🔖 Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## 🌐 Live Demo
[https://smartbookmarkapp-gamma.vercel.app/login](https://smartbookmarkapp-gamma.vercel.app/login)

## 📦 GitHub Repo
[https://github.com/PraveenVenkatachlam/Smart-Bookmark-App.git](https://github.com/PraveenVenkatachlam/Smart-Bookmark-App.git)

## ✅ Features
1. **Google OAuth** — Sign in with Google (no email/password)
2. **Add Bookmarks** — Save any URL with a title
3. **Private Bookmarks** — Each user only sees their own (Row Level Security)
4. **Real-time Sync** — Open two tabs, add in one, appears in the other instantly
5. **Delete Bookmarks** — Remove bookmarks with one click
6. **Deployed on Vercel** — Live production URL

## 🛠️ Tech Stack
- **Next.js 16** — App Router, TypeScript
- **Supabase** — Auth (Google OAuth), PostgreSQL Database, Realtime subscriptions
- **Tailwind CSS v4** — Styling
- **Vercel** — Deployment

## 🧩 Architecture

### Database
- Single `bookmarks` table with Row Level Security (RLS)
- RLS policies ensure users can only SELECT, INSERT, and DELETE their own rows
- Realtime enabled via PostgreSQL publication

### Auth Flow
1. User clicks "Sign in with Google"
2. Supabase redirects to Google OAuth consent screen
3. Google redirects back to `/auth/callback` with a code
4. App exchanges code for a session
5. User is redirected to `/dashboard`

### Real-time Flow
1. On page load, bookmarks are fetched from Supabase
2. A WebSocket subscription listens for INSERT/DELETE events
3. When the user adds a bookmark, it appears instantly (optimistic update)
4. Other tabs receive the change via Supabase Realtime

## 🐛 Problems I Ran Into and How I Solved Them

### 1. Tailwind CSS v4 Syntax Change
**Problem:** `@tailwind base; @tailwind components; @tailwind utilities;` 
caused PostCSS build errors in Next.js 16.
**Solution:** Replaced with `@import "tailwindcss";` — the new v4 syntax. 
Removed `tailwind.config.ts` as it's no longer needed in v4.

### 2. Folder Structure — Module Not Found
**Problem:** Placed `components/` and `lib/` inside the `app/` directory. 
The `@/` alias couldn't resolve the imports.
**Solution:** Moved both folders to the project root where `tsconfig.json` 
`@/*` alias points to.

### 3. Next.js 16 Middleware Deprecation
**Problem:** `middleware.ts` file convention is deprecated in Next.js 16.1.6. 
Got warning: "Please use proxy instead."
**Solution:** Renamed `middleware.ts` to `proxy.ts`. The file content stays 
the same — only the filename changed.

### 4. Google OAuth Provider Not Enabled
**Problem:** Clicking "Sign in with Google" returned error: 
"Unsupported provider: provider is not enabled."
**Solution:** Created Google Cloud OAuth credentials (Client ID + Secret) 
and enabled Google provider in Supabase Authentication settings.

### 5. Bookmarks Not Showing Instantly
**Problem:** After adding a bookmark, it only appeared after page refresh.
**Solution:** Used `.select().single()` on insert to get the new row back 
immediately, then added it to state. Also set up Supabase Realtime 
subscription for cross-tab sync.

## 🗄️ Database Schema

```sql
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  url TEXT NOT NULL CHECK (char_length(url) > 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;