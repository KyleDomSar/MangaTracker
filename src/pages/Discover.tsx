import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { searchManga, getPopular, getTrending, getLatest, getOngoing, getCompleted, AVAILABLE_GENRES, SORT_OPTIONS, STATUS_OPTIONS } from '../api/anilist';
import MangaCard, { MangaCardSkeleton } from '../components/MangaCard';
import { Card, EmptyState, EmptyIcons, ErrorState } from '../components/UI';
import type { Manga } from '../models/types';

type Tab = 'popular' | 'latest' | 'ongoing' | 'completed' | 'search';

export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>('popular');
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState('POPULARITY_DESC');
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        setActiveTab('search');
        setPage(1);
      }
    }, 500);
  }, []);

  // Load data
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (activeTab === 'search' && searchQuery.trim()) {
          result = await searchManga(searchQuery, page, 24, selectedGenres, selectedStatus, selectedSort);
        } else if (activeTab === 'latest') {
          result = await getLatest(page, 24, selectedGenres, selectedStatus, selectedSort);
        } else if (activeTab === 'ongoing') {
          result = await getOngoing(page, 24, selectedGenres, selectedStatus, selectedSort);
        } else if (activeTab === 'completed') {
          result = await getCompleted(page, 24, selectedGenres, selectedStatus, selectedSort);
        } else if (activeTab === 'popular') {
          result = await getPopular(page, 24, selectedGenres, selectedStatus, selectedSort);
        } else {
          result = await getTrending(page, 24);
        }

        if (requestId !== requestIdRef.current) return;

        setManga(result.manga);
        setTotalPages(result.pageInfo.lastPage);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load manga');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadData();
  }, [activeTab, page, searchQuery, selectedGenres, selectedStatus, selectedSort]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
    if (!value.trim()) {
      setManga([]);
      setActiveTab('popular');
      setPage(1);
    }
  };

  const handleTabChange = (tab: Tab) => {
    const tabDefaults: Record<Tab, { status: string; sort: string }> = {
      popular: { status: '', sort: 'POPULARITY_DESC' },
      latest: { status: '', sort: 'UPDATED_AT_DESC' },
      ongoing: { status: 'RELEASING', sort: 'POPULARITY_DESC' },
      completed: { status: 'FINISHED', sort: 'POPULARITY_DESC' },
      search: { status: selectedStatus, sort: selectedSort },
    };

    const defaults = tabDefaults[tab];

    setManga([]);
    setActiveTab(tab);
    setSelectedStatus(defaults.status);
    setSelectedSort(defaults.sort);
    setPage(1);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setPage(1);
  };

  const clearFilters = () => {
    const tabDefaults: Record<Tab, { status: string; sort: string }> = {
      popular: { status: '', sort: 'POPULARITY_DESC' },
      latest: { status: '', sort: 'UPDATED_AT_DESC' },
      ongoing: { status: 'RELEASING', sort: 'POPULARITY_DESC' },
      completed: { status: 'FINISHED', sort: 'POPULARITY_DESC' },
      search: { status: '', sort: 'SEARCH_MATCH' },
    };

    const defaults = tabDefaults[activeTab];

    setSelectedGenres([]);
    setSelectedStatus(defaults.status);
    setSelectedSort(defaults.sort);
    setPage(1);
  };

  const tabs = [
    { id: 'popular' as Tab, label: 'Popular' },
    { id: 'latest' as Tab, label: 'Latest' },
    { id: 'ongoing' as Tab, label: 'Ongoing' },
    { id: 'completed' as Tab, label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Discover</h1>
        <p className="text-gray-500 text-sm">Find your next favorite manga or manhwa</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search manga, manhwa, manhua..."
          className="w-full pl-11 pr-10 py-3 bg-[#1a1a24] border border-gray-800/50 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setActiveTab('popular'); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Tabs & Filter Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex w-max min-w-full gap-1 bg-[#1a1a24] p-1 rounded-xl border border-gray-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {activeTab === 'search' && (
            <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 bg-violet-500/20 text-violet-400">
              Search
            </button>
          )}
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            showFilters || selectedGenres.length > 0 || selectedStatus
              ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
              : 'text-gray-500 border-gray-800/50 hover:text-gray-300'
          }`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          {(selectedGenres.length > 0 || selectedStatus) && (
            <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
              {selectedGenres.length + (selectedStatus ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          {/* Genres */}
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Genres</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
              {AVAILABLE_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    selectedGenres.includes(genre)
                      ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Sort */}
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Status</p>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-violet-500/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Sort By</p>
              <select
                value={selectedSort}
                onChange={(e) => { setSelectedSort(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-violet-500/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {(selectedGenres.length > 0 || selectedStatus) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      {error ? (
        <ErrorState message={error} onRetry={() => setPage(page)} />
      ) : loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {Array.from({ length: 12 }).map((_, i) => (
            <MangaCardSkeleton key={i} size="lg" />
          ))}
        </div>
      ) : manga.length === 0 ? (
        <EmptyState
          icon={EmptyIcons.search}
          title="No manga found"
          description={searchQuery ? `No results for "${searchQuery}". Try different keywords.` : 'Try adjusting your filters.'}
        />
      ) : (
        <>
          {/* Grid display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {manga.map((m) => (
              <MangaCard key={m.id} manga={m} size="lg" fullWidth />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-400 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
