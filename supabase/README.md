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

The local timeline repository is intentionally empty. It does not contain demo manga or hardcoded story data. When Supabase is configured, published timelines are loaded from the database.
