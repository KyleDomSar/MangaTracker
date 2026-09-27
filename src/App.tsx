import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import LibraryPage from './pages/Library';
import ActivityPage from './pages/Activity';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import MangaDetails from './pages/MangaDetails';
import { OfflineBanner } from './components/UI';

export default function App() {
  return (
    <HashRouter>
      <OfflineBanner />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
