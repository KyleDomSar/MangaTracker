import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LibraryItem, LibraryStatus, Activity, ActivityType, ReadingProgress, UserSettings } from '../models/types';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Library Store
interface LibraryState {
  items: LibraryItem[];
  addItem: (item: Omit<LibraryItem, 'dateAdded' | 'lastUpdated'>) => void;
  removeItem: (mangaId: number) => void;
  updateStatus: (mangaId: number, status: LibraryStatus) => void;
  updateProgress: (mangaId: number, chapter: number) => void;
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
      },
      removeItem: (mangaId) => {
        set((state) => ({
          items: state.items.filter((i) => i.mangaId !== mangaId),
        }));
        useProgressStore.getState().removeProgress(mangaId);
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
        set((state) => ({
          items: state.items.map((i) => {
            if (i.mangaId !== mangaId) return i;
            const isComplete = i.totalChapters !== null && chapter >= i.totalChapters;
            return {
              ...i,
              currentChapter: chapter,
              lastReadChapter: chapter,
              nextChapter: chapter + 1,
              lastUpdated: now,
              lastReadDate: now,
              status: isComplete ? 'COMPLETED' : i.status,
            };
          }),
        }));
        const item = get().items.find((i) => i.mangaId === mangaId);
        if (item) {
          const isComplete = item.totalChapters !== null && chapter >= (item.totalChapters || Infinity);
          useActivityStore.getState().addActivity({
            type: isComplete ? 'COMPLETED' : 'CHAPTER_READ',
            mangaId,
            mangaTitle: item.title,
            cover: item.cover,
            chapter,
          });
        }
        // Update progress store
        useProgressStore.getState().markChapterRead(mangaId, chapter);
      },
      getItem: (mangaId) => get().items.find((i) => i.mangaId === mangaId),
      isInLibrary: (mangaId) => get().items.some((i) => i.mangaId === mangaId),
      clearLibrary: () => {
        const mangaIds = get().items.map((item) => item.mangaId);
        set({ items: [] });
        const progressStore = useProgressStore.getState();
        mangaIds.forEach((mangaId) => progressStore.removeProgress(mangaId));
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
      clearActivities: () => set({ activities: [] }),
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
          const existing = state.progress[mangaId] || {
            mangaId,
            currentChapter: 0,
            lastReadChapter: 0,
            nextChapter: 1,
            totalChapters: null,
            lastReadDate: null,
            chaptersRead: [],
          };
          const chaptersRead = existing.chaptersRead.includes(chapter)
            ? existing.chaptersRead
            : [...existing.chaptersRead, chapter].sort((a, b) => a - b);
          return {
            progress: {
              ...state.progress,
              [mangaId]: {
                ...existing,
                currentChapter: Math.max(existing.currentChapter, chapter),
                lastReadChapter: chapter,
                nextChapter: chapter + 1,
                lastReadDate: new Date().toISOString(),
                chaptersRead,
              },
            },
          };
        });
      },
      markChapterUnread: (mangaId, chapter) => {
        set((state) => {
          const existing = state.progress[mangaId];
          if (!existing) return state;
          const chaptersRead = existing.chaptersRead.filter((c) => c !== chapter);
          const maxRead = chaptersRead.length > 0 ? Math.max(...chaptersRead) : 0;
          return {
            progress: {
              ...state.progress,
              [mangaId]: {
                ...existing,
                currentChapter: maxRead,
                lastReadChapter: chaptersRead.length > 0 ? chaptersRead[chaptersRead.length - 1] : 0,
                nextChapter: maxRead + 1,
                chaptersRead,
              },
            },
          };
        });
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
            // AniList may learn the chapter count later. Keep user progress,
            // but update the metadata when a real total becomes available.
            if (existing.totalChapters === null && totalChapters !== null) {
              return {
                progress: {
                  ...state.progress,
                  [mangaId]: { ...existing, totalChapters },
                },
              };
            }
            return state;
          }

          return {
            progress: {
              ...state.progress,
              [mangaId]: {
                mangaId,
                currentChapter: 0,
                lastReadChapter: 0,
                nextChapter: 1,
                totalChapters,
                lastReadDate: null,
                chaptersRead: [],
              },
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
        spoilerProtection: true,
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
