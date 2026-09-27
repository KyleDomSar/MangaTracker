import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import type { Manga } from '../models/types';
import { useLibraryStore } from '../store/stores';
import { getLibraryStatusColor } from '../store/stores';

interface MangaCardProps {
  manga: Manga;
  size?: 'sm' | 'md' | 'lg';
}

export default function MangaCard({ manga, size = 'md' }: MangaCardProps) {
  const isInLibrary = useLibraryStore((s) => s.isInLibrary(manga.id));
  const libraryItem = useLibraryStore((s) => s.getItem(manga.id));

  const title = manga.title.english || manga.title.romaji;
  const coverUrl = manga.coverImage.extraLarge || manga.coverImage.large || manga.coverImage.medium;

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-40 sm:w-44',
    lg: 'w-48 sm:w-56',
  };

  return (
    <Link
      to={`/manga/${manga.id}`}
      className={`${sizeClasses[size]} flex-shrink-0 group`}
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
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getLibraryStatusColor(libraryItem.status)}`}>
            {libraryItem.status === 'READING' ? 'Reading' : libraryItem.status === 'COMPLETED' ? 'Done' : libraryItem.status === 'PLAN_TO_READ' ? 'Plan' : libraryItem.status}
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
    sm: 'w-32',
    md: 'w-40 sm:w-44',
    lg: 'w-48 sm:w-56',
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
