import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Skeleton, EmptyState } from '../components/ui.jsx';

export function StreamsPage() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const load = async () => { try { const r = await api.get('/api/streams', { params: { q: q || undefined } }); setData(r.data); } catch { setData({ data: [], meta: {} }); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [q]);
  const badge = (s) => s === 'live' ? 'border-red-300/50 text-red-200' : s === 'upcoming' ? 'border-sky-300/40 text-sky-200' : s === 'available' ? 'border-teal-200/50 text-teal-100' : s === 'ended' || s === 'unavailable' ? 'border-white/20 text-faint' : 'border-amber-200/40 text-amber-100/90';
  return (
    <div>
      <div><p className="hud-label">Broadcasts</p><h1 className="mt-2 text-2xl">Public live streams</h1></div>
      <p className="mb-5 mt-4 max-w-2xl text-[13px] font-light leading-relaxed text-mist">{data?.meta?.note || 'Official broadcasts only.'}</p>
      <input aria-label="Search streams" value={q} onChange={e => setQ(e.target.value)} placeholder="SEARCH TITLE, CHANNEL" className="hud-input mb-6" />
      {!data ? <Skeleton className="h-64" /> : data.data.length === 0 ? <EmptyState title="No streams" hint="Try another search." /> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map(s => (
            <li key={s.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px] font-light leading-snug">{s.title}</p>
                <span className={`tag shrink-0 ${badge(s.status)}`}>{s.status || 'unknown'}</span>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-faint">{s.channel} · {s.category} · {s.country}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-min" onClick={() => setSel(s)}>Watch</button>
                <a className="btn-min" href={s.streamUrl} target="_blank" rel="noreferrer">Original</a>
              </div>
            </li>
          ))}
        </ul>
      )}
      {sel && (
        <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/80 p-4" role="dialog" aria-label={sel.title}>
          <div className="w-full max-w-3xl border border-white/15 bg-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-base font-light normal-case tracking-wide">{sel.title}</h2><button aria-label="Close" className="btn-min" onClick={() => setSel(null)}>Close</button></div>
            <div className="aspect-video"><iframe title={sel.title} src={sel.embedUrl} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-faint">Status — {sel.status} · {sel.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
