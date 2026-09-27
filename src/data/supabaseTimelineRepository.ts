import type { Arc, StoryEvent, Character, Location, SeriesTimeline } from '../models/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type TimelineRow = {
  series_id: number;
  title: string;
};

type ArcRow = {
  id: string;
  series_id: number;
  title: string;
  description: string;
  start_chapter: number;
  end_chapter: number;
  arc_order: number;
};

type EventRow = {
  id: string;
  series_id: number;
  arc_id: string;
  title: string;
  description: string;
  chapter: number;
  characters: string[];
  location: string | null;
  importance: StoryEvent['importance'];
  spoiler_level: StoryEvent['spoilerLevel'];
};

type CharacterRow = {
  id: string;
  series_id: number;
  name: string;
  image: string | null;
  description: string;
  first_appearance: number;
};

type LocationRow = {
  id: string;
  series_id: number;
  name: string;
  description: string;
  related_events: string[];
};

/**
 * Async Supabase provider for public timeline content.
 *
 * It intentionally returns null when Supabase is not configured or a query
 * fails. The UI can then fall back to the existing local repository.
 */
export const supabaseTimelineRepository = {
  isAvailable: () => isSupabaseConfigured && Boolean(supabase),

  async getTimelineForSeries(seriesId: number): Promise<SeriesTimeline | null> {
    if (!supabase) return null;

    const [seriesResult, arcsResult, eventsResult, charactersResult, locationsResult] =
      await Promise.all([
        supabase.from('timeline_series').select('series_id,title').eq('series_id', seriesId).maybeSingle(),
        supabase.from('timeline_arcs').select('*').eq('series_id', seriesId).order('arc_order'),
        supabase.from('timeline_events').select('*').eq('series_id', seriesId).order('chapter'),
        supabase.from('timeline_characters').select('*').eq('series_id', seriesId).order('first_appearance'),
        supabase.from('timeline_locations').select('*').eq('series_id', seriesId).order('name'),
      ]);

    if (seriesResult.error || !seriesResult.data) return null;
    if (arcsResult.error || eventsResult.error || charactersResult.error || locationsResult.error) return null;

    const series = seriesResult.data as TimelineRow;
    const arcs = (arcsResult.data ?? []) as ArcRow[];
    const events = (eventsResult.data ?? []) as EventRow[];
    const characters = (charactersResult.data ?? []) as CharacterRow[];
    const locations = (locationsResult.data ?? []) as LocationRow[];

    return {
      seriesId: series.series_id,
      seriesTitle: series.title,
      arcs: arcs.map((row): Arc => ({
        id: row.id,
        seriesId: row.series_id,
        title: row.title,
        description: row.description,
        startChapter: row.start_chapter,
        endChapter: row.end_chapter,
        order: row.arc_order,
      })),
      events: events.map((row): StoryEvent => ({
        id: row.id,
        arcId: row.arc_id,
        seriesId: row.series_id,
        title: row.title,
        description: row.description,
        chapter: row.chapter,
        characters: row.characters ?? [],
        location: row.location,
        importance: row.importance,
        spoilerLevel: row.spoiler_level,
      })),
      characters: characters.map((row): Character => ({
        id: row.id,
        seriesId: row.series_id,
        name: row.name,
        image: row.image,
        description: row.description,
        firstAppearance: row.first_appearance,
      })),
      locations: locations.map((row): Location => ({
        id: row.id,
        seriesId: row.series_id,
        name: row.name,
        description: row.description,
        relatedEvents: row.related_events ?? [],
      })),
    };
  },

  async getSeriesWithTimelines(): Promise<number[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('timeline_series')
      .select('series_id')
      .order('title');

    if (error) return [];
    return (data ?? []).map((row) => Number(row.series_id));
  },

  async hasTimelineData(seriesId: number): Promise<boolean> {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('timeline_series')
      .select('series_id')
      .eq('series_id', seriesId)
      .maybeSingle();
    return !error && Boolean(data);
  },
};
