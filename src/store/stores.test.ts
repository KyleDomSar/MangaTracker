import { beforeEach, describe, expect, it, vi } from 'vitest';

// Zustand's persist middleware touches localStorage while the store module
// initializes, so the stub has to exist before the dynamic import below.
const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, String(value));
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => memory.clear(),
  key: (index: number) => Array.from(memory.keys())[index] ?? null,
  get length() {
    return memory.size;
  },
});

const { useActivityStore, useLibraryStore, useProgressStore } = await import('./stores');

const mangaId = 501;

function seedLibraryItem(totalChapters: number | null) {
  useLibraryStore.getState().addItem({
    mangaId,
    title: 'Test Manga',
    cover: 'cover.jpg',
    status: 'READING',
    currentChapter: 0,
    lastReadChapter: 0,
    nextChapter: 1,
    totalChapters,
    lastReadDate: null,
  });
}

beforeEach(() => {
  useLibraryStore.setState({ items: [] });
  useProgressStore.setState({ progress: {} });
  useActivityStore.setState({ activities: [] });
});

describe('progress store integration', () => {
  it('keeps the furthest chapter when re-reading an earlier one', () => {
    seedLibraryItem(12);

    useLibraryStore.getState().updateProgress(mangaId, 10);
    useLibraryStore.getState().updateProgress(mangaId, 9);

    const item = useLibraryStore.getState().getItem(mangaId);
    expect(item?.currentChapter).toBe(10);
    expect(item?.nextChapter).toBe(11);
    expect(item?.lastReadChapter).toBe(9);

    const progress = useProgressStore.getState().progress[mangaId];
    expect(progress.currentChapter).toBe(10);
    expect(progress.nextChapter).toBe(11);
    expect(progress.lastReadChapter).toBe(9);
  });

  it('emits COMPLETED only when the final chapter is newly reached', () => {
    seedLibraryItem(12);

    useLibraryStore.getState().updateProgress(mangaId, 12);
    expect(useActivityStore.getState().activities[0].type).toBe('COMPLETED');

    useLibraryStore.getState().updateProgress(mangaId, 12);
    const activities = useActivityStore.getState().activities;
    expect(activities[0].type).toBe('CHAPTER_READ');
    expect(activities.filter((activity) => activity.type === 'COMPLETED')).toHaveLength(1);
  });

  it('recomputes progress when a chapter is unmarked', () => {
    seedLibraryItem(12);

    useLibraryStore.getState().updateProgress(mangaId, 3);
    useProgressStore.getState().markChapterUnread(mangaId, 3);

    const progress = useProgressStore.getState().progress[mangaId];
    expect(progress.currentChapter).toBe(2);
    expect(progress.nextChapter).toBe(3);
    expect(progress.lastReadChapter).toBe(2);
    expect(progress.chaptersRead).toEqual([1, 2]);
  });

  it('refreshes the total when a new count arrives and keeps it otherwise', () => {
    useProgressStore.getState().initProgress(mangaId, 50);
    expect(useProgressStore.getState().progress[mangaId].totalChapters).toBe(50);

    useProgressStore.getState().initProgress(mangaId, 120);
    expect(useProgressStore.getState().progress[mangaId].totalChapters).toBe(120);

    useProgressStore.getState().initProgress(mangaId, null);
    expect(useProgressStore.getState().progress[mangaId].totalChapters).toBe(120);
  });

  it('does not erase a known library total when syncing progress', () => {
    seedLibraryItem(null);
    useLibraryStore.getState().updateTotalChapters(mangaId, 120);
    useProgressStore.getState().initProgress(mangaId, null);

    const progress = useProgressStore.getState().progress[mangaId];
    useLibraryStore.getState().syncProgress(mangaId, progress);

    expect(useLibraryStore.getState().getItem(mangaId)?.totalChapters).toBe(120);
  });
});
