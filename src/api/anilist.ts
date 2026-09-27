import type { Manga, MangaStatus, CacheEntry } from '../models/types';

const ANILIST_API = 'https://graphql.anilist.co';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cache helper
function getCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(`cache-${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      return entry; // Return stale cache (will be refreshed)
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: CACHE_DURATION,
    };
    localStorage.setItem(`cache-${key}`, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable
  }
}

function isStale(entry: CacheEntry<unknown> | null): boolean {
  if (!entry) return true;
  return Date.now() - entry.timestamp > entry.expiresIn;
}

// GraphQL queries
const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $genre_in: [String], $status: MediaStatus, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: MANGA, search: $search, genre_in: $genre_in, status: $status, sort: $sort) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
        extraLarge
      }
      bannerImage
      description(asHtml: false)
      status
      genres
      averageScore
      format
      chapters
      volumes
      startDate { year month day }
      endDate { year month day }
      source
      synonyms
    }
  }
}
`;

const MANGA_DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: MANGA) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      medium
      extraLarge
    }
    bannerImage
    description(asHtml: false)
    status
    genres
    averageScore
    format
    chapters
    volumes
    startDate { year month day }
    endDate { year month day }
    source
    synonyms
    tags {
      name
      rank
    }
    relations {
      edges {
        node {
          id
          title { romaji english }
          coverImage { large medium }
          type
          relationType
        }
      }
    }
    characters(page: 1, perPage: 10) {
      nodes {
        id
        name { full }
        image { large medium }
      }
    }
  }
}
`;

const TRENDING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: MANGA, sort: TRENDING_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
        extraLarge
      }
      bannerImage
      description(asHtml: false)
      status
      genres
      averageScore
      format
      chapters
    }
  }
}
`;

const POPULAR_QUERY = `
query ($page: Int, $perPage: Int, $genre_in: [String]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: MANGA, sort: POPULARITY_DESC, genre_in: $genre_in) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
        extraLarge
      }
      bannerImage
      description(asHtml: false)
      status
      genres
      averageScore
      format
      chapters
    }
  }
}
`;

// Map AniList status to our type
function mapStatus(status: string | null): MangaStatus {
  const mapping: Record<string, MangaStatus> = {
    FINISHED: 'FINISHED',
    RELEASING: 'RELEASING',
    NOT_YET_RELEASED: 'NOT_YET_RELEASED',
    CANCELLED: 'CANCELLED',
    HIATUS: 'HIATUS',
  };
  return mapping[status || ''] || 'RELEASING';
}

// Map raw AniList media to our Manga type
function mapMediaToManga(media: Record<string, unknown>): Manga {
  const title = media.title as Record<string, string | null>;
  const coverImage = media.coverImage as Record<string, string>;
  const startDate = media.startDate as Record<string, number> | null;
  const endDate = media.endDate as Record<string, number> | null;

  return {
    id: media.id as number,
    title: {
      romaji: title?.romaji || 'Unknown',
      english: title?.english || null,
      native: title?.native || null,
    },
    coverImage: {
      large: coverImage?.large || '',
      medium: coverImage?.medium || '',
      extraLarge: coverImage?.extraLarge || coverImage?.large || '',
    },
    bannerImage: (media.bannerImage as string) || null,
    description: (media.description as string) || null,
    status: mapStatus(media.status as string),
    genres: (media.genres as string[]) || [],
    averageScore: (media.averageScore as number) || null,
    format: (media.format as string) || null,
    chapters: (media.chapters as number) || null,
    volumes: (media.volumes as number) || null,
    startDate: startDate?.year ? startDate as { year: number; month: number; day: number } : null,
    endDate: endDate?.year ? endDate as { year: number; month: number; day: number } : null,
    source: (media.source as string) || null,
    synonyms: (media.synonyms as string[]) || [],
  };
}

// API client
async function fetchGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AniList API Error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }
    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to connect to AniList API');
  }
}

