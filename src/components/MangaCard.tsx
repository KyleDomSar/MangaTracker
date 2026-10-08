import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import type { Manga } from '../models/types';
import { useLibraryStore } from '../store/stores';
import { getLibraryStatusColor } from '../store/stores';

function getStatusBadgeClass(status: NonNullable<ReturnType<typeof useLibraryStore>>['items'][number]['status']) {
  const classes = {
    READING: 'text-blue-300 border-blue-400/50 bg-[#0a0a0f]/90',
    COMPLETED: 'text-green-300 border-green-400/50 bg-[#0a0a0f]/90',
    PLAN_TO_READ: 'text-purple-300 border-purple-400/50 bg-[#0a0a0f]/90',
    DROPPED: 'text-red-300 border-red-400/50 bg-[#0a0a0f]/90',
    PAUSED: 'text-yellow-300 border-yellow-400/50 bg-[#0a0a0f]/90',
  } as const;

  return classes[status];
}

interface MangaCardProps {
  manga: Manga;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function MangaCard({ manga, size = 'md', fullWidth = false }: MangaCardProps) {
  const isInLibrary = useLibraryStore((s) => s.isInLibrary(manga.id));
  const libraryItem = useLibraryStore((s) => s.getItem(manga.id));

  const title = manga.title.english || manga.title.romaji;
  const coverUrl = manga.coverImage.extraLarge || manga.coverImage.large || manga.coverImage.medium;

  const sizeClasses = {
    sm: 'w-32 min-w-[8rem]',
    md: 'w-40 min-w-[10rem] sm:w-44 sm:min-w-[11rem]',
    lg: 'w-48 min-w-[12rem] sm:w-56 sm:min-w-[14rem]',
  };

  const cardWidthClass = fullWidth ? 'w-full' : `${sizeClasses[size]} flex-shrink-0`;

  return (
    <Link
      to={`/manga/${manga.id}`}
      className={`${cardWidthClass} group`}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-800/50">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <BookOpen size={32} className="text-gray-600" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status badge */}
        {isInLibrary && libraryItem && (
          <div
            className={`absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full text-[10px] leading-none font-semibold border backdrop-blur-md shadow-lg whitespace-nowrap ${getStatusBadgeClass(libraryItem.status)}`}
          >
            {libraryItem.status === 'PLAN_TO_READ'
              ? 'Plan to Read'
              : libraryItem.status === 'READING'
                ? 'Reading'
                : libraryItem.status === 'COMPLETED'
                  ? 'Completed'
                  : libraryItem.status === 'DROPPED'
                    ? 'Dropped'
                    : 'Paused'}
          </div>
        )}

        {/* Rating */}
        {manga.averageScore && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 text-xs">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white font-medium">{manga.averageScore}%</span>
          </div>
        )}

        {/* Progress bar for library items */}
        {isInLibrary && libraryItem && libraryItem.totalChapters && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (libraryItem.currentChapter / libraryItem.totalChapters) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-violet-400 transition-colors">
          {title}
        </h3>
        {manga.format && (
          <p className="text-xs text-gray-500 mt-0.5">{manga.format}</p>
        )}
      </div>
    </Link>
  );
}

// Skeleton card for loading states
export function MangaCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-32 min-w-[8rem]',
    md: 'w-40 min-w-[10rem] sm:w-44 sm:min-w-[11rem]',
    lg: 'w-48 min-w-[12rem] sm:w-56 sm:min-w-[14rem]',
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 animate-pulse`}>
      <div className="rounded-xl aspect-[3/4] bg-gray-800/50" />
      <div className="mt-2 space-y-1.5">
        <div className="h-4 bg-gray-800/50 rounded w-3/4" />
        <div className="h-3 bg-gray-800/30 rounded w-1/2" />
      </div>
    </div>
  );
}
