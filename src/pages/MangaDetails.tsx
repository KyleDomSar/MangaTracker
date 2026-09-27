import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, Clock, CheckCircle, Plus, Trash2,
  ChevronRight, Lock, MapPin, Users, Zap, ExternalLink
} from 'lucide-react';
import { getMangaDetails } from '../api/anilist';
import type { MangaDetail } from '../api/anilist';
import { useLibraryStore, useProgressStore, useActivityStore, getLibraryStatusColor, getLibraryStatusLabel } from '../store/stores';
import { Card, ProgressBar, Badge, LoadingSpinner, ErrorState } from '../components/UI';
import { hasTimelineData, getTimelineForSeries } from '../data/mockTimelineData';
import type { LibraryStatus } from '../models/types';

export default function MangaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mangaId = Number(id);

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const items = useLibraryStore((s) => s.items);
  const isInLibrary = items.some((i) => i.mangaId === mangaId);
  const libraryItem = items.find((i) => i.mangaId === mangaId);
  const addItem = useLibraryStore((s) => s.addItem);
  const removeItem = useLibraryStore((s) => s.removeItem);
  const updateStatus = useLibraryStore((s) => s.updateStatus);
  const updateProgress = useLibraryStore((s) => s.updateProgress);
  const allProgress = useProgressStore((s) => s.progress);
  const progress = allProgress[mangaId];
  const initProgress = useProgressStore((s) => s.initProgress);
  const markChapterRead = useProgressStore((s) => s.markChapterRead);
  const markChapterUnread = useProgressStore((s) => s.markChapterUnread);
  const addActivity = useActivityStore((s) => s.addActivity);

  const hasTimeline = hasTimelineData(mangaId);
  const timelineData = getTimelineForSeries(mangaId);

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
  }, [id, mangaId, initProgress]);

  const handleAddToLibrary = (status: LibraryStatus = 'READING') => {
    if (!manga) return;
    addItem({
      mangaId: manga.id,
      title: manga.title.english || manga.title.romaji,
      cover: manga.coverImage.extraLarge || manga.coverImage.large,
      status,
      currentChapter: 0,
      lastReadChapter: 0,
      nextChapter: 1,
      totalChapters: manga.chapters,
      lastReadDate: null,
    });
    initProgress(manga.id, manga.chapters);
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
      markChapterRead(mangaId, chapter);
      if (isInLibrary) {
        updateProgress(mangaId, chapter);
      }
    } else {
      markChapterUnread(mangaId, chapter);
    }
  };

  const handleStatusChange = (status: LibraryStatus) => {
    updateStatus(mangaId, status);
    setShowStatusMenu(false);
  };

  // Where Was I? logic
  const getWhereWasI = () => {
    if (!libraryItem || !progress) return null;
    const lastRead = progress.lastReadChapter;
    const currentArc = timelineData?.arcs.find(
      (arc) => lastRead >= arc.startChapter && lastRead <= arc.endChapter
    );
    const lastEvent = timelineData?.events
      .filter((e) => e.chapter <= lastRead)
      .sort((a, b) => b.chapter - a.chapter)[0];
    return { lastRead, currentArc, lastEvent, nextChapter: lastRead + 1 };
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
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!manga) return <ErrorState message="Manga not found" />;

  const title = manga.title.english || manga.title.romaji;
  const coverUrl = manga.coverImage.extraLarge || manga.coverImage.large;
  const whereWasI = getWhereWasI();

  // AniList does not always provide a chapter count. In that case, show a
  // practical tracking window rather than pretending the fallback is the real total.
  const maxChapters = manga.chapters || (progress ? Math.max(...progress.chaptersRead, 0) + 20 : 50);
  const chapters = Array.from({ length: maxChapters }, (_, i) => i + 1);

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
              {manga.chapters && (
                <Badge>{manga.chapters} Chapters</Badge>
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

      {/* Where Was I? */}
      {whereWasI && (
        <Card className="p-5 border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-violet-400" />
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider">Where Was I?</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Last Read</p>
              <p className="text-lg font-bold text-white">Chapter {whereWasI.lastRead}</p>
            </div>
            {whereWasI.currentArc && (
              <div>
                <p className="text-xs text-gray-500">Current Arc</p>
                <p className="text-sm font-medium text-gray-200">{whereWasI.currentArc.title}</p>
              </div>
            )}
            {whereWasI.lastEvent && (
              <div>
                <p className="text-xs text-gray-500">Last Event</p>
                <p className="text-sm font-medium text-gray-200">{whereWasI.lastEvent.title}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Next</p>
              <p className="text-sm font-medium text-gray-200">Chapter {whereWasI.nextChapter}</p>
            </div>
          </div>
          {hasTimeline && (
            <Link
              to={`/timeline/${mangaId}`}
              className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors"
            >
              <Clock size={12} />
              View Story Timeline
            </Link>
          )}
        </Card>
      )}

      {/* Progress Section */}
      {isInLibrary && libraryItem && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Reading Progress</h3>
          <div className="flex items-center gap-4 mb-3">
            <p className="text-2xl font-bold text-white">{libraryItem.currentChapter}</p>
            <p className="text-gray-500">
              {manga.chapters ? `/ ${manga.chapters} chapters` : '/ ? chapters'}
            </p>
          </div>
          <ProgressBar
            value={libraryItem.currentChapter}
            max={manga.chapters || libraryItem.currentChapter + 10}
          />
        </Card>
      )}

      {/* Description */}
      {manga.description && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Synopsis</h3>
          <p
            className="text-sm text-gray-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
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
            {manga.chapters ? (
              <span className="text-gray-500 font-normal">({manga.chapters})</span>
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

      {/* Timeline Link */}
      {hasTimeline && (
        <Link
          to={`/timeline/${mangaId}`}
          className="block"
        >
          <Card className="p-5 hover:border-violet-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Zap size={18} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-violet-400 transition-colors">
                    Story Timeline Available
                  </h3>
                  <p className="text-xs text-gray-500">
                    {timelineData?.arcs.length} arcs • {timelineData?.events.length} events
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-500 group-hover:text-violet-400 transition-colors" />
            </div>
          </Card>
        </Link>
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
                <p className="text-[10px] text-gray-600 text-center">{rel.relationType}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
