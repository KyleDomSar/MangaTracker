import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, AlertTriangle, Library, TrendingUp, Award } from 'lucide-react';
import { useLibraryStore, useActivityStore } from '../store/stores';
import { Card, ProgressBar } from '../components/UI';

export default function ProfilePage() {
  const items = useLibraryStore((s) => s.items);
  const activities = useActivityStore((s) => s.activities);

  const currentlyReading = items.filter((i) => i.status === 'READING').length;
  const completed = items.filter((i) => i.status === 'COMPLETED').length;
  const planToRead = items.filter((i) => i.status === 'PLAN_TO_READ').length;
  const dropped = items.filter((i) => i.status === 'DROPPED').length;
  const totalLibrary = items.length;

  // Calculate total chapters read
  const totalChaptersRead = items.reduce((sum, item) => sum + item.currentChapter, 0);

  // Calculate reading streak (days with activity)
  const uniqueDays = new Set(
    activities.map((a) => new Date(a.timestamp).toDateString())
  ).size;

  // Average progress
  const itemsWithProgress = items.filter((i) => i.totalChapters && i.totalChapters > 0);
  const avgProgress = itemsWithProgress.length > 0
    ? Math.round(itemsWithProgress.reduce((sum, i) => sum + (i.currentChapter / (i.totalChapters || 1)) * 100, 0) / itemsWithProgress.length)
    : 0;

  const stats = [
    { label: 'Total Library', value: totalLibrary, icon: Library, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Currently Reading', value: currentlyReading, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Plan to Read', value: planToRead, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Dropped', value: dropped, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Chapters Read', value: totalChaptersRead, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Days', value: uniqueDays, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your reading statistics and overview</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <BookOpen size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Manga Reader</h2>
            <p className="text-sm text-gray-500">
              Tracking {totalLibrary} manga • {totalChaptersRead} chapters read
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Reading Distribution */}
      {totalLibrary > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Library Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Reading', count: currentlyReading, color: 'bg-blue-500' },
              { label: 'Completed', count: completed, color: 'bg-green-500' },
              { label: 'Plan to Read', count: planToRead, color: 'bg-purple-500' },
              { label: 'Dropped', count: dropped, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24">{item.label}</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${totalLibrary > 0 ? (item.count / totalLibrary) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity Summary */}
      {activities.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300">Recent Activity</h3>
            <Link to="/activity" className="text-xs text-violet-400 hover:text-violet-300">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <img src={activity.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">
                    <span className="font-medium">{activity.mangaTitle}</span>
                    {activity.chapter && ` — Ch. ${activity.chapter}`}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
