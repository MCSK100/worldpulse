import React, { useEffect, useState } from 'react';
import { api, fmtTime } from '../lib/api.js';
import { Skeleton, EmptyState, SourceStamp } from '../components/ui.jsx';

export function NewsPage() {
  const [items, setItems] = useState(null);
  const [meta, setMeta] = useState(null);
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const load = async () => {
    try {
      const r = await api.get('/api/news', { params: { limit: 40, category: cat || undefined, q: q || undefined } });
      setItems(r.data.data); setMeta(r.data.meta);
    } catch { setItems([]); setMeta({}); }
  };
  useEffect(() => { api.get('/api/news/categories').then(r => setCats(r.data.data)).catch(() => {}); }, []);
  useEffect(() => { setItems(null); const t = setTimeout(load, 350); return () => clearTimeout(t); }, [cat, q]);
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div><p className="hud-label">Archive</p><h1 className="mt-2 text-2xl">World news</h1></div>
      <div className="mb-6 mt-5 flex flex-wrap items-center gap-3">
        <input aria-label="Filter news" value={q} onChange={e => setQ(e.target.value)} placeholder="FILTER HEADLINES" className="hud-input" />
        <select aria-label="Category" value={cat} onChange={e => setCat(e.target.value)} className="hud-input">
          <option value="">All categories</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-[10px] uppercase tracking-[0.28em] text-faint">Refreshes every 10 min</span>
      </div>
      {!items ? <Skeleton className="h-64" /> : items.length === 0 ? <EmptyState title="No stories match" hint="Try a different filter." /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((a, i) => (
            <li key={a.url + i} className="card">
              <p className="text-[10px] uppercase tracking-[0.28em] text-faint">{a.source} · {fmtTime(a.publishedAt)} · {a.category}{a.demo && ' · SAMPLE'}</p>
              <a href={a.url} target="_blank" rel="noreferrer" className="mt-2 block text-[16px] font-light leading-snug transition-colors hover:text-white">{a.title}</a>
              <p className="mt-1.5 text-[13px] font-light text-mist">{a.summary}</p>
              <a href={a.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[10px] uppercase tracking-[0.3em] text-cyan2/90 hover:text-white">Read original →</a>
            </li>
          ))}
        </ul>
      )}
      {meta && <div className="mt-4"><SourceStamp updatedAt={meta.updatedAt} source={meta.provider} stale={meta.stale} /></div>}
    </div>
  );
}
