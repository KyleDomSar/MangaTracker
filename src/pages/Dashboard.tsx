import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, CheckCircle, Clock, AlertTriangle, Library, ArrowRight, Sparkles, Target, BarChart3 } from 'lucide-react';
import { useLibraryStore, useActivityStore, useProgressStore, getActivityLabel } from '../store/stores';
import { Card, SectionHeader, ProgressBar, EmptyState, EmptyIcons } from '../components/UI';
import MangaCard, { MangaCardSkeleton } from '../components/MangaCard';
import { getPopular } from '../api/anilist';
import type { Manga } from '../models/types';

export default function Dashboard() {
  const items = useLibraryStore((s) => s.items);
  const allActivities = useActivityStore((s) => s.activities);
  const activities = allActivities.slice(0, 5);
  const progressMap = useProgressStore((s) => s.progress);

  const [trending, setTrending] = React.useState<Manga[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadTrending() {
      try {
        const result = await getPopular(1, 8);
        setTrending(result.manga);
      } catch {
        // Silent fail for dashboard
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  // Stats
  const currentlyReading = items.filter((i) => i.status === 'READING').length;
  const completed = items.filter((i) => i.status === 'COMPLETED').length;
  const planToRead = items.filter((i) => i.status === 'PLAN_TO_READ').length;
  const dropped = items.filter((i) => i.status === 'DROPPED').length;
  const totalLibrary = items.length;

  // Reading overview
  const totalChaptersRead = Object.values(progressMap).reduce(
    (total, progress) => total + progress.chaptersRead.length,
    0
  );
  const trackedSeries = Object.values(progressMap).filter(
    (progress) => progress.chaptersRead.length > 0
  ).length;
  const progressPercentages = items
    .map((item) => {
      if (!item.totalChapters || item.totalChapters <= 0) return null;
      return Math.min(100, (item.currentChapter / item.totalChapters) * 100);
    })
    .filter((value): value is number => value !== null);
  const averageProgress = progressPercentages.length > 0
    ? Math.round(progressPercentages.reduce((sum, value) => sum + value, 0) / progressPercentages.length)
    : 0;

  // Continue reading items
  const continueReading = items
    .filter((i) => i.status === 'READING' && i.currentChapter > 0)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 4);

  // Recently added
  const recentlyAdded = [...items]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 6);

  const stats = [
    { label: 'Currently Reading', value: currentlyReading, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Plan to Read', value: planToRead, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Dropped', value: dropped, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total Library', value: totalLibrary, icon: Library, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent border border-violet-500/20 p-6 lg:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-violet-400" />
            <span className="text-sm text-violet-400 font-medium">Welcome back</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Continue your journey
          </h1>
          <p className="text-gray-400 text-sm lg:text-base max-w-lg">
            Track your manga and manhwa, remember where you left off, and keep your reading progress organized.
          </p>
          {totalLibrary === 0 && (
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Compass size={16} />
              Start Discovering
            </Link>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Statistics */}
      <div>
        <SectionHeader title="Your Statistics" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Reading Overview */}
      <div>
        <SectionHeader title="Reading Overview" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalChaptersRead}</p>
                <p className="text-xs text-gray-500">Chapters Read</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Target size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{trackedSeries}</p>
                <p className="text-xs text-gray-500">Series Tracked</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 size={18} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-white">{averageProgress}%</p>
                <p className="text-xs text-gray-500">Average Progress</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <div>
          <SectionHeader
            title="Continue Reading"
            action={
              <Link to="/library" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {continueReading.map((item) => (
              <Link
                key={item.mangaId}
                to={`/manga/${item.mangaId}`}
                className="group"
              >
                <Card className="p-4 hover:border-violet-500/30 transition-all duration-200">
                  <div className="flex gap-3">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-violet-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Ch. {item.currentChapter}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
                      </p>
                      <div className="mt-2">
                        <ProgressBar
                          value={item.currentChapter}
                          max={item.totalChapters || 100}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                  <button className="mt-3 w-full py-2 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors">
                    Continue Reading
                  </button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div>
          <SectionHeader
            title="Recent Activity"
            action={
              <Link to="/activity" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            }
          />
          <Card className="divide-y divide-gray-800/50">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={`/manga/${activity.mangaId}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-800/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <img src={activity.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-gray-200">{activity.mangaTitle}</span>
                    {' — '}
                    {activity.type === 'CHAPTER_READ' ? `Read Chapter ${activity.chapter}` : getActivityLabel(activity.type)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <TrendingUp size={14} className="text-gray-600" />
              </Link>
            ))}
          </Card>
        </div>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <div>
          <SectionHeader
            title="Recently Added"
            action={
              <Link to="/library" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View Library <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {recentlyAdded.map((item) => (
              <Link
                key={item.mangaId}
                to={`/manga/${item.mangaId}`}
                className="flex-shrink-0 w-28 group"
              >
                <div className="w-28 h-40 rounded-xl overflow-hidden bg-gray-800">
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 group-hover:text-violet-400 transition-colors">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending / Popular */}
      <div>
        <SectionHeader
          title="Popular Right Now"
          action={
            <Link to="/discover" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Discover More <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={i} />)
            : trending.map((manga) => <MangaCard key={manga.id} manga={manga} />)
          }
        </div>
      </div>
    </div>
  );
}

function Compass({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
