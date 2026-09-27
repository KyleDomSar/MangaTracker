import type { Arc, StoryEvent, Character, Location } from '../models/types';
import { DEMO_TIMELINE_DATA, type SeriesTimeline } from './mockTimelineData';

/**
 * Timeline repository
 *
 * Timeline content is deliberately separated from AniList metadata and user
 * reading progress. The UI talks to this repository instead of importing the
 * underlying data source directly.
 *
 * Today the repository uses curated local data. A future Supabase/API
 * implementation can replace the provider below without changing Timeline,
 * MangaDetails, or the rest of the app.
 */

export interface TimelineRepository {
  getTimelineForSeries(seriesId: number): SeriesTimeline | null;
  getSeriesWithTimelines(): number[];
  getEventsForSeries(seriesId: number): StoryEvent[];
  getArcsForSeries(seriesId: number): Arc[];
  getCharactersForSeries(seriesId: number): Character[];
  getLocationsForSeries(seriesId: number): Location[];
  getEventById(seriesId: number, eventId: string): StoryEvent | null;
  getArcById(seriesId: number, arcId: string): Arc | null;
  hasTimelineData(seriesId: number): boolean;
}

const localTimelineRepository: TimelineRepository = {
  getTimelineForSeries: (seriesId) => DEMO_TIMELINE_DATA[seriesId] || null,

  getSeriesWithTimelines: () => Object.keys(DEMO_TIMELINE_DATA).map(Number),

  getEventsForSeries: (seriesId) =>
    DEMO_TIMELINE_DATA[seriesId]?.events || [],

  getArcsForSeries: (seriesId) =>
    DEMO_TIMELINE_DATA[seriesId]?.arcs || [],

  getCharactersForSeries: (seriesId) =>
    DEMO_TIMELINE_DATA[seriesId]?.characters || [],

  getLocationsForSeries: (seriesId) =>
    DEMO_TIMELINE_DATA[seriesId]?.locations || [],

  getEventById: (seriesId, eventId) =>
    DEMO_TIMELINE_DATA[seriesId]?.events.find((event) => event.id === eventId) || null,

  getArcById: (seriesId, arcId) =>
    DEMO_TIMELINE_DATA[seriesId]?.arcs.find((arc) => arc.id === arcId) || null,

  hasTimelineData: (seriesId) => seriesId in DEMO_TIMELINE_DATA,
};

export const timelineRepository = localTimelineRepository;

export const getTimelineForSeries = (seriesId: number) =>
  timelineRepository.getTimelineForSeries(seriesId);

export const getSeriesWithTimelines = () =>
  timelineRepository.getSeriesWithTimelines();

export const getEventsForSeries = (seriesId: number) =>
  timelineRepository.getEventsForSeries(seriesId);

export const getArcsForSeries = (seriesId: number) =>
  timelineRepository.getArcsForSeries(seriesId);

export const getCharactersForSeries = (seriesId: number) =>
  timelineRepository.getCharactersForSeries(seriesId);

export const getLocationsForSeries = (seriesId: number) =>
  timelineRepository.getLocationsForSeries(seriesId);

export const getEventById = (seriesId: number, eventId: string) =>
  timelineRepository.getEventById(seriesId, eventId);

export const getArcById = (seriesId: number, arcId: string) =>
  timelineRepository.getArcById(seriesId, arcId);

export const hasTimelineData = (seriesId: number) =>
  timelineRepository.hasTimelineData(seriesId);
