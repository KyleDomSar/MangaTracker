import React, { useState } from 'react';
import { Trash2, AlertTriangle, Info, Database, BookOpen, Activity, Shield } from 'lucide-react';
import { useLibraryStore, useActivityStore, useSettingsStore, getLibraryStatusLabel } from '../store/stores';
import { Card } from '../components/UI';

export default function SettingsPage() {
  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  const clearLibrary = useLibraryStore((s) => s.clearLibrary);
  const clearActivities = useActivityStore((s) => s.clearActivities);
  const clearCache = useSettingsStore((s) => s.clearCache);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const libraryCount = useLibraryStore((s) => s.items.length);
  const activityCount = useActivityStore((s) => s.activities.length);

  const handleClear = (type: string) => {
    switch (type) {
      case 'library':
        clearLibrary();
        break;
      case 'activity':
        clearActivities();
        break;
      case 'cache':
        clearCache();
        break;
    }
    setConfirmClear(null);
  };

  interface SettingItem {
    icon: React.ReactNode;
    label: string;
    description: string;
    action: string;
    danger: boolean;
    detail?: string;
    toggle?: boolean;
  }

  interface SettingSection {
    title: string;
    items: SettingItem[];
  }

  const settingsSections: SettingSection[] = [
    {
      title: 'Data Management',
      items: [
        {
          icon: <Database size={18} className="text-blue-400" />,
          label: 'Clear API Cache',
          description: 'Remove cached API data. Your library and progress will not be affected.',
          action: 'cache',
          danger: false,
          detail: 'Cache is stored for 15 minutes',
        },
        {
          icon: <Activity size={18} className="text-yellow-400" />,
          label: 'Clear Activity History',
          description: 'Remove all reading activity records. Your library will not be affected.',
          action: 'activity',
          danger: true,
          detail: `${activityCount} activities will be removed`,
        },
        {
          icon: <BookOpen size={18} className="text-red-400" />,
          label: 'Clear Entire Library',
          description: 'Remove all manga from your library including progress. This cannot be undone.',
          action: 'library',
          danger: true,
          detail: `${libraryCount} manga will be removed`,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Shield size={18} className="text-violet-400" />,
          label: 'Spoiler Protection',
          description: 'Hide story events beyond your reading progress on timelines.',
          action: 'spoiler',
          danger: false,
          toggle: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your app preferences and data</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-200">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    {item.detail && (
                      <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
                    )}
                  </div>
                  {item.toggle ? (
                    <button
                      onClick={() => updateSettings({ spoilerProtection: !settings.spoilerProtection })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.spoilerProtection ? 'bg-violet-500' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.spoilerProtection ? 'left-0.5' : 'left-0.5'
                        }`}
                        style={{ transform: settings.spoilerProtection ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  ) : confirmClear === item.action ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClear(item.action)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmClear(null)}
                        className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(item.action)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        item.danger
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {item.danger ? 'Clear' : 'Clear'}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* About */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Reading</h2>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-200">Default Library Status</h3>
              <p className="text-xs text-gray-500 mt-0.5">Status used when you add a new title from Manga Details.</p>
            </div>
            <select
              value={settings.defaultLibraryStatus}
              onChange={(e) => updateSettings({ defaultLibraryStatus: e.target.value as typeof settings.defaultLibraryStatus })}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 focus:outline-none"
            >
              {(['READING', 'PLAN_TO_READ', 'COMPLETED', 'DROPPED', 'PAUSED'] as const).map((status) => (
                <option key={status} value={status}>{getLibraryStatusLabel(status)}</option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">About</h2>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ManhwaTimeline</h3>
              <p className="text-xs text-gray-500">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            ManhwaTimeline is your personal manga and manhwa tracking companion. 
            Track your reading progress, explore story timelines, and never forget 
            where you left off in your favorite series.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-800/50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info size={12} />
              <span>Metadata is provided by AniList. Story timelines are loaded from the configured Supabase timeline database.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Are you sure?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleClear(confirmClear)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setConfirmClear(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
