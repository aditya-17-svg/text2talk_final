# Text2Talk

React + Vite + Tailwind + Supabase speech-to-text and text-to-speech app.

## Setup
1. `npm install`
2. Create a Supabase project. In the SQL editor, run `supabase/schema.sql`.
3. In Supabase Auth, enable Email (and optionally Google) and add `http://localhost:5173` and your Vercel URL as redirect URLs.
4. `cp .env.example .env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public anon key only).
5. `npm run dev`, and `npm test` for tests.

## Deploy (Vercel)
Import the repo, set the two env vars, deploy. `vercel.json` handles SPA routing.

## Status / not yet built
- Cloud TTS with downloadable audio (needs a server endpoint such as a Vercel function, with the provider key kept server-side, plus rate limiting).
- Profile editing, default voice/rate persistence, account deletion (needs a service-role server function), notification prefs, date/type filters, transcript editing page, usage stats, privacy/terms pages.
- Nothing here has been run against a live Supabase project yet. Test sign-up, RLS and recognition in Chrome before relying on it.
