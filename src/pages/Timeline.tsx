import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lock, ChevronDown, ChevronRight, Zap, MapPin, Users,
  Star, ArrowLeft
} from 'lucide-react';
import { useLibraryStore, useProgressStore, useSettingsStore } from '../store/stores';
import { Card, Badge, EmptyState, EmptyIcons } from '../components/UI';
import {
  getTimelineForSeries, getSeriesWithTimelines
} from '../data/timelineRepository';
import type { Arc, StoryEvent } from '../models/types';

export default function TimelinePage() {
  const { seriesId } = useParams<{ seriesId: string }>();

  const libraryItems = useLibraryStore((s) => s.items);
  const allProgress = useProgressStore((s) => s.progress);

  // If a specific series is selected
  if (seriesId) {
    return <SeriesTimeline seriesId={Number(seriesId)} />;
  }

  // Show all available timelines
  const seriesWithTimelines = getSeriesWithTimelines();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Story Timelines</h1>
        <p className="text-gray-500 text-sm mt-1">Explore story events, arcs, and characters</p>
      </div>

      {/* Timeline data source notice */}
      <div className="px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <p className="text-xs text-violet-300/80">
          <strong>Curated Timeline Data:</strong> Story arcs and events are maintained separately from AniList.
          This allows spoiler-safe reading progress without depending on chapter metadata from the catalog API.
        </p>
      </div>

      {/* Available Timelines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesWithTimelines.map((sid) => {
          const timeline = getTimelineForSeries(sid);
          if (!timeline) return null;
          const libraryItem = libraryItems.find((i) => i.mangaId === sid);
          const progress = allProgress[sid];
          const userChapter = progress?.lastReadChapter || 0;

          return (
            <Link
              key={sid}
              to={`/timeline/${sid}`}
              className="group"
            >
              <Card className="p-5 hover:border-violet-500/30 transition-all h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap size={18} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-violet-400 transition-colors">
                      {timeline.seriesTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {timeline.arcs.length} arcs • {timeline.events.length} events • {timeline.characters.length} characters
                    </p>
                    {libraryItem && (
                      <p className="text-xs text-violet-400/60 mt-1">
                        Your progress: Ch. {userChapter}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {seriesWithTimelines.length === 0 && (
        <EmptyState
          icon={EmptyIcons.timeline}
          title="No story timelines available"
          description="Story timelines will appear here when data is available for your manga."
        />
      )}
    </div>
  );
}

// Series Timeline Component
function SeriesTimeline({ seriesId }: { seriesId: number }) {
  const [expandedArcs, setExpandedArcs] = useState<Set<string>>(() => {
    const timeline = getTimelineForSeries(seriesId);
    if (timeline && timeline.arcs.length > 0) {
      return new Set([timeline.arcs[0].id]);
    }
    return new Set<string>();
  });
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'arcs' | 'characters' | 'locations' | 'major'>('all');

  const allProgress = useProgressStore((s) => s.progress);
  const progress = allProgress[seriesId];
  const userChapter = progress?.lastReadChapter || 0;
  const spoilerProtection = useSettingsStore((s) => s.settings.spoilerProtection);
  const timeline = getTimelineForSeries(seriesId);

  if (!timeline) {
    return (
      <div className="space-y-6">
        <Link to="/timeline" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} />
          Back to Timelines
        </Link>
        <EmptyState
          icon={EmptyIcons.timeline}
          title="No timeline data"
          description="No story timeline is available for this series yet."
        />
      </div>
    );
  }

  const toggleArc = (arcId: string) => {
    setExpandedArcs((prev) => {
      const next = new Set(prev);
      if (next.has(arcId)) next.delete(arcId);
      else next.add(arcId);
      return next;
    });
  };

  const isEventLocked = (event: StoryEvent): boolean => {
    return spoilerProtection && event.chapter > userChapter;
  };

  const getArcProgress = (arc: Arc): number => {
    if (userChapter >= arc.endChapter) return 100;
    if (userChapter < arc.startChapter) return 0;
    return Math.round(((userChapter - arc.startChapter + 1) / (arc.endChapter - arc.startChapter + 1)) * 100);
  };

  const filteredEvents = filterType === 'major'
    ? timeline.events.filter((e) => e.importance === 'MAJOR' || e.importance === 'ARC_START')
    : timeline.events;

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'arcs' as const, label: 'Arcs' },
    { id: 'major' as const, label: 'Major Events' },
    { id: 'characters' as const, label: 'Characters' },
    { id: 'locations' as const, label: 'Locations' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/timeline" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-3">
          <ArrowLeft size={16} />
          Back to Timelines
        </Link>
        <h1 className="text-2xl font-bold text-white">{timeline.seriesTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {timeline.arcs.length} arcs • {timeline.events.length} events
          {userChapter > 0 && ` • You're at Chapter ${userChapter}`}
        </p>
      </div>

      {/* Timeline data source notice */}
      <div className="px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <p className="text-xs text-violet-300/80">
          <strong>Curated Timeline:</strong> Story events and arcs are maintained separately from AniList metadata.
          This keeps spoiler-aware reading progress independent from the manga catalog API.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              filterType === f.id
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'text-gray-500 border-gray-800/50 hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Characters View */}
      {filterType === 'characters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeline.characters.map((char) => (
            <Card key={char.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Users size={18} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200">{char.name}</h3>
                  <p className="text-xs text-gray-500">First appearance: Ch. {char.firstAppearance}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{char.description}</p>
              {spoilerProtection && char.firstAppearance > userChapter && (
                <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400/60">
                  <Lock size={10} />
                  <span>Spoiler locked</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Locations View */}
      {filterType === 'locations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {timeline.locations.map((loc) => (
            <Card key={loc.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-violet-400" />
                <h3 className="text-sm font-bold text-gray-200">{loc.name}</h3>
              </div>
              <p className="text-xs text-gray-400">{loc.description}</p>
              <p className="text-xs text-gray-600 mt-2">{loc.relatedEvents.length} related events</p>
            </Card>
          ))}
        </div>
      )}

      {/* Arcs View / Timeline View */}
      {(filterType === 'all' || filterType === 'arcs' || filterType === 'major') && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" />

          <div className="space-y-6">
            {timeline.arcs.map((arc) => {
              const arcEvents = filteredEvents.filter((e) => e.arcId === arc.id);
              const isExpanded = expandedArcs.has(arc.id);
              const arcProgress = getArcProgress(arc);
              const isArcLocked = spoilerProtection && arc.startChapter > userChapter;

              return (
                <div key={arc.id} className="relative pl-14">
                  {/* Arc Node */}
                  <div className="absolute left-4 top-0 w-5 h-5 rounded-full bg-[#0a0a0f] border-2 border-violet-500/50 flex items-center justify-center z-10">
                    <div className={`w-2 h-2 rounded-full ${arcProgress === 100 ? 'bg-green-400' : arcProgress > 0 ? 'bg-violet-400' : 'bg-gray-600'}`} />
                  </div>

                  {/* Arc Card */}
                  <Card className={`overflow-hidden ${isArcLocked ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => toggleArc(arc.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/20 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-200">{arc.title}</h3>
                          <Badge variant={arcProgress === 100 ? 'success' : arcProgress > 0 ? 'info' : 'default'}>
                            {arcProgress}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Chapters {arc.startChapter}–{arc.endChapter} • {arcEvents.length} events
                        </p>
                      </div>
                      {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                    </button>

                    {/* Events */}
                    {isExpanded && (
                      <div className="border-t border-gray-800/50 divide-y divide-gray-800/30">
                        {arcEvents.map((event) => {
                          const locked = isEventLocked(event);
                          return (
                            <button
                              key={event.id}
                              onClick={() => !locked && setSelectedEvent(event)}
                              className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                                locked ? 'cursor-default' : 'hover:bg-gray-800/20 cursor-pointer'
                              }`}
                            >
                              {/* Event Node */}
                              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                locked ? 'bg-gray-700' : 
                                event.importance === 'MAJOR' ? 'bg-violet-400' :
                                event.importance === 'ARC_START' ? 'bg-blue-400' :
                                'bg-gray-500'
                              }`} />
                              
                              <div className="flex-1 min-w-0">
                                {locked ? (
                                  <div className="flex items-center gap-2">
                                    <Lock size={12} className="text-yellow-500/60" />
                                    <span className="text-sm text-gray-600">Spoiler Locked</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium text-gray-200">{event.title}</h4>
                                      {event.importance === 'MAJOR' && (
                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Chapter {event.chapter}</p>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                                    {event.characters.length > 0 && (
                                      <div className="flex items-center gap-1 mt-2">
                                        <Users size={10} className="text-gray-600" />
                                        <span className="text-[10px] text-gray-500">{event.characters.join(', ')}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="w-full max-w-lg bg-[#1a1a24] border border-gray-800 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedEvent.title}</h2>
                <p className="text-sm text-gray-500">Chapter {selectedEvent.chapter}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Arc</p>
                <p className="text-sm text-gray-300">
                  {timeline.arcs.find((a) => a.id === selectedEvent.arcId)?.title}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-400 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.characters.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Characters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.characters.map((char) => (
                      <Badge key={char}>{char}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-violet-400" />
                    <span className="text-sm text-gray-300">{selectedEvent.location}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Importance</p>
                <Badge variant={selectedEvent.importance === 'MAJOR' ? 'warning' : 'default'}>
                  {selectedEvent.importance}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
