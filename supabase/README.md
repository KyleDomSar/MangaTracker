# Supabase timeline setup

Create a local environment file named `.env.local`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit real keys.

Run `supabase/timeline_schema.sql` in the Supabase SQL Editor.

The timeline database is intentionally separate from AniList:

- AniList: manga metadata, covers, genres, status, score, and chapter metadata when available.
- Supabase: curated story arcs, events, characters, and locations.
- User progress: remains separate from public timeline content.

The app still uses the local timeline repository as a fallback. This prevents the current app from breaking before a Supabase project is configured and the repository is switched to async database reads.
