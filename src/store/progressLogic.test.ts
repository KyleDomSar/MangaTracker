import { describe, expect, it } from 'vitest';
import {
  applyChapterRead,
  applyChapterUnread,
  applyReadToLibraryItem,
  createProgress,
  resolveTotalChapters,
} from './progressLogic';
import type { LibraryItem } from '../models/types';

const NOW = '2026-10-18T12:00:00.000Z';

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function progressWith(chaptersRead: number[]) {
  const current = chaptersRead.length > 0 ? Math.max(...chaptersRead) : 0;
  return {
    ...createProgress(1, null),
    chaptersRead,
    currentChapter: current,
    lastReadChapter: current,
    nextChapter: current + 1,
  };
}

function libraryItem(overrides: Partial<LibraryItem>): LibraryItem {
  return {
    mangaId: 1,
    title: 'Test Manga',
    cover: '',
    status: 'READING',
    currentChapter: 0,
    lastReadChapter: 0,
    nextChapter: 1,
    totalChapters: null,
    dateAdded: NOW,
    lastUpdated: NOW,
    lastReadDate: null,
    ...overrides,
  };
}

describe('applyChapterRead', () => {
  it('marks skipped chapters as read and advances a fresh series', () => {
    const result = applyChapterRead(createProgress(1, null), 5, NOW);

    expect(result.chaptersRead).toEqual([1, 2, 3, 4, 5]);
    expect(result.currentChapter).toBe(5);
    expect(result.nextChapter).toBe(6);
    expect(result.lastReadChapter).toBe(5);
    expect(result.lastReadDate).toBe(NOW);
  });

  it('keeps the furthest chapter and next chapter when re-reading an earlier one', () => {
    const result = applyChapterRead(progressWith(range(1, 9)), 5, NOW);

    expect(result.currentChapter).toBe(9);
    expect(result.nextChapter).toBe(10);
    expect(result.lastReadChapter).toBe(5);
  });
});

describe('applyChapterUnread', () => {
  it('recomputes progress when unmarking the furthest chapter', () => {
    const result = applyChapterUnread(progressWith(range(1, 9)), 9);

    expect(result.chaptersRead).toEqual(range(1, 8));
    expect(result.currentChapter).toBe(8);
    expect(result.nextChapter).toBe(9);
    expect(result.lastReadChapter).toBe(8);
  });

  it('keeps the furthest chapter when unmarking a middle chapter', () => {
    const result = applyChapterUnread(progressWith(range(1, 9)), 5);

    expect(result.chaptersRead).toEqual([1, 2, 3, 4, 6, 7, 8, 9]);
    expect(result.currentChapter).toBe(9);
    expect(result.nextChapter).toBe(10);
  });

  it('resets to zero when the only read chapter is unmarked', () => {
    const result = applyChapterUnread(progressWith([1]), 1);

    expect(result.chaptersRead).toEqual([]);
    expect(result.currentChapter).toBe(0);
    expect(result.nextChapter).toBe(1);
    expect(result.lastReadChapter).toBe(0);
  });
});

describe('applyReadToLibraryItem', () => {
  it('advances current and next chapter for a fresh item', () => {
    const result = applyReadToLibraryItem(libraryItem({}), 3, NOW);

    expect(result.currentChapter).toBe(3);
    expect(result.nextChapter).toBe(4);
    expect(result.lastReadChapter).toBe(3);
    expect(result.lastReadDate).toBe(NOW);
    expect(result.lastUpdated).toBe(NOW);
  });

  it('keeps the furthest chapter when re-reading an earlier one', () => {
    const item = libraryItem({ currentChapter: 9, lastReadChapter: 9, nextChapter: 10, totalChapters: 10 });
    const result = applyReadToLibraryItem(item, 5, NOW);

    expect(result.currentChapter).toBe(9);
    expect(result.nextChapter).toBe(10);
    expect(result.lastReadChapter).toBe(5);
  });

  it('marks the item completed when the known total is reached', () => {
    const item = libraryItem({ currentChapter: 9, nextChapter: 10, totalChapters: 10 });
    const result = applyReadToLibraryItem(item, 10, NOW);

    expect(result.currentChapter).toBe(10);
    expect(result.status).toBe('COMPLETED');
  });

  it('does not change status when the total is unknown', () => {
    const item = libraryItem({ totalChapters: null });
    const result = applyReadToLibraryItem(item, 42, NOW);

    expect(result.currentChapter).toBe(42);
    expect(result.status).toBe('READING');
  });
});

describe('resolveTotalChapters', () => {
  it('accepts a newly learned total', () => {
    expect(resolveTotalChapters(null, 50)).toBe(50);
  });

  it('keeps the existing total when nothing new is known', () => {
    expect(resolveTotalChapters(50, null)).toBe(50);
  });

  it('refreshes the total when a new count arrives', () => {
    expect(resolveTotalChapters(50, 120)).toBe(120);
  });

  it('keeps the total when it has not changed', () => {
    expect(resolveTotalChapters(50, 50)).toBe(50);
  });
});
