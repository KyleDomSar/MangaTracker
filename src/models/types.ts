// Core Types for ManhwaTimeline

export type MangaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type LibraryStatus = 'READING' | 'PLAN_TO_READ' | 'COMPLETED' | 'DROPPED' | 'PAUSED';
export type ActivityType = 'ADDED_TO_LIBRARY' | 'STARTED_READING' | 'CHAPTER_READ' | 'PROGRESS_UPDATED' | 'STATUS_CHANGED' | 'COMPLETED';
export interface Manga {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string;
    medium: string;
    extraLarge?: string;
  };
  bannerImage: string | null;
  description: string | null;
  status: MangaStatus;
  genres: string[];
  averageScore: number | null;
  format: string | null;
  chapters: number | null;
  volumes: number | null;
  startDate: { year: number; month: number; day: number } | null;
  endDate: { year: number; month: number; day: number } | null;
  source: string | null;
  synonyms: string[];
}

export interface LibraryItem {
  mangaId: number;
  title: string;
  cover: string;
  status: LibraryStatus;
  currentChapter: number;
  lastReadChapter: number;
  nextChapter: number;
  totalChapters: number | null;
  dateAdded: string;
  lastUpdated: string;
  lastReadDate: string | null;
}

export interface Activity {
  id: string;
  type: ActivityType;
  mangaId: number;
  mangaTitle: string;
  cover: string;
  chapter: number | null;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface ReadingProgress {
  mangaId: number;
  currentChapter: number;
  lastReadChapter: number;
  nextChapter: number;
  totalChapters: number | null;
  lastReadDate: string | null;
  chaptersRead: number[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export interface DiscoverFilters {
  search: string;
  genres: string[];
  status: MangaStatus | '';
  sort: string;
  page: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  defaultLibraryStatus: LibraryStatus;
}

