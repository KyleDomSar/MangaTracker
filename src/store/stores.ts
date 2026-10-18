import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LibraryItem, LibraryStatus, Activity, ActivityType, ReadingProgress, UserSettings } from '../models/types';
import {
  applyChapterRead,
  applyChapterUnread,
  applyReadToLibraryItem,
  createProgress,
  resolveTotalChapters,
} from './progressLogic';
import { useToastStore } from './toastStore';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Library Store
interface LibraryState {
  items: LibraryItem[];
  addItem: (item: Omit<LibraryItem, 'dateAdded' | 'lastUpdated'>) => void;
  removeItem: (mangaId: number) => void;
  updateStatus: (mangaId: number, status: LibraryStatus) => void;
  updateProgress: (mangaId: number, chapter: number) => void;
  syncProgress: (mangaId: number, progress: ReadingProgress) => void;
  updateTotalChapters: (mangaId: number, totalChapters: number) => void;
  getItem: (mangaId: number) => LibraryItem | undefined;
  isInLibrary: (mangaId: number) => boolean;
  clearLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const now = new Date().toISOString();
        const newItem: LibraryItem = {
          ...item,
          dateAdded: now,
          lastUpdated: now,
        };
        set((state) => ({
          items: [...state.items.filter((i) => i.mangaId !== item.mangaId), newItem],
        }));
        // Create activity
        useActivityStore.getState().addActivity({
          type: 'ADDED_TO_LIBRARY',
          mangaId: item.mangaId,
          mangaTitle: item.title,
          cover: item.cover,
          chapter: null,
          metadata: { status: item.status },
        });
        useToastStore.getState().pushToast('Added to library');
      },
      removeItem: (mangaId) => {
        set((state) => ({
          items: state.items.filter((i) => i.mangaId !== mangaId),
        }));
        useProgressStore.getState().removeProgress(mangaId);
        useToastStore.getState().pushToast('Removed from library');
      },
      updateStatus: (mangaId, status) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.mangaId === mangaId
              ? { ...i, status, lastUpdated: new Date().toISOString() }
              : i
          ),
        }));
        const item = get().items.find((i) => i.mangaId === mangaId);
        if (item) {
          useActivityStore.getState().addActivity({
            type: 'STATUS_CHANGED',
            mangaId,
            mangaTitle: item.title,
            cover: item.cover,
            chapter: null,
            metadata: { newStatus: status },
          });
        }
        useToastStore.getState().pushToast(`Moved to ${getLibraryStatusLabel(status)}`);
      },
      syncProgress: (mangaId, progress) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.mangaId === mangaId
              ? {
                  ...i,
                  currentChapter: progress.currentChapter,
                  lastReadChapter: progress.lastReadChapter,
                  nextChapter: progress.nextChapter,
                  lastReadDate: progress.lastReadDate,
                  totalChapters: progress.totalChapters,
                  lastUpdated: new Date().toISOString(),
                  status:
                    progress.totalChapters !== null && progress.currentChapter >= progress.totalChapters
                      ? 'COMPLETED'
                      : i.status === 'COMPLETED'
                        ? 'READING'
                        : i.status,
                }
              : i
          ),
        }));
      },
      updateTotalChapters: (mangaId, totalChapters) => {
        if (!Number.isFinite(totalChapters) || totalChapters <= 0) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.mangaId === mangaId && i.totalChapters !== totalChapters
              ? { ...i, totalChapters, lastUpdated: new Date().toISOString() }
              : i
          ),
        }));
      },
      updateProgress: (mangaId, chapter) => {
        const now = new Date().toISOString();
        const before = get().items.find((i) => i.mangaId === mangaId);
        set((state) => ({
          items: state.items.map((i) =>
            i.mangaId === mangaId ? applyReadToLibraryItem(i, chapter, now) : i
          ),
        }));
        const item = get().items.find((i) => i.mangaId === mangaId);
        if (item) {
          const wasComplete =
            before !== undefined &&
            before.totalChapters !== null &&
            before.currentChapter >= before.totalChapters;
          const isComplete =
            item.totalChapters !== null && item.currentChapter >= item.totalChapters;
          useActivityStore.getState().addActivity({
            type: isComplete && !wasComplete ? 'COMPLETED' : 'CHAPTER_READ',
            mangaId,
            mangaTitle: item.title,
            cover: item.cover,
            chapter,
          });
        }
        // Update progress store
        useProgressStore.getState().markChapterRead(mangaId, chapter);
        useToastStore.getState().pushToast('Progress updated');
      },
      getItem: (mangaId) => get().items.find((i) => i.mangaId === mangaId),
      isInLibrary: (mangaId) => get().items.some((i) => i.mangaId === mangaId),
      clearLibrary: () => {
        const mangaIds = get().items.map((item) => item.mangaId);
        set({ items: [] });
        const progressStore = useProgressStore.getState();
        mangaIds.forEach((mangaId) => progressStore.removeProgress(mangaId));
        useToastStore.getState().pushToast('Library cleared');
      },
    }),
    {
      name: 'manhwa-library',
    }
  )
);

