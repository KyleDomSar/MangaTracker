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
 * Local timeline fallback.
 *
 * This is intentionally empty. Story timelines are no longer hardcoded
 * for specific manga. When Supabase is configured, timeline content comes
 * from the public timeline database.
 */
export const DEMO_TIMELINE_DATA: Record<number, SeriesTimeline> = {};

export const getTimelineForSeries = (seriesId: number): SeriesTimeline | null => {
  return DEMO_TIMELINE_DATA[seriesId] || null;
};

export const getSeriesWithTimelines = (): number[] => {
  return Object.keys(DEMO_TIMELINE_DATA).map(Number);
};

export const getEventsForSeries = (seriesId: number): StoryEvent[] => {
  return DEMO_TIMELINE_DATA[seriesId]?.events || [];
};

export const getArcsForSeries = (seriesId: number): Arc[] => {
  return DEMO_TIMELINE_DATA[seriesId]?.arcs || [];
};

export const getCharactersForSeries = (seriesId: number): Character[] => {
  return DEMO_TIMELINE_DATA[seriesId]?.characters || [];
};

export const getLocationsForSeries = (seriesId: number): Location[] => {
  return DEMO_TIMELINE_DATA[seriesId]?.locations || [];
};

export const getEventById = (seriesId: number, eventId: string): StoryEvent | null => {
  return DEMO_TIMELINE_DATA[seriesId]?.events.find((event) => event.id === eventId) || null;
};

export const getArcById = (seriesId: number, arcId: string): Arc | null => {
  return DEMO_TIMELINE_DATA[seriesId]?.arcs.find((arc) => arc.id === arcId) || null;
};

export const hasTimelineData = (seriesId: number): boolean => {
  return Boolean(DEMO_TIMELINE_DATA[seriesId]);
};
