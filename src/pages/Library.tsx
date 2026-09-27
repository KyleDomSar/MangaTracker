import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid3X3, List, BookOpen, CheckCircle, Clock, AlertTriangle, Pause } from 'lucide-react';
import { useLibraryStore, getLibraryStatusColor, getLibraryStatusLabel } from '../store/stores';
import { Card, ProgressBar, EmptyState, EmptyIcons, Badge } from '../components/UI';
import type { LibraryStatus } from '../models/types';

type FilterTab = 'ALL' | LibraryStatus;

export default function LibraryPage() {
  const items = useLibraryStore((s) => s.items);
  const updateProgress = useLibraryStore((s) => s.updateProgress);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'added' | 'title' | 'progress'>('updated');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const filteredItems = useMemo(() => {
    let result = items;
    
    // Filter by status
    if (activeFilter !== 'ALL') {
      result = result.filter((item) => item.status === activeFilter);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(query));
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'updated':
          comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          break;
        case 'added':
          comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          const aProgress = a.totalChapters ? a.currentChapter / a.totalChapters : 0;
          const bProgress = b.totalChapters ? b.currentChapter / b.totalChapters : 0;
          comparison = bProgress - aProgress;
          break;
        default:
          comparison = 0;
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
    
    return result;
  }, [items, activeFilter, searchQuery, sortBy, sortDirection]);

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'ALL', label: 'All', icon: <BookOpen size={14} />, count: items.length },
    { id: 'READING', label: 'Reading', icon: <BookOpen size={14} />, count: items.filter((i) => i.status === 'READING').length },
    { id: 'PLAN_TO_READ', label: 'Plan to Read', icon: <Clock size={14} />, count: items.filter((i) => i.status === 'PLAN_TO_READ').length },
    { id: 'COMPLETED', label: 'Completed', icon: <CheckCircle size={14} />, count: items.filter((i) => i.status === 'COMPLETED').length },
    { id: 'DROPPED', label: 'Dropped', icon: <AlertTriangle size={14} />, count: items.filter((i) => i.status === 'DROPPED').length },
    { id: 'PAUSED', label: 'Paused', icon: <Pause size={14} />, count: items.filter((i) => i.status === 'PAUSED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Library</h1>
          <p className="text-gray-500 text-sm">{items.length} manga in your collection</p>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-lg border border-gray-800/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your library..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-gray-800/50 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeFilter === tab.id
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                : 'text-gray-500 border-gray-800/50 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none"
        >
          <option value="updated">Last Updated</option>
          <option value="added">Date Added</option>
          <option value="title">Title</option>
          <option value="progress">Progress</option>
        </select>
        <button
          type="button"
          onClick={() => setSortDirection((current) => current === 'desc' ? 'asc' : 'desc')}
          className="px-2.5 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
          title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        >
          {sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        </button>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.library}
            title="Your library is empty"
            description="Start discovering manga to build your collection."
            action={
              <Link
                to="/discover"
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Discover Manga
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={EmptyIcons.search}
            title="No results"
            description="No manga match your current filters."
          />
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div key={item.mangaId} className="group">
              <Link to={`/manga/${item.mangaId}`} className="block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 mb-2">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getLibraryStatusColor(item.status)}`}>
                    {getLibraryStatusLabel(item.status)}
                  </div>
                  {item.totalChapters && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
                      <div
                        className="h-full bg-violet-500"
                        style={{ width: `${Math.min(100, (item.currentChapter / item.totalChapters) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-violet-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ch. {item.currentChapter}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
                </p>
              </Link>
              <button
                onClick={() => {
                  const next = item.currentChapter + 1;
                  if (item.totalChapters && next > item.totalChapters) return;
                  updateProgress(item.mangaId, next);
                }}
                className="mt-2 w-full px-2 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors"
              >
                Mark Next
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.mangaId}
              to={`/manga/${item.mangaId}`}
              className="block group"
            >
              <Card className="p-3 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.status === 'READING' ? 'info' : item.status === 'COMPLETED' ? 'success' : 'default'}>
                        {getLibraryStatusLabel(item.status)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Ch. {item.currentChapter}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
                      </span>
                    </div>
                    {item.totalChapters && (
                      <div className="mt-2">
                        <ProgressBar value={item.currentChapter} max={item.totalChapters} size="sm" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const next = item.currentChapter + 1;
                        if (item.totalChapters && next > item.totalChapters) return;
                        updateProgress(item.mangaId, next);
                      }}
                      className="mt-2 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors"
                    >
                      Mark Next Chapter
                    </button>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {item.lastReadDate
                        ? new Date(item.lastReadDate).toLocaleDateString()
                        : 'Never read'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Next: Ch. {item.nextChapter}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
