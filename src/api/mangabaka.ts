import type { Manga } from '../models/types';

const API_URL = 'https://api.mangabaka.org/v1';
const REQUEST_TIMEOUT = 10000;
const cache = new Map<number, { totalChapters: number | null; timestamp: number }>();
const inFlight = new Map<number, Promise<number | null>>();

async function fetchMangaBaka(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

type SearchItem = {
  title?: string | null;
  titles?: Array<string | { title?: string; name?: string }>;
  total_chapters?: number | string | null;
  chapters?: number | string | null;
};
type SearchResponse = { data?: SearchItem[]; results?: SearchItem[] };

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getTitles(item: SearchItem) {
  const extra = (item.titles ?? []).flatMap((value) =>
    typeof value === 'string' ? [value] : [value.title, value.name].filter((x): x is string => Boolean(x))
  );
  return [item.title, ...extra].filter((x): x is string => Boolean(x));
}

function score(query: string, item: SearchItem) {
  const q = normalize(query);
  const titles = getTitles(item).map(normalize);
  if (titles.includes(q)) return 0;
  if (titles.some((title) => title.startsWith(q))) return 1;
  if (titles.some((title) => title.includes(q))) return 2;
  return 3;
}

function chapterCount(item: SearchItem) {
  const raw = item.total_chapters ?? item.chapters;
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

export async function getChapterInfo(manga: Pick<Manga, 'id' | 'title' | 'synonyms'>) {
  const cached = cache.get(manga.id);
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) return cached.totalChapters;
  const existing = inFlight.get(manga.id);
  if (existing) return existing;

  const request = (async () => {
    const queries = [manga.title, ...manga.synonyms].filter(Boolean);
    for (const query of queries) {
      const searchQuery =
        typeof query === 'string'
          ? query
          : query.english || query.romaji || query.native || '';
      if (!searchQuery) continue;
      try {
        const params = new URLSearchParams({ q: searchQuery, limit: '10' });
        const response = await fetchMangaBaka(`${API_URL}/series/search?${params.toString()}`);
        if (!response.ok) continue;
        const json = (await response.json()) as SearchResponse;
        const items = json.data ?? json.results ?? [];
        const matches = [...items].sort((a, b) => score(searchQuery, a) - score(searchQuery, b));
        const best = matches.find((item) => chapterCount(item) !== undefined);
        const totalChapters = best ? chapterCount(best) ?? null : null;
        if (totalChapters !== null) {
          cache.set(manga.id, { totalChapters, timestamp: Date.now() });
          return totalChapters;
        }
      } catch {
        // Try the next known title.
      }
    }
    cache.set(manga.id, { totalChapters: null, timestamp: Date.now() });
    return null;
  })();

  inFlight.set(manga.id, request);
  try {
    return await request;
  } finally {
    inFlight.delete(manga.id);
  }
}