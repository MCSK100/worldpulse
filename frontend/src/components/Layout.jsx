import { Outlet } from 'react-router-dom';
import { Header, StatusBar } from './chrome.jsx';
export function Layout() {
  return (
    <div className="min-h-screen bg-abyss font-sans font-light text-[#e4ecf3]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-2 focus:text-black">Skip to content</a>
      <Header />
      <StatusBar />
      <main id="main" className="mx-auto max-w-7xl px-6 py-10 md:px-10"><Outlet /></main>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-[10px] tracking-[0.32em] text-[#728795]">
        WORLD PULSE · THE WORLD, HAPPENING RIGHT NOW · INTEL — BBC / GUARDIAN / GNEWS / NEWSAPI · AIR — OPENSKY NETWORK
      </footer>
    </div>
  );
}
