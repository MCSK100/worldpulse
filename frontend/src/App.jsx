import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/store.jsx';
import { Layout } from './components/Layout.jsx';
import { ErrorBoundary } from './components/ui.jsx';
import { Landing } from './pages/Landing.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NewsPage } from './pages/NewsPage.jsx';
import { FlightsPage } from './pages/FlightsPage.jsx';
import { CamerasPage } from './pages/CamerasPage.jsx';
import { StreamsPage } from './pages/StreamsPage.jsx';
import { MapPage } from './pages/MapPage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/cameras" element={<CamerasPage />} />
              <Route path="/streams" element={<StreamsPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<p>Not found. <a href="/" className="text-cyan2">Home</a></p>} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </StoreProvider>
  );
}
