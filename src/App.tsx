import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import DashboardLayout from './layouts/DashboardLayout';
import { OfflineBanner, LoadingSpinner } from './components/UI';
import ErrorBoundary from './components/ErrorBoundary';

// Pages are code-split so the first load only ships the shell plus the
// page actually being visited.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Discover = lazy(() => import('./pages/Discover'));
const LibraryPage = lazy(() => import('./pages/Library'));
const ActivityPage = lazy(() => import('./pages/Activity'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const MangaDetails = lazy(() => import('./pages/MangaDetails'));

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/discover': 'Discover',
  '/library': 'Library',
  '/activity': 'Activity',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/manga/')) {
      document.title = 'Manga Details · MangaTracker';
      return;
    }
    const title = PAGE_TITLES[pathname];
    document.title = title ? `${title} · MangaTracker` : 'MangaTracker';
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
        <Compass size={28} className="text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Page not found</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        The page you were looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors text-sm font-medium"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LoadingSpinner size="lg" />}>{element}</Suspense>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ScrollToTop />
        <PageTitle />
        <OfflineBanner />
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={withSuspense(<Dashboard />)} />
            <Route path="/discover" element={withSuspense(<Discover />)} />
            <Route path="/library" element={withSuspense(<LibraryPage />)} />
            <Route path="/activity" element={withSuspense(<ActivityPage />)} />
            <Route path="/profile" element={withSuspense(<ProfilePage />)} />
            <Route path="/settings" element={withSuspense(<SettingsPage />)} />
            <Route path="/manga/:id" element={withSuspense(<MangaDetails />)} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
