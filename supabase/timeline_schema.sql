-- ManhwaTimeline timeline database
-- Run this in the Supabase SQL editor when a Supabase project is connected.
-- The frontend reads published timeline content from Supabase when VITE_SUPABASE_URL
-- and VITE_SUPABASE_ANON_KEY are configured.

create table if not exists public.timeline_series (
  series_id bigint primary key,
  title text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_arcs (
  id text primary key,
  series_id bigint not null references public.timeline_series(series_id) on delete cascade,
  title text not null,
  description text not null default '',
  start_chapter integer not null check (start_chapter >= 0),
  end_chapter integer not null check (end_chapter >= start_chapter),
  arc_order integer not null default 0
);

create table if not exists public.timeline_events (
  id text primary key,
  series_id bigint not null references public.timeline_series(series_id) on delete cascade,
  arc_id text references public.timeline_arcs(id) on delete set null,
  title text not null,
  description text not null default '',
  chapter integer not null check (chapter >= 0),
  characters text[] not null default '{}',
  location text,
  importance text not null default 'MINOR'
    check (importance in ('MAJOR', 'MINOR', 'ARC_START', 'ARC_END')),
  spoiler_level smallint not null default 1
    check (spoiler_level between 0 and 3)
);

create table if not exists public.timeline_characters (
  id text primary key,
  series_id bigint not null references public.timeline_series(series_id) on delete cascade,
  name text not null,
  image text,
  description text not null default '',
  first_appearance integer not null default 0 check (first_appearance >= 0)
);

create table if not exists public.timeline_locations (
  id text primary key,
  series_id bigint not null references public.timeline_series(series_id) on delete cascade,
  name text not null,
  description text not null default '',
  related_events text[] not null default '{}'
);

create index if not exists timeline_arcs_series_idx
  on public.timeline_arcs(series_id, arc_order);

create index if not exists timeline_events_series_chapter_idx
  on public.timeline_events(series_id, chapter);

create index if not exists timeline_characters_series_idx
  on public.timeline_characters(series_id);

create index if not exists timeline_locations_series_idx
  on public.timeline_locations(series_id);

alter table public.timeline_series enable row level security;
alter table public.timeline_arcs enable row level security;
alter table public.timeline_events enable row level security;
alter table public.timeline_characters enable row level security;
alter table public.timeline_locations enable row level security;

drop policy if exists "Public can read timeline series" on public.timeline_series;
drop policy if exists "Public can read timeline arcs" on public.timeline_arcs;
drop policy if exists "Public can read timeline events" on public.timeline_events;
drop policy if exists "Public can read timeline characters" on public.timeline_characters;
drop policy if exists "Public can read timeline locations" on public.timeline_locations;

create policy "Public can read timeline series"
  on public.timeline_series for select using (true);

create policy "Public can read timeline arcs"
  on public.timeline_arcs for select using (true);

create policy "Public can read timeline events"
  on public.timeline_events for select using (true);

create policy "Public can read timeline characters"
  on public.timeline_characters for select using (true);

create policy "Public can read timeline locations"
  on public.timeline_locations for select using (true);
