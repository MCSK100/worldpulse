import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export function SearchPage() {
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const [tab, setTab] = useState('news');
  const [res, setRes] = useState(null);
  useEffect(() => {
    if (!q) return;
    (async () => {
      const out = {};
      try { out.news = (await api.get('/api/news', { params: { q, limit: 10 } })).data; } catch {}
      try { out.flights = (await api.get('/api/flights', { params: { callsign: q } })).data; } catch {}
      try { out.cams = (await api.get('/api/webcams', { params: { q } })).data; } catch {}
      try { out.streams = (await api.get('/api/streams', { params: { q } })).data; } catch {}
      setRes(out);
    })();
  }, [q]);
  if (!q) return <p className="text-sm text-mist">Type a query in the header search.</p>;
  const tabs = ['news', 'flights', 'cams', 'streams'];
  return (
    <div>
      <div><p className="hud-label">Query</p><h1 className="mt-2 text-2xl font-extralight normal-case tracking-[0.08em]">Results for “{q}”</h1></div>
      <div className="mb-6 mt-5 flex gap-7 border-b border-white/10" role="tablist">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`border-b pb-2 text-[11px] uppercase tracking-[0.3em] transition-colors ${tab === t ? 'border-[#eef4f8]/70 text-[#eef4f8]' : 'border-transparent text-[#8fa3b8] hover:text-[#eef4f8]'}`}>{t}</button>)}</div>
      {!res ? <p>Loading…</p> : (
        <div>
          {tab === 'news' && <ul className="grid gap-2">{res.news?.data?.map((a, i) => <li key={i} className="card"><a href={a.url} target="_blank" rel="noreferrer" className="font-medium hover:text-cyan2">{a.title}</a><p className="text-xs text-mist">{a.source}</p></li>) || <li>No results</li>}</ul>}
          {tab === 'flights' && <ul className="grid gap-2">{res.flights?.data?.slice(0, 20).map(f => <li key={f.icao24} className="card font-mono text-sm">{f.callsign || f.icao24} · {f.originCountry}</li>)}</ul>}
          {tab === 'cams' && <ul className="grid gap-2">{res.cams?.data?.map(c => <li key={c.id} className="card">{c.title} · {c.country}</li>)}</ul>}
          {tab === 'streams' && <ul className="grid gap-2">{res.streams?.data?.map(s => <li key={s.id} className="card">{s.title} · {s.channel}</li>)}</ul>}
        </div>
      )}
      <Link to="/dashboard" className="mt-4 inline-block text-sm text-cyan2">← Back to dashboard</Link>
    </div>
  );
}
