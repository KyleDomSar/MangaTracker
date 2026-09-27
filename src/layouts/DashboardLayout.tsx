import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Library,
  Clock,
  Activity,
  User,
  Settings,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/timeline', icon: Clock, label: 'Timeline' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#12121a] border-r border-gray-800/50 fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">ManhwaTimeline</h1>
              <p className="text-xs text-gray-500">Track your journey</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="px-4 py-3 rounded-xl bg-gray-800/30">
            <p className="text-xs text-gray-500">ManhwaTimeline v1.0</p>
            <p className="text-xs text-gray-600 mt-1">Your manga journey tracker</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#12121a]/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-base text-white">ManhwaTimeline</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:flex-none lg:w-[calc(100%-16rem)] lg:ml-64 pb-20 lg:pb-0 pt-14 lg:pt-0 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#12121a]/95 backdrop-blur-sm border-t border-gray-800/50">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex min-w-[68px] flex-shrink-0 flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-violet-400'
                    : 'text-gray-500'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
