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
  }
}
`;

const MANGA_DETAIL_EXTENDED_QUERY = `
query ($id: Int) {
  Media(id: $id, type: MANGA) {
    tags {
      name
      rank
    }
    relations {
      edges {
        relationType
        node {
          id
          title { romaji english }
          coverImage { large medium }
          type
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
    recommendations(perPage: 10) {
      nodes {
        mediaRecommendation {
          id
          title { romaji english }
          coverImage { large medium }
          type
          genres
          averageScore
        }
      }
    }
    staff(perPage: 20) {
      edges {
        role
        node {
          name { full }
        }
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

function cleanDescription(value: string | null | undefined): string | null {
  if (!value) return null;

  return value
    .replace(/<br\\s*\\/?>(?:\\r?\\n)?/gi, '\\n')
    .replace(/<\\/p\\s*>/gi, '\\n\\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
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
    description: cleanDescription(media.description as string | null | undefined),
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
      throw new Error(`API error: ${response.status}${errorText ? ` - ${errorText.slice(0, 300)}` : ` - ${response.statusText}`}`);
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
  const cacheKey = `search-${search}-${page}-${perPage}-${genres.join(',')}-${status}-${sort}`;
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
  const cacheKey = `trending-${page}-${perPage}`;
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
  const cacheKey = `popular-${page}-${perPage}-${genres.join(',')}`;
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
  recommended: {
    id: number;
    title: { romaji: string; english: string | null };
    coverImage: { large: string; medium: string };
    type: string;
    genres: string[];
    averageScore: number | null;
  }[];
  authors: string[];
  artists: string[];
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
    // Load the core media record first. Optional relations/characters should
    // never prevent the main Manga Details page from loading.
    const data = await fetchGraphQL<{ Media: Record<string, unknown> }>(
      MANGA_DETAIL_QUERY,
      { id: Number(id) }
    );

    const media = data.Media;
    const manga = mapMediaToManga(media);

    let tags: MangaDetail['tags'] = [];
    let relations: MangaDetail['relations'] = [];
    let characters: MangaDetail['characters'] = [];
    let recommended: MangaDetail['recommended'] = [];
    let authors: string[] = [];
    let artists: string[] = [];

    try {
      const extended = await fetchGraphQL<{
        Media: {
          tags?: Array<{ name: string; rank: number }>;
          relations?: {
            edges: Array<{
              node: Record<string, unknown>;
              relationType: string;
            }>;
          };
          characters?: {
            nodes: Array<Record<string, unknown>>;
          };
          recommendations?: {
            nodes: Array<{
              mediaRecommendation?: Record<string, unknown> | null;
            }>;
          };
          staff?: {
            edges: Array<{
              role: string | null;
              node?: { name?: { full?: string | null } };
            }>;
          };
        };
      }>(MANGA_DETAIL_EXTENDED_QUERY, { id: Number(id) });

      const extendedMedia = extended.Media;

      tags = (extendedMedia.tags || []).map((t) => ({
        name: t.name,
        rank: t.rank,
      }));

      relations = (extendedMedia.relations?.edges || [])
        .filter((e) => e.node.type === 'MANGA')
        .map((e) => {
          const node = e.node;
          const title = node.title as Record<string, string | null>;
          const coverImage = node.coverImage as Record<string, string>;

          return {
            id: node.id as number,
            title: {
              romaji: title?.romaji || '',
              english: title?.english || null,
            },
            coverImage: {
              large: coverImage?.large || '',
              medium: coverImage?.medium || '',
            },
            type: node.type as string,
            relationType: e.relationType,
          };
        });

      characters = (extendedMedia.characters?.nodes || []).map((character) => ({
        id: character.id as number,
        name: {
          full: (character.name as Record<string, string>)?.full || '',
        },
        image: {
          large: (character.image as Record<string, string>)?.large || '',
          medium: (character.image as Record<string, string>)?.medium || '',
        },
      }));

      recommended = (extendedMedia.recommendations?.nodes || [])
        .map((edge) => edge.mediaRecommendation)
        .filter((node): node is Record<string, unknown> => Boolean(node && node.type === 'MANGA'))
        .map((node) => {
          const title = node.title as Record<string, string | null>;
          const coverImage = node.coverImage as Record<string, string>;
          return {
            id: node.id as number,
            title: {
              romaji: title?.romaji || '',
              english: title?.english || null,
            },
            coverImage: {
              large: coverImage?.large || '',
              medium: coverImage?.medium || '',
            },
            type: node.type as string,
            genres: (node.genres as string[]) || [],
            averageScore: (node.averageScore as number) || null,
          };
        });

      const staff = extendedMedia.staff?.edges || [];
      authors = [...new Set(
        staff
          .filter((edge) => /story|author|original creator/i.test(edge.role || ''))
          .map((edge) => edge.node?.name?.full)
          .filter((name): name is string => Boolean(name))
      )];
      artists = [...new Set(
        staff
          .filter((edge) => /art|artist|illustrat/i.test(edge.role || ''))
          .map((edge) => edge.node?.name?.full)
          .filter((name): name is string => Boolean(name))
      )];
    } catch (extendedError) {
      // Extended AniList fields are optional. Keep the core manga page usable
      // even if AniList rejects or temporarily fails this secondary query.
      console.warn('AniList extended manga data unavailable:', extendedError);
    }

    const result: MangaDetail = {
      ...manga,
      tags,
      relations,
      characters,
      recommended,
      authors,
      artists,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

export async function getLatest(page: number = 1, perPage: number = 20, genres: string[] = []): Promise<SearchResult> {
  return searchManga('', page, perPage, genres, '', 'UPDATED_AT_DESC');
}

export async function getOngoing(page: number = 1, perPage: number = 20, genres: string[] = []): Promise<SearchResult> {
  return searchManga('', page, perPage, genres, 'RELEASING', 'POPULARITY_DESC');
}

export async function getCompleted(page: number = 1, perPage: number = 20, genres: string[] = []): Promise<SearchResult> {
  return searchManga('', page, perPage, genres, 'FINISHED', 'POPULARITY_DESC');
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
