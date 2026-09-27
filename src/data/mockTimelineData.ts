import type { Arc, StoryEvent, Character, Location } from '../models/types';

export interface SeriesTimeline {
  seriesId: number;
  seriesTitle: string;
  arcs: Arc[];
  events: StoryEvent[];
  characters: Character[];
  locations: Location[];
}

/**
 * Timeline model type and intentionally empty local dataset.
 * Published timeline content comes from Supabase.
 */
export const DEMO_TIMELINE_DATA: Record<number, SeriesTimeline> = {};
