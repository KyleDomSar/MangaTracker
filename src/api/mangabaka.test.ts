import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChapterInfo } from './mangabaka';
import type { Manga } from '../models/types';

type ChapterInfoInput = Pick<Manga, 'id' | 'title' | 'synonyms'>;

function mangaWith(id: number, overrides: Partial<ChapterInfoInput> = {}): ChapterInfoInput {
  return {
    id,
    title: { romaji: 'Test Manga', english: 'Test Manga', native: null },
    synonyms: [],
    ...overrides,
  };
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('getChapterInfo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries after a fully failed lookup instead of caching a negative result', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    vi.stubGlobal('fetch', fetchMock);
    const manga = mangaWith(101);

    await expect(getChapterInfo(manga)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await expect(getChapterInfo(manga)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caches a negative result when a search completes without a match', async () => {
    const fetchMock = vi.fn(async () => okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const manga = mangaWith(102);

    await expect(getChapterInfo(manga)).resolves.toBeNull();
    await expect(getChapterInfo(manga)).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache a negative result when the server errors out', async () => {
    const fetchMock = vi.fn(async () => new Response('boom', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    const manga = mangaWith(103);

    await expect(getChapterInfo(manga)).resolves.toBeNull();
    await expect(getChapterInfo(manga)).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caches a found chapter count', async () => {
    const fetchMock = vi.fn(async () =>
      okResponse({ data: [{ title: 'Test Manga', total_chapters: 120 }] })
    );
    vi.stubGlobal('fetch', fetchMock);
    const manga = mangaWith(104);

    await expect(getChapterInfo(manga)).resolves.toBe(120);
    await expect(getChapterInfo(manga)).resolves.toBe(120);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the next known title when one request fails', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => {
        throw new TypeError('Failed to fetch');
      })
      .mockImplementation(async () => okResponse({ data: [{ title: 'Second Query', total_chapters: 5 }] }));
    vi.stubGlobal('fetch', fetchMock);
    const manga = mangaWith(105, {
      title: { romaji: 'First Query', english: 'First Query', native: null },
      synonyms: ['Second Query'],
    });

    await expect(getChapterInfo(manga)).resolves.toBe(5);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
