-- Starter timeline seed for ManhwaTimeline.
-- Run supabase/timeline_schema.sql first, then this file.
-- This seed is intentionally concise and is meant to establish the database-driven
-- timeline pipeline. Expand individual arcs/events later without changing the schema.

begin;

insert into public.timeline_series (series_id, title, slug)
values
  (105398, 'Solo Leveling', 'solo-leveling'),
  (85143, 'Tower of God', 'tower-of-god'),
  (119257, 'Omniscient Reader', 'omniscient-reader')
on conflict (series_id) do update
set title = excluded.title, slug = excluded.slug, updated_at = now();

insert into public.timeline_arcs (id, series_id, title, description, start_chapter, end_chapter, arc_order)
values
  ('sl-reawakening', 105398, 'Reawakening', 'Jinwoo survives the double dungeon and receives the System.', 1, 18, 1),
  ('sl-job-change', 105398, 'Job Change', 'Jinwoo develops through the System and completes his second-class advancement.', 19, 45, 2),
  ('sl-red-gate', 105398, 'Red Gate', 'A dangerous gate separates a hunter party from the outside world.', 46, 61, 3),
  ('sl-jeju', 105398, 'Jeju Island', 'The hunter community faces the escalating threat surrounding Jeju Island.', 90, 110, 4),

  ('tog-season-1', 85143, 'Season 1', 'Baam enters the Tower and begins climbing its tests.', 1, 78, 1),
  ('tog-workshop', 85143, 'Workshop Battle', 'Baam and his allies enter a major conflict around the Workshop.', 79, 110, 2),
  ('tog-hell-train', 85143, 'Hell Train', 'The climb continues through the Hell Train and increasingly dangerous floors.', 111, 337, 3),
  ('tog-nest', 85143, 'The Nest', 'Baam and allied forces confront a major battlefield connected to the war against Jahad.', 338, 485, 4),

  ('orv-scenarios', 119257, 'The Scenarios Begin', 'Dokja enters a world governed by scenarios after the novel becomes reality.', 1, 20, 1),
  ('orv-stations', 119257, 'Early Scenarios', 'Dokja and his companions survive successive scenarios while building alliances.', 21, 50, 2),
  ('orv-theater', 119257, 'Major Scenario Conflicts', 'The scale of the scenarios expands and Dokja faces increasingly powerful opponents.', 51, 100, 3),
  ('orv-great-scenarios', 119257, 'Great Scenarios', 'The story moves into larger scenarios involving constellations and wider consequences.', 101, 200, 4)
on conflict (id) do update
set title=excluded.title, description=excluded.description, start_chapter=excluded.start_chapter,
    end_chapter=excluded.end_chapter, arc_order=excluded.arc_order;

insert into public.timeline_events
  (id, series_id, arc_id, title, description, chapter, characters, location, importance, spoiler_level)
values
  ('sl-double-dungeon', 105398, 'sl-reawakening', 'The Double Dungeon', 'Jinwoo and his party encounter the hidden double dungeon and its deadly rules.', 1, array['Sung Jinwoo'], 'Double Dungeon', 'MAJOR', 1),
  ('sl-system', 105398, 'sl-reawakening', 'The System Appears', 'Jinwoo becomes the sole player of a mysterious System that allows him to grow stronger.', 2, array['Sung Jinwoo'], 'Double Dungeon', 'MAJOR', 1),
  ('sl-daily-quests', 105398, 'sl-reawakening', 'Daily Training', 'Jinwoo begins following the System training routine and discovers that his growth is real.', 4, array['Sung Jinwoo'], 'Various', 'MINOR', 1),
  ('sl-job-change', 105398, 'sl-job-change', 'Job Change Quest', 'Jinwoo enters a special quest that determines the direction of his new power.', 45, array['Sung Jinwoo'], 'Instance Dungeon', 'MAJOR', 2),
  ('sl-red-gate', 105398, 'sl-red-gate', 'Red Gate Incident', 'A gate unexpectedly becomes a closed-off battlefield for the hunters inside.', 46, array['Sung Jinwoo'], 'Red Gate', 'MAJOR', 1),
  ('sl-jeju-raid', 105398, 'sl-jeju', 'Jeju Island Raid', 'Hunters launch a major operation against the monsters on Jeju Island.', 90, array['Sung Jinwoo','Cha Hae-In'], 'Jeju Island', 'MAJOR', 2),

  ('tog-entry', 85143, 'tog-season-1', 'Entering the Tower', 'Baam enters the Tower in pursuit of Rachel and is immediately confronted with its first test.', 1, array['Twenty-Fifth Baam','Rachel'], 'Tower Entrance', 'MAJOR', 1),
  ('tog-first-test', 85143, 'tog-season-1', 'First Test', 'Baam meets other Regulars and begins learning the rules of the Tower.', 2, array['Twenty-Fifth Baam','Khun Aguero Agnis','Rak Wraithraiser'], 'First Floor', 'MAJOR', 1),
  ('tog-team-formed', 85143, 'tog-season-1', 'Team Forms', 'Baam, Khun and Rak become central members of a developing group of Regulars.', 10, array['Twenty-Fifth Baam','Khun Aguero Agnis','Rak Wraithraiser'], 'Test Floor', 'MINOR', 1),
  ('tog-season1-finale', 85143, 'tog-season-1', 'Season 1 Climax', 'The first major stage of Baam’s climb reaches its turning point.', 78, array['Twenty-Fifth Baam','Rachel'], 'Tower', 'MAJOR', 2),
  ('tog-workshop', 85143, 'tog-workshop', 'Workshop Battle', 'Baam and his allies become involved in a large conflict surrounding the Workshop.', 79, array['Twenty-Fifth Baam','Khun Aguero Agnis','Rak Wraithraiser'], 'Workshop Battle', 'MAJOR', 1),
  ('tog-nest', 85143, 'tog-nest', 'The Nest', 'The conflict at the Nest becomes one of the major battlefields of the wider war.', 338, array['Twenty-Fifth Baam'], 'The Nest', 'MAJOR', 2),

  ('orv-world-changes', 119257, 'orv-scenarios', 'The World Changes', 'The novel Dokja has been reading begins unfolding in reality.', 1, array['Kim Dokja'], 'Seoul', 'MAJOR', 1),
  ('orv-first-scenario', 119257, 'orv-scenarios', 'First Scenario', 'Dokja uses his knowledge of the original story to survive the first scenario.', 1, array['Kim Dokja'], 'Seoul', 'MAJOR', 1),
  ('orv-companions', 119257, 'orv-stations', 'Companions Gather', 'Dokja begins forming the group that will accompany him through the scenarios.', 20, array['Kim Dokja','Yoo Jung-Hyeok','Yoo Sang-A'], 'Seoul', 'MAJOR', 1),
  ('orv-scenarios-expand', 119257, 'orv-theater', 'Scenarios Expand', 'The scenarios grow in scale while Dokja increasingly changes events he remembers from the novel.', 51, array['Kim Dokja','Yoo Jung-Hyeok'], 'Scenario World', 'MAJOR', 2),
  ('orv-constellations', 119257, 'orv-theater', 'Constellations Become Central', 'Constellations and their sponsorships become increasingly important to the surviving incarnations.', 75, array['Kim Dokja'], 'Scenario World', 'MAJOR', 2),
  ('orv-great-scenarios', 119257, 'orv-great-scenarios', 'Great Scenarios', 'The story moves into larger scenarios with consequences extending beyond the early survival games.', 101, array['Kim Dokja','Yoo Jung-Hyeok','Han Su-Yeong'], 'Scenario World', 'MAJOR', 2)
