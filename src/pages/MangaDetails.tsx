import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, CheckCircle, Plus, Trash2,
  ChevronRight, Users
} from 'lucide-react';
import { getMangaDetails } from '../api/anilist';
import { getChapterInfo } from '../api/mangabaka';
import type { MangaDetail } from '../api/anilist';
import { useLibraryStore, useProgressStore, useActivityStore, useSettingsStore, getLibraryStatusColor, getLibraryStatusLabel } from '../store/stores';
import { Card, ProgressBar, Badge, LoadingSpinner, ErrorState } from '../components/UI';
import type { LibraryStatus } from '../models/types';

function formatRelationType(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function MangaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mangaId = Number(id);

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [chapterTotal, setChapterTotal] = useState<number | null>(null);
  const [chapterSource, setChapterSource] = useState<string | null>(null);
  const [chapterLookupLoading, setChapterLookupLoading] = useState(false);
  const [chapterInput, setChapterInput] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const items = useLibraryStore((s) => s.items);
  const isInLibrary = items.some((i) => i.mangaId === mangaId);
  const libraryItem = items.find((i) => i.mangaId === mangaId);
  const addItem = useLibraryStore((s) => s.addItem);
  const removeItem = useLibraryStore((s) => s.removeItem);
  const updateTotalChapters = useLibraryStore((s) => s.updateTotalChapters);
  const updateStatus = useLibraryStore((s) => s.updateStatus);
  const updateProgress = useLibraryStore((s) => s.updateProgress);
  const syncLibraryProgress = useLibraryStore((s) => s.syncProgress);
  const allProgress = useProgressStore((s) => s.progress);
  const progress = allProgress[mangaId];
  const initProgress = useProgressStore((s) => s.initProgress);
  const markChapterRead = useProgressStore((s) => s.markChapterRead);
  const markChapterUnread = useProgressStore((s) => s.markChapterUnread);
  const addActivity = useActivityStore((s) => s.addActivity);
  const defaultLibraryStatus = useSettingsStore((s) => s.settings.defaultLibraryStatus);

  useEffect(() => {
    if (!manga) return;

    let cancelled = false;
    setChapterTotal(manga.chapters);
    setChapterSource(manga.chapters !== null ? 'AniList' : null);
    setChapterLookupLoading(true);

    getChapterInfo(manga)
      .then((total) => {
        if (cancelled) return;
        if (total !== null) {
          setChapterTotal(total);
          setChapterSource('MangaBaka');
        }
      })
      .catch(() => {
        // AniList data remains the fallback when MangaBaka is unavailable.
      })
      .finally(() => {
        if (!cancelled) setChapterLookupLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [manga]);

  useEffect(() => {
    if (!manga || !isInLibrary || chapterTotal === null) return;
    initProgress(manga.id, chapterTotal);
    updateTotalChapters(manga.id, chapterTotal);
  }, [manga, isInLibrary, chapterTotal, initProgress, updateTotalChapters]);

  useEffect(() => {
    if (!id || isNaN(mangaId) || mangaId <= 0) {
      setLoading(false);
      setError('Invalid manga ID');
      return;
    }

    async function loadManga() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMangaDetails(mangaId);
        setManga(data);
        if (useLibraryStore.getState().isInLibrary(mangaId)) {
          initProgress(mangaId, data.chapters);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load manga');
      } finally {
        setLoading(false);
      }
    }
    loadManga();
  }, [id, mangaId, initProgress, retryKey]);

  const handleAddToLibrary = (status: LibraryStatus = defaultLibraryStatus) => {
    if (!manga) return;
    addItem({
      mangaId: manga.id,
      title: manga.title.english || manga.title.romaji,
      cover: manga.coverImage.extraLarge || manga.coverImage.large,
      status,
      currentChapter: 0,
      lastReadChapter: 0,
      nextChapter: 1,
      totalChapters: chapterTotal,
      lastReadDate: null,
    });
    initProgress(manga.id, chapterTotal);
    addActivity({
      type: 'STARTED_READING',
      mangaId: manga.id,
      mangaTitle: manga.title.english || manga.title.romaji,
      cover: manga.coverImage.extraLarge || manga.coverImage.large,
      chapter: null,
    });
  };

  const handleRemoveFromLibrary = () => {
    removeItem(mangaId);
  };

  const handleMarkChapter = (chapter: number, read: boolean) => {
    if (read) {
      if (!isInLibrary && manga) {
        addItem({
          mangaId: manga.id,
          title: manga.title.english || manga.title.romaji,
          cover: manga.coverImage.extraLarge || manga.coverImage.large,
          status: defaultLibraryStatus,
          currentChapter: 0,
          lastReadChapter: 0,
          nextChapter: 1,
          totalChapters: chapterTotal,
          lastReadDate: null,
        });
        initProgress(manga.id, chapterTotal);
      }
      markChapterRead(mangaId, chapter);
      updateProgress(mangaId, chapter);
    } else {
      markChapterUnread(mangaId, chapter);
      const updatedProgress = useProgressStore.getState().getProgress(mangaId);
      if (updatedProgress) {
        syncLibraryProgress(mangaId, updatedProgress);
      }
    }
  };

  const handleStatusChange = (status: LibraryStatus) => {
    updateStatus(mangaId, status);
    setShowStatusMenu(false);
  };

  const handleMarkNextChapter = () => {
    if (!manga) return;
    const next = (progress?.currentChapter || 0) + 1;
    if (chapterTotal && next > chapterTotal) return;
    handleMarkChapter(next, true);
  };

  const handleMarkCurrentUnread = () => {
    const currentChapter = progress?.lastReadChapter || 0;
    if (currentChapter <= 0) return;
    handleMarkChapter(currentChapter, false);
  };

  const handleChapterJump = () => {
    if (!manga) return;
    const chapter = Number(chapterInput);
    if (!Number.isInteger(chapter) || chapter < 1) return;
    if (chapterTotal !== null && chapter > chapterTotal) return;
    handleMarkChapter(chapter, true);
    setChapterInput('');
  };

  // Validate the route after all hooks have been declared.
  if (!id || isNaN(mangaId) || mangaId <= 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <ErrorState message="Invalid manga ID. Please go back and try again." />
      </div>
    );
  }

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorState message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  if (!manga) return <ErrorState message="Manga not found" />;

  const title = manga.title.english || manga.title.romaji;
  const coverUrl = manga.coverImage.extraLarge || manga.coverImage.large;
   // AniList does not always provide a chapter count. Never invent a total.
  const trackedMaxChapter = Math.max(...(progress?.chaptersRead || []), progress?.lastReadChapter || 0, 0);
  const chapterListMax = chapterTotal ?? Math.max(trackedMaxChapter + 1, 1);
  const chapters = Array.from({ length: chapterListMax }, (_, i) => i + 1);

  const statusOptions: LibraryStatus[] = ['READING', 'PLAN_TO_READ', 'COMPLETED', 'DROPPED', 'PAUSED'];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Hero Section */}
      <div className="relative">
        {/* Banner */}
        {manga.bannerImage && (
          <div className="absolute inset-0 h-64 rounded-2xl overflow-hidden">
            <img src={manga.bannerImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/80 to-[#0a0a0f]" />
          </div>
        )}

        <div className={`relative ${manga.bannerImage ? 'pt-48' : ''} flex flex-col sm:flex-row gap-6`}>
          {/* Cover */}
          <div className="w-40 sm:w-48 flex-shrink-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 shadow-2xl shadow-black/50">
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
              {manga.title.native && (
                <p className="text-sm text-gray-500 mt-1">{manga.title.native}</p>
              )}
              {manga.title.english && manga.title.romaji !== manga.title.english && (
                <p className="text-sm text-gray-500">{manga.title.romaji}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2">
              {manga.averageScore && (
                <Badge variant="warning">
                  <Star size={12} className="mr-1 text-yellow-400 fill-yellow-400" />
                  {manga.averageScore}%
                </Badge>
              )}
              <Badge>{manga.format || 'Manga'}</Badge>
              <Badge variant={manga.status === 'FINISHED' ? 'success' : 'info'}>
                {manga.status === 'FINISHED' ? 'Finished' : manga.status === 'RELEASING' ? 'Releasing' : manga.status}
              </Badge>
              {chapterTotal && (
                <Badge>{chapterTotal} Chapters</Badge>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {manga.genres.map((genre) => (
                <span key={genre} className="px-2.5 py-1 rounded-lg bg-gray-800/50 text-xs text-gray-400 border border-gray-700/50">
                  {genre}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {isInLibrary ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${getLibraryStatusColor(libraryItem!.status)}`}
                    >
                      {getLibraryStatusLabel(libraryItem!.status)}
                      <ChevronRight size={14} className={`transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute top-full left-0 mt-1 bg-[#1a1a24] border border-gray-800 rounded-xl overflow-hidden z-20 shadow-xl">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
                          >
                            {getLibraryStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleRemoveFromLibrary}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleAddToLibrary('READING')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                >
                  <Plus size={14} />
                  Add to Library
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {isInLibrary && libraryItem && (
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-300">Reading Progress</h3>
              <p className="text-xs text-gray-600 mt-1">
                {chapterLookupLoading
                  ? 'Checking chapter count...'
                  : chapterSource
                    ? `Total from ${chapterSource}`
                    : 'Chapter count unavailable'}
              </p>
            </div>
            {chapterTotal && (
              <p className="text-sm font-medium text-violet-400">
                {Math.min(100, Math.round((libraryItem.currentChapter / chapterTotal) * 100))}%
              </p>
            )}
          </div>

          <div className="flex items-end gap-2 mt-5 mb-3">
            <p className="text-3xl font-bold text-white">{libraryItem.currentChapter}</p>
            <p className="text-sm text-gray-500 mb-1">
              {chapterTotal ? `/ ${chapterTotal} chapters` : '/ total unavailable'}
            </p>
          </div>

          <ProgressBar
            value={libraryItem.currentChapter}
            max={chapterTotal || Math.max(libraryItem.currentChapter, 1)}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-gray-800/30 border border-gray-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-600">Last Read</p>
              <p className="text-sm text-gray-300 mt-1">
                {libraryItem.lastReadChapter > 0 ? `Chapter ${libraryItem.lastReadChapter}` : 'Not started'}
              </p>
            </div>
            <div className="rounded-xl bg-gray-800/30 border border-gray-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-600">Next Chapter</p>
              <p className="text-sm text-gray-300 mt-1">
                {chapterTotal && libraryItem.nextChapter > chapterTotal ? 'Completed' : `Chapter ${libraryItem.nextChapter}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleMarkNextChapter}
              disabled={Boolean(chapterTotal && libraryItem.currentChapter >= chapterTotal)}
              className="px-3 py-2 bg-violet-500 text-white rounded-lg text-xs font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {chapterTotal && libraryItem.currentChapter >= chapterTotal ? 'Completed' : 'Mark Next Chapter'}
            </button>
            <button
              onClick={handleMarkCurrentUnread}
              disabled={!progress?.lastReadChapter}
              className="px-3 py-2 bg-gray-800/50 text-gray-300 border border-gray-700/50 rounded-lg text-xs font-medium hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Mark Current Unread
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Jump to chapter</p>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={chapterTotal ?? undefined}
                value={chapterInput}
                onChange={(e) => setChapterInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleChapterJump();
                }}
                placeholder={chapterTotal ? `1-${chapterTotal}` : 'Chapter number'}
                className="w-full sm:max-w-xs px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={handleChapterJump}
                disabled={!chapterInput.trim()}
                className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700/50 rounded-lg text-xs font-medium hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Mark Read
              </button>
            </div>
            <p className="text-[11px] text-gray-600 mt-2">
              Marks the selected chapter and all chapters before it as read.
            </p>
          </div>
        </Card>
      )}

      {/* Description */}
      {manga.description && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Synopsis</h3>
          <div
            className="text-sm text-gray-400 leading-relaxed [&_i]:italic [&_em]:italic [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
        </Card>
      )}

      {(manga.authors.length > 0 || manga.artists.length > 0) && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Creators</h3>
          {manga.authors.length > 0 && (
            <p className="text-sm text-gray-400">Author: {manga.authors.join(', ')}</p>
          )}
          {manga.artists.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">Artist: {manga.artists.join(', ')}</p>
          )}
        </Card>
      )}

      {/* Characters */}
      {manga.characters && manga.characters.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <Users size={14} />
            Characters
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {manga.characters.map((char) => (
              <div key={char.id} className="flex-shrink-0 text-center w-20">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 mx-auto">
                  {char.image.large ? (
                    <img src={char.image.large} alt={char.name.full} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <Users size={20} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{char.name.full}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chapter List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <BookOpen size={14} />
            Chapters
            {chapterTotal ? (
              <span className="text-gray-500 font-normal">({chapterTotal})</span>
            ) : (
              <span className="text-gray-600 font-normal text-xs">(count unavailable)</span>
            )}
          </h3>
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
          {chapters.map((ch) => {
            const isRead = progress?.chaptersRead.includes(ch) || false;
            const isCurrent = progress?.lastReadChapter === ch;
            return (
              <div
                key={ch}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  isCurrent ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMarkChapter(ch, !isRead)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isRead
                        ? 'bg-violet-500 border-violet-500'
                        : 'border-gray-600 hover:border-violet-400'
                    }`}
                  >
                    {isRead && <CheckCircle size={12} className="text-white" />}
                  </button>
                  <span className={`text-sm ${isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                    Chapter {ch}
                  </span>
                </div>
                {isCurrent && (
                  <Badge variant="info">Current</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {manga.recommended && manga.recommended.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">You May Also Like</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {manga.recommended.slice(0, 10).map((item) => (
              <Link key={item.id} to={`/manga/${item.id}`} className="flex-shrink-0 w-20 group">
                <div className="w-16 aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 mx-auto">
                  <img src={item.coverImage.large || item.coverImage.medium} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 text-center group-hover:text-violet-400 transition-colors">
                  {item.title.english || item.title.romaji}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Relations */}
      {manga.relations && manga.relations.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Related</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {manga.relations.slice(0, 10).map((rel) => (
              <Link
                key={rel.id}
                to={`/manga/${rel.id}`}
                className="flex-shrink-0 w-20 group"
              >
                <div className="w-16 h-22 rounded-lg overflow-hidden bg-gray-800 mx-auto">
                  <img src={rel.coverImage.large || rel.coverImage.medium} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 text-center group-hover:text-violet-400 transition-colors">
                  {rel.title.english || rel.title.romaji}
                </p>
                <p className="text-[10px] text-gray-600 text-center">{formatRelationType(rel.relationType)}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
