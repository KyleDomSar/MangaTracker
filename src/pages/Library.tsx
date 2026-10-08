import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid3X3, List, BookOpen, CheckCircle, Clock, AlertTriangle, Pause, ChevronDown, Trash2, CheckSquare, X } from 'lucide-react';
import { useLibraryStore, getLibraryStatusLabel } from '../store/stores';
import { Card, ProgressBar, EmptyState, EmptyIcons, Badge } from '../components/UI';
import type { LibraryStatus } from '../models/types';

function getLibraryBadgeClass(status: LibraryStatus) {
  const classes: Record<LibraryStatus, string> = {
    READING: 'bg-[#0a0a0f]/90 text-blue-300 border-blue-400/50',
    COMPLETED: 'bg-[#0a0a0f]/90 text-green-300 border-green-400/50',
    PLAN_TO_READ: 'bg-[#0a0a0f]/90 text-purple-300 border-purple-400/50',
    DROPPED: 'bg-[#0a0a0f]/90 text-red-300 border-red-400/50',
    PAUSED: 'bg-[#0a0a0f]/90 text-yellow-300 border-yellow-400/50',
  };

  return classes[status];
}


type FilterTab = 'ALL' | LibraryStatus;

export default function LibraryPage() {
  const items = useLibraryStore((s) => s.items);
  const updateProgress = useLibraryStore((s) => s.updateProgress);
  const updateStatus = useLibraryStore((s) => s.updateStatus);
  const removeItem = useLibraryStore((s) => s.removeItem);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'added' | 'title' | 'progress'>('updated');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [openStatusMenu, setOpenStatusMenu] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmBulkRemove, setConfirmBulkRemove] = useState(false);
  const [openBulkStatusMenu, setOpenBulkStatusMenu] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    setOpenStatusMenu(null);
    setConfirmBulkRemove(false);
    setOpenBulkStatusMenu(false);
  }, [activeFilter, searchQuery, viewMode]);

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

  const visibleIds = filteredItems.map((item) => item.mangaId);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelected = (mangaId: number) => {
    setSelectedIds((current) =>
      current.includes(mangaId)
        ? current.filter((id) => id !== mangaId)
        : [...current, mangaId]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const handleBulkStatus = (status: LibraryStatus) => {
    selectedIds.forEach((mangaId) => updateStatus(mangaId, status));
    setSelectedIds([]);
  };

  const handleBulkRemove = () => {
    selectedIds.forEach((mangaId) => removeItem(mangaId));
    setSelectedIds([]);
    setConfirmBulkRemove(false);
  };

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
          <p className="text-gray-400 text-sm">{items.length} manga in your collection</p>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-lg border border-gray-800/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-gray-200'}`}
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
                : 'text-gray-400 border-gray-800/50 hover:text-gray-200'
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
        <span className="text-xs text-gray-400">Sort by:</span>
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckSquare size={16} className="text-violet-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">
                {selectedIds.length} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="px-3 py-1.5 bg-gray-800/70 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
              >
                {allVisibleSelected ? 'Deselect Visible' : 'Select Visible'}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenBulkStatusMenu((current) => !current)}
                  className="flex items-center justify-between gap-2 min-w-[145px] px-3 py-1.5 bg-gray-800/70 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={openBulkStatusMenu}
                >
                  <span>Change status</span>
                  <ChevronDown
                    size={13}
                    className={`text-gray-400 transition-transform ${openBulkStatusMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {openBulkStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 z-40 min-w-[145px] overflow-hidden rounded-lg border border-gray-700/70 bg-[#1a1a24] shadow-xl">
                    {(['READING', 'PLAN_TO_READ', 'COMPLETED', 'DROPPED', 'PAUSED'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          handleBulkStatus(status);
                          setOpenBulkStatusMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        {getLibraryStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setConfirmBulkRemove(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={13} />
                Remove
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1.5 text-gray-500 hover:text-white transition-colors"
                aria-label="Clear selection"
                title="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      {confirmBulkRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove selected manga?</h3>
                <p className="text-xs text-gray-400">
                  This will remove {selectedIds.length} {selectedIds.length === 1 ? 'title' : 'titles'} and their saved progress.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmBulkRemove(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkRemove}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </Card>
        </div>
      )}

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
            <div key={item.mangaId} className="group relative">
              <button
                type="button"
                onClick={() => toggleSelected(item.mangaId)}
                className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                  selectedIds.includes(item.mangaId)
                    ? 'bg-violet-500 border-violet-400 text-white shadow-lg'
                    : 'bg-black/70 border-white/40 text-transparent hover:text-gray-300 hover:border-white/70'
                }`}
                aria-label={`${selectedIds.includes(item.mangaId) ? 'Deselect' : 'Select'} ${item.title}`}
                aria-pressed={selectedIds.includes(item.mangaId)}
              >
                <CheckCircle size={14} />
              </button>
              <Link to={`/manga/${item.mangaId}`} className="block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 mb-2">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full text-[10px] leading-none font-semibold border backdrop-blur-md shadow-lg whitespace-nowrap ${getLibraryBadgeClass(item.status)}`}
                  >
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
                <p className="text-xs text-gray-400 mt-0.5">
                  Ch. {item.currentChapter}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
                </p>
              </Link>
              <button
                onClick={() => {
                  const next = item.currentChapter + 1;
                  if (item.totalChapters && next > item.totalChapters) return;
                  updateProgress(item.mangaId, next);
                }}
                disabled={Boolean(item.totalChapters && item.currentChapter >= item.totalChapters)}
                className="mt-2 w-full px-2 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {item.totalChapters && item.currentChapter >= item.totalChapters ? 'Completed' : 'Mark Next'}
              </button>

              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setOpenStatusMenu((current) => current === item.mangaId ? null : item.mangaId)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={openStatusMenu === item.mangaId}
                  aria-label={`Change status for ${item.title}`}
                >
                  <span className="truncate">{getLibraryStatusLabel(item.status)}</span>
                  <ChevronDown
                    size={13}
                    className={`flex-shrink-0 text-gray-400 transition-transform ${openStatusMenu === item.mangaId ? 'rotate-180' : ''}`}
                  />
                </button>

                {openStatusMenu === item.mangaId && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 overflow-hidden rounded-lg border border-gray-700/70 bg-[#1a1a24] shadow-xl">
                    {(['READING', 'PLAN_TO_READ', 'COMPLETED', 'DROPPED', 'PAUSED'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          updateStatus(item.mangaId, status);
                          setOpenStatusMenu(null);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                          item.status === status
                            ? 'bg-violet-500/10 text-violet-300'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {getLibraryStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.mangaId} className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => toggleSelected(item.mangaId)}
                className={`w-9 flex-shrink-0 rounded-xl border flex items-center justify-center transition-all ${
                  selectedIds.includes(item.mangaId)
                    ? 'bg-violet-500/10 border-violet-500/40 text-violet-400'
                    : 'bg-gray-900/50 border-gray-700/60 text-gray-400 hover:text-white'
                }`}
                aria-label={`${selectedIds.includes(item.mangaId) ? 'Deselect' : 'Select'} ${item.title}`}
                aria-pressed={selectedIds.includes(item.mangaId)}
              >
                <CheckCircle size={15} />
              </button>
              <Card className="p-3 flex-1 min-w-0 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <Link to={`/manga/${item.mangaId}`} className="flex items-start gap-3 flex-1 min-w-0 group">
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
                      <span className="text-xs text-gray-400">
                        Ch. {item.currentChapter}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
                      </span>
                    </div>
                    {item.totalChapters && (
                      <div className="mt-2">
                        <ProgressBar value={item.currentChapter} max={item.totalChapters} size="sm" />
                      </div>
                    )}
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      const next = item.currentChapter + 1;
                      if (item.totalChapters && next > item.totalChapters) return;
                      updateProgress(item.mangaId, next);
                    }}
                    disabled={Boolean(item.totalChapters && item.currentChapter >= item.totalChapters)}
                    className="flex-shrink-0 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {item.totalChapters && item.currentChapter >= item.totalChapters ? 'Done' : 'Mark Next'}
                  </button>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {item.lastReadDate
                        ? new Date(item.lastReadDate).toLocaleDateString()
                        : 'Never read'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Next: Ch. {item.nextChapter}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