// Activity Store
interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  getRecentActivities: (limit: number) => Activity[];
  getActivitiesByDate: () => Record<string, Activity[]>;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      addActivity: (activity) => {
        // Prevent duplicate activities within 2 seconds
        const recentActivity = get().activities[0];
        if (
          recentActivity &&
          recentActivity.type === activity.type &&
          recentActivity.mangaId === activity.mangaId &&
          recentActivity.chapter === activity.chapter &&
          Date.now() - new Date(recentActivity.timestamp).getTime() < 2000
        ) {
          return;
        }
        const newActivity: Activity = {
          ...activity,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 500),
        }));
      },
      clearActivities: () => {
        set({ activities: [] });
        useToastStore.getState().pushToast('Activity history cleared');
      },
      getRecentActivities: (limit) => get().activities.slice(0, limit),
      getActivitiesByDate: () => {
        const activities = get().activities;
        const grouped: Record<string, Activity[]> = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);

        activities.forEach((activity) => {
          const date = new Date(activity.timestamp);
          let group: string;
          if (date >= today) group = 'Today';
          else if (date >= yesterday) group = 'Yesterday';
          else if (date >= weekAgo) group = 'This Week';
          else group = 'Older';

          if (!grouped[group]) grouped[group] = [];
          grouped[group].push(activity);
        });
        return grouped;
      },
    }),
    {
      name: 'manhwa-activities',
    }
  )
);

// Progress Store
interface ProgressState {
  progress: Record<number, ReadingProgress>;
  markChapterRead: (mangaId: number, chapter: number) => void;
  markChapterUnread: (mangaId: number, chapter: number) => void;
  getProgress: (mangaId: number) => ReadingProgress | undefined;
  removeProgress: (mangaId: number) => void;
  initProgress: (mangaId: number, totalChapters: number | null) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      markChapterRead: (mangaId, chapter) => {
        set((state) => {
          const existing = state.progress[mangaId] ?? createProgress(mangaId, null);
          return {
            progress: {
              ...state.progress,
              [mangaId]: applyChapterRead(existing, chapter, new Date().toISOString()),
            },
          };
        });
      },
      markChapterUnread: (mangaId, chapter) => {
        set((state) => {
          const existing = state.progress[mangaId];
          if (!existing) return state;
          return {
            progress: {
              ...state.progress,
              [mangaId]: applyChapterUnread(existing, chapter),
            },
          };
        });
        useToastStore.getState().pushToast('Chapter marked unread');
      },
      getProgress: (mangaId) => get().progress[mangaId],
      removeProgress: (mangaId) => {
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[mangaId];
          return { progress: newProgress };
        });
      },
      initProgress: (mangaId, totalChapters) => {
        set((state) => {
          const existing = state.progress[mangaId];

          if (existing) {
            // AniList may learn or correct the chapter count later. Keep user
            // progress, but keep the metadata fresh when a real total arrives.
            const nextTotal = resolveTotalChapters(existing.totalChapters, totalChapters);
            if (nextTotal !== existing.totalChapters) {
              return {
                progress: {
                  ...state.progress,
                  [mangaId]: { ...existing, totalChapters: nextTotal },
                },
              };
            }
            return state;
          }

          return {
            progress: {
              ...state.progress,
              [mangaId]: createProgress(mangaId, totalChapters),
            },
          };
        });
      },
    }),
    {
      name: 'manhwa-progress',
    }
  )
);

// Settings Store
interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  clearCache: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: 'dark',
        defaultLibraryStatus: 'READING',
      },
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      clearCache: () => {
        // Only clear cache keys, not user data
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('cache-') || key.startsWith('anilist-'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        useToastStore.getState().pushToast('Cache cleared');
      },
    }),
    {
      name: 'manhwa-settings',
    }
  )
);

// Helper to get activity type label
export function getActivityLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    ADDED_TO_LIBRARY: 'Added to Library',
    STARTED_READING: 'Started Reading',
    CHAPTER_READ: 'Read Chapter',
    PROGRESS_UPDATED: 'Updated Progress',
    STATUS_CHANGED: 'Status Changed',
    COMPLETED: 'Completed',
  };
  return labels[type];
}

// Helper to get library status label
export function getLibraryStatusLabel(status: LibraryStatus): string {
  const labels: Record<LibraryStatus, string> = {
    READING: 'Reading',
    PLAN_TO_READ: 'Plan to Read',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
  };
  return labels[status];
}

// Helper to get library status color
export function getLibraryStatusColor(status: LibraryStatus): string {
  const colors: Record<LibraryStatus, string> = {
    READING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PLAN_TO_READ: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    DROPPED: 'bg-red-500/20 text-red-400 border-red-500/30',
    PAUSED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return colors[status];
}
