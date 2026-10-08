import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useActivityStore, getActivityLabel } from '../store/stores';
import { Card, EmptyState, EmptyIcons } from '../components/UI';
import type { ActivityType } from '../models/types';

function getActivityIcon(type: ActivityType) {
  const icons: Record<ActivityType, React.ReactNode> = {
    ADDED_TO_LIBRARY: <Plus size={14} className="text-blue-400" />,
    STARTED_READING: <BookOpen size={14} className="text-green-400" />,
    CHAPTER_READ: <CheckCircle size={14} className="text-violet-400" />,
    PROGRESS_UPDATED: <TrendingUp size={14} className="text-indigo-400" />,
    STATUS_CHANGED: <Clock size={14} className="text-yellow-400" />,
    COMPLETED: <CheckCircle size={14} className="text-emerald-400" />,
  };
  return icons[type];
}

function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    ADDED_TO_LIBRARY: 'bg-blue-500/10 border-blue-500/20',
    STARTED_READING: 'bg-green-500/10 border-green-500/20',
    CHAPTER_READ: 'bg-violet-500/10 border-violet-500/20',
    PROGRESS_UPDATED: 'bg-indigo-500/10 border-indigo-500/20',
    STATUS_CHANGED: 'bg-yellow-500/10 border-yellow-500/20',
    COMPLETED: 'bg-emerald-500/10 border-emerald-500/20',
  };
  return colors[type];
}

export default function ActivityPage() {
  const activities = useActivityStore((s) => s.activities);

  // Group activities by date using useMemo to avoid infinite loops
  const groupedActivities = React.useMemo(() => {
    const grouped: Record<string, typeof activities> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      let group: string;
      if (date >= today) group = 'Today';
      else if (date >= yesterday) group = 'Yesterday';
      else if (date >= weekAgo) group = 'This Week';
      else group = 'Older';

      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(activity);
    });
    return grouped;
  }, [activities]);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  if (activities.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Your reading history and actions</p>
        </div>
        <EmptyState
          icon={EmptyIcons.book}
          title="No reading activity yet"
          description="Start reading manga to see your activity history here."
          action={
            <Link
              to="/discover"
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Discover Manga
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-gray-500 text-sm mt-1">{activities.length} activities recorded</p>
      </div>

      {/* Activity Groups */}
      <div className="space-y-8">
        {groupOrder.map((group) => {
          const groupActivities = groupedActivities[group];
          if (!groupActivities || groupActivities.length === 0) return null;

          return (
            <div key={group}>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{group}</h2>
              <div className="space-y-2">
                {groupActivities.map((activity) => (
                  <Link
                    key={activity.id}
                    to={`/manga/${activity.mangaId}`}
                    className="block group"
                  >
                    <Card className="p-4 hover:border-violet-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium text-gray-200 group-hover:text-violet-400 transition-colors">
                              {activity.mangaTitle}
                            </span>
                            {activity.type === 'CHAPTER_READ' && (
                              <span className="text-gray-500"> — Read Chapter {activity.chapter}</span>
                            )}
                            {activity.type === 'COMPLETED' && (
                              <span className="text-gray-500"> — Completed!</span>
                            )}
                            {activity.type === 'ADDED_TO_LIBRARY' && (
                              <span className="text-gray-500"> — Added to Library</span>
                            )}
                            {activity.type === 'STARTED_READING' && (
                              <span className="text-gray-500"> — Started Reading</span>
                            )}
                            {activity.type === 'STATUS_CHANGED' && (
                              <span className="text-gray-500"> — {getActivityLabel(activity.type)}</span>
                            )}
                            {activity.type === 'PROGRESS_UPDATED' && (
                              <span className="text-gray-500"> — Progress Updated</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Cover */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img src={activity.cover} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
