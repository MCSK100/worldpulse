import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Settings } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { api } from '../lib/api.js';

const links = [
  ['/dashboard', 'Dashboard'], ['/news', 'News'], ['/flights', 'Live Flights'],
  ['/cameras', 'Live Cameras'], ['/streams', 'Live Streams'], ['/map', 'World Map'],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#04070c]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 md:px-10">
        <Link to="/" className="text-[13px] font-bold tracking-[0.42em] text-[#eef4f8]" aria-label="World Pulse home">
          WORLD&nbsp;PULSE
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `border-b pb-0.5 text-[10px] tracking-[0.3em] uppercase transition-colors ${isActive ? 'border-[#eef4f8]/70 text-[#eef4f8]' : 'border-transparent text-[#8fa3b8] hover:text-[#eef4f8]'}`}>{label}</NavLink>
          ))}
        </nav>
        <form className="ml-auto hidden items-center md:flex" role="search" onSubmit={e => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); }}>
          <label className="sr-only" htmlFor="global-search">Search</label>
          <div className="flex items-center gap-2 border-b border-white/20 pb-1 focus-within:border-[#eef4f8]/60">
            <Search size={13} className="text-[#728795]" />
            <input id="global-search" value={q} onChange={e => setQ(e.target.value)} placeholder="SEARCH" className="w-36 bg-transparent text-[11px] tracking-[0.28em] outline-none placeholder:text-[#4d5f71]" />
          </div>
        </form>
        <Link to="/settings" aria-label="Settings" className="text-[#8fa3b8] transition-colors hover:text-[#eef4f8]"><Settings size={15} strokeWidth={1.5} /></Link>
        <button className="text-[#8fa3b8] hover:text-[#eef4f8] lg:hidden" aria-label="Menu" onClick={() => setOpen(o => !o)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-white/10 bg-[#04070c] px-6 py-3 lg:hidden" aria-label="Mobile">
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `py-2 text-[11px] tracking-[0.3em] uppercase ${isActive ? 'text-[#eef4f8]' : 'text-[#8fa3b8]'}`}>{label}</NavLink>)}
        </nav>
      )}
    </header>
  );
}

export function StatusBar() {
  const { region } = useStore();
  const [utc, setUtc] = useState(new Date().toISOString());
  const [status, setStatus] = useState(null);
  useEffect(() => { const t = setInterval(() => setUtc(new Date().toISOString()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let alive = true;
    api.get('/api/status').then(r => alive && setStatus(r.data.data)).catch(() => {});
    const t = setInterval(() => api.get('/api/status').then(r => alive && setStatus(r.data.data)).catch(() => {}), 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  const newsOk = !!status?.news?.lastSuccess;
  const flightsLive = status?.flights?.demo === false;
  const item = (label, value, live) => (
    <span className="flex items-center gap-2">
      {live != null && (live
        ? <span className="live-dot" aria-hidden />
        : <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3a4a5e]" aria-hidden />)}
      <span className="text-[#728795]">{label}</span><span className="text-[#e4ecf3]">{value}</span>
    </span>
  );
  return (
    <div className="border-b border-white/10 text-[10px] tracking-[0.3em]" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-1 px-6 py-2.5 md:px-10">
        {item('UTC', new Date(utc).toISOString().slice(11, 19))}
        {item('ZONE', region.toUpperCase())}
        {item('INTEL', newsOk ? 'FRESH' : 'DARK', newsOk)}
        {item('AIR', flightsLive ? 'LIVE' : 'SIM', flightsLive)}
        {item('CAMS', status?.webcams?.updatedAt ? 'READY' : 'LIMITED', !!status?.webcams?.updatedAt)}
      </div>
    </div>
  );
}
