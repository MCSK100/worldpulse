import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Skeleton, EmptyState } from '../components/ui.jsx';

export function CamerasPage() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const load = async () => { try { const r = await api.get('/api/webcams', { params: { q: q || undefined } }); setData(r.data); } catch { setData({ data: [], meta: {} }); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [q]);
  return (
    <div>
      <div><p className="hud-label">Observation</p><h1 className="mt-2 text-2xl">Live public webcams</h1></div>
      <p className="mb-5 mt-4 max-w-2xl text-[13px] font-light leading-relaxed text-mist">Only public, embed-permitted cameras. CCTV / private feeds are never shown. {!data?.meta?.windy?.configured && 'Windy API not configured — showing curated link-outs.'}</p>
      <input aria-label="Search cameras" value={q} onChange={e => setQ(e.target.value)} placeholder="SEARCH CITY, COUNTRY, CAMERA" className="hud-input mb-6" />
      {!data ? <Skeleton className="h-64" /> : data.data.length === 0 ? <EmptyState title="No cameras found" hint="Configure WINDY_API_KEY for the full directory." /> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map(c => (
            <li key={c.id} className="card">
              <p className="hud-label">{c.category}</p>
              <p className="mt-2 text-[16px] font-light leading-snug">{c.title}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-faint">{c.city || ''} {c.country} · {c.provider}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-min" onClick={() => setSel(c)}>Open player</button>
                {c.pageUrl && <a className="btn-min" href={c.pageUrl} target="_blank" rel="noreferrer">Original page</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {sel && (
        <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/80 p-4" role="dialog" aria-label={`Camera ${sel.title}`}>
          <div className="w-full max-w-3xl border border-white/15 bg-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-base font-light normal-case tracking-wide">{sel.title}</h2><button aria-label="Close" className="btn-min" onClick={() => setSel(null)}>Close</button></div>
            {sel.youtubeId ? (
              <div className="aspect-video"><iframe title={sel.title} src={`https://www.youtube.com/embed/${sel.youtubeId}?autoplay=1`} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
            ) : (
              <p className="text-sm font-light text-mist">Embedding not permitted for this provider. <a className="text-cyan2 hover:text-white" href={sel.pageUrl} target="_blank" rel="noreferrer">Open the original camera page →</a></p>
            )}
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-faint">Status — {sel.status} · Verified — {sel.lastVerified || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
