import type { Arc, StoryEvent, Character, Location } from '../models/types';
import type { SeriesTimeline } from '../models/types';

/**
 * Timeline model types and compatibility helpers.
 *
 * Published story timelines are loaded from Supabase. The local timeline
 * dataset is intentionally empty and is not used as a content source.
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

const emptyTimelineRepository: TimelineRepository = {
  getTimelineForSeries: () => null,
  getSeriesWithTimelines: () => [],
  getEventsForSeries: () => [],
  getArcsForSeries: () => [],
  getCharactersForSeries: () => [],
  getLocationsForSeries: () => [],
  getEventById: () => null,
  getArcById: () => null,
  hasTimelineData: () => false,
};

export const timelineRepository = emptyTimelineRepository;

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
