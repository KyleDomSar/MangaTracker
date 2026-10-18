import type { LibraryItem, ReadingProgress } from '../models/types';

// Pure chapter-progress transitions shared by the progress and library stores.
// Keeping them here (instead of inline in the zustand stores) gives the
// trickiest math in the app a single source of truth and unit-test coverage.

export function createProgress(mangaId: number, totalChapters: number | null): ReadingProgress {
  return {
    mangaId,
    currentChapter: 0,
    lastReadChapter: 0,
    nextChapter: 1,
    totalChapters,
    lastReadDate: null,
    chaptersRead: [],
  };
}

export function applyChapterRead(
  progress: ReadingProgress,
  chapter: number,
  nowIso: string
): ReadingProgress {
  // Reading a later chapter means the skipped chapters before it are also
  // treated as read for progress tracking.
  const chaptersRead = Array.from(
    new Set([
      ...progress.chaptersRead,
      ...Array.from({ length: Math.max(0, chapter) }, (_, index) => index + 1),
    ])
  ).sort((a, b) => a - b);
  // The furthest chapter stays the furthest, even when re-reading an
  // earlier one; "next" always continues from there.
  const maxRead = Math.max(progress.currentChapter, chapter);
  return {
    ...progress,
    currentChapter: maxRead,
    lastReadChapter: chapter,
    nextChapter: maxRead + 1,
    lastReadDate: nowIso,
    chaptersRead,
  };
}

export function applyChapterUnread(progress: ReadingProgress, chapter: number): ReadingProgress {
  const chaptersRead = progress.chaptersRead.filter((c) => c !== chapter);
  const maxRead = chaptersRead.length > 0 ? Math.max(...chaptersRead) : 0;
  return {
    ...progress,
    currentChapter: maxRead,
    lastReadChapter: chaptersRead.length > 0 ? chaptersRead[chaptersRead.length - 1] : 0,
    nextChapter: maxRead + 1,
    chaptersRead,
  };
}

// Decide which chapter total to keep when new metadata arrives.
// Never invent a total, and never erase a known one.
export function resolveTotalChapters(
  current: number | null,
  incoming: number | null
): number | null {
  if (incoming !== null && incoming !== current) return incoming;
  return current;
}

export function applyReadToLibraryItem(
  item: LibraryItem,
  chapter: number,
  nowIso: string
): LibraryItem {
  // Mirror applyChapterRead: re-reading an earlier chapter keeps the
  // furthest progress intact instead of moving it backwards.
  const maxRead = Math.max(item.currentChapter, chapter);
  const isComplete = item.totalChapters !== null && maxRead >= item.totalChapters;
  return {
    ...item,
    currentChapter: maxRead,
    lastReadChapter: chapter,
    nextChapter: maxRead + 1,
    lastUpdated: nowIso,
    lastReadDate: nowIso,
    status: isComplete ? 'COMPLETED' : item.status,
  };
}