on conflict (id) do update
set title=excluded.title, description=excluded.description, chapter=excluded.chapter,
    characters=excluded.characters, location=excluded.location,
    importance=excluded.importance, spoiler_level=excluded.spoiler_level, arc_id=excluded.arc_id;

insert into public.timeline_characters
  (id, series_id, name, image, description, first_appearance)
values
  ('sl-jinwoo', 105398, 'Sung Jinwoo', null, 'The protagonist of Solo Leveling who becomes the player of the System.', 1),
  ('sl-haein', 105398, 'Cha Hae-In', null, 'A powerful hunter who becomes closely connected to Jinwoo.', 65),
  ('tog-baam', 85143, 'Twenty-Fifth Baam', null, 'The central protagonist climbing the Tower while searching for Rachel.', 1),
  ('tog-khun', 85143, 'Khun Aguero Agnis', null, 'A strategic Regular and one of Baam’s closest companions.', 4),
  ('tog-rak', 85143, 'Rak Wraithraiser', null, 'A powerful Regular who becomes part of Baam and Khun’s core group.', 4),
  ('orv-dokja', 119257, 'Kim Dokja', null, 'The reader who uses his knowledge of a novel after its world becomes reality.', 1),
  ('orv-junghyeok', 119257, 'Yoo Jung-Hyeok', null, 'The protagonist of the original novel within the story and a key companion and rival.', 1),
  ('orv-suyeong', 119257, 'Han Su-Yeong', null, 'A major survivor whose actions become important to the changing story.', 20)
on conflict (id) do update
set name=excluded.name, description=excluded.description, first_appearance=excluded.first_appearance;

insert into public.timeline_locations
  (id, series_id, name, description, related_events)
values
  ('sl-double-dungeon', 105398, 'Double Dungeon', 'The hidden dungeon where Jinwoo first encounters the System.', array['sl-double-dungeon','sl-system']),
  ('sl-red-gate', 105398, 'Red Gate', 'A dangerous gate that becomes isolated from the outside world.', array['sl-red-gate']),
  ('sl-jeju', 105398, 'Jeju Island', 'The setting of a major hunter operation.', array['sl-jeju-raid']),
  ('tog-tower', 85143, 'The Tower', 'The enormous structure that Regulars climb through tests and floors.', array['tog-entry','tog-first-test','tog-season1-finale']),
  ('tog-workshop', 85143, 'Workshop Battle', 'A major conflict involving the Workshop and several factions.', array['tog-workshop']),
  ('tog-nest', 85143, 'The Nest', 'A major battlefield in the wider conflict surrounding Baam and his allies.', array['tog-nest']),
  ('orv-seoul', 119257, 'Seoul', 'The starting setting where the scenarios first become reality.', array['orv-world-changes','orv-first-scenario','orv-companions']),
  ('orv-scenario-world', 119257, 'Scenario World', 'The changing world governed by scenarios and constellation systems.', array['orv-scenarios-expand','orv-constellations','orv-great-scenarios'])
on conflict (id) do update
set name=excluded.name, description=excluded.description, related_events=excluded.related_events;

commit;