// Public API functions
export interface SearchResult {
  manga: Manga[];
  pageInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

export async function searchManga(
  search: string,
  page: number = 1,
  perPage: number = 20,
  genres: string[] = [],
  status: string = '',
  sort: string = 'SEARCH_MATCH'
): Promise<SearchResult> {
  const cacheKey = `search-${search}-${page}-${genres.join(',')}-${status}-${sort}`;
  const cached = getCache<SearchResult>(cacheKey);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sort],
  };
  if (search) variables.search = search;
  if (genres.length > 0) variables.genre_in = genres;
  if (status) variables.status = status;

  try {
    const data = await fetchGraphQL<{ Page: { pageInfo: SearchResult['pageInfo']; media: Record<string, unknown>[] } }>(
      SEARCH_QUERY,
      variables
    );
    const result: SearchResult = {
      pageInfo: data.Page.pageInfo,
      manga: data.Page.media.map(mapMediaToManga),
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (cached) return cached.data; // Return stale cache on error
    throw error;
  }
}

export async function getTrending(page: number = 1, perPage: number = 20): Promise<SearchResult> {
  const cacheKey = `trending-${page}`;
  const cached = getCache<SearchResult>(cacheKey);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  try {
    const data = await fetchGraphQL<{ Page: { pageInfo: SearchResult['pageInfo']; media: Record<string, unknown>[] } }>(
      TRENDING_QUERY,
      { page, perPage }
    );
    const result: SearchResult = {
      pageInfo: data.Page.pageInfo,
      manga: data.Page.media.map(mapMediaToManga),
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

export async function getPopular(page: number = 1, perPage: number = 20, genres: string[] = []): Promise<SearchResult> {
  const cacheKey = `popular-${page}-${genres.join(',')}`;
  const cached = getCache<SearchResult>(cacheKey);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  try {
    const variables: Record<string, unknown> = { page, perPage };
    if (genres.length > 0) variables.genre_in = genres;

    const data = await fetchGraphQL<{ Page: { pageInfo: SearchResult['pageInfo']; media: Record<string, unknown>[] } }>(
      POPULAR_QUERY,
      variables
    );
    const result: SearchResult = {
      pageInfo: data.Page.pageInfo,
      manga: data.Page.media.map(mapMediaToManga),
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

export interface MangaDetail extends Manga {
  tags: { name: string; rank: number }[];
  relations: {
    id: number;
    title: { romaji: string; english: string | null };
    coverImage: { large: string; medium: string };
    type: string;
    relationType: string;
  }[];
  characters: {
    id: number;
    name: { full: string };
    image: { large: string; medium: string };
  }[];
}

export async function getMangaDetails(id: number): Promise<MangaDetail> {
  // Validate ID
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid manga ID');
  }

  const cacheKey = `manga-detail-${id}`;
  const cached = getCache<MangaDetail>(cacheKey);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  try {
    const data = await fetchGraphQL<{ Media: Record<string, unknown> }>(MANGA_DETAIL_QUERY, { id: Number(id) });
    const media = data.Media;
    const manga = mapMediaToManga(media);

    const tags = ((media.tags as Array<{ name: string; rank: number }>) || []).map((t) => ({
      name: t.name,
      rank: t.rank,
    }));

    const relations = ((media.relations as { edges: Array<{ node: Record<string, unknown>; relationType: string }> })?.edges || [])
      .filter((e) => e.node.type === 'MANGA')
      .map((e) => {
        const node = e.node;
        const title = node.title as Record<string, string | null>;
        const coverImage = node.coverImage as Record<string, string>;
        return {
          id: node.id as number,
          title: { romaji: title?.romaji || '', english: title?.english || null },
          coverImage: { large: coverImage?.large || '', medium: coverImage?.medium || '' },
          type: node.type as string,
          relationType: e.relationType,
        };
      });

    const characters = ((media.characters as { nodes: Array<Record<string, unknown>> })?.nodes || []).map((c) => ({
      id: c.id as number,
      name: { full: (c.name as Record<string, string>)?.full || '' },
      image: {
        large: (c.image as Record<string, string>)?.large || '',
        medium: (c.image as Record<string, string>)?.medium || '',
      },
    }));

    const result: MangaDetail = { ...manga, tags, relations, characters };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

// Available genres
export const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

export const SORT_OPTIONS = [
  { value: 'SEARCH_MATCH', label: 'Relevance' },
  { value: 'POPULARITY_DESC', label: 'Most Popular' },
  { value: 'SCORE_DESC', label: 'Highest Rated' },
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'START_DATE_DESC', label: 'Newest' },
  { value: 'CHAPTERS_DESC', label: 'Most Chapters' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'RELEASING', label: 'Releasing' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'NOT_YET_RELEASED', label: 'Not Yet Released' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'HIATUS', label: 'Hiatus' },
];
