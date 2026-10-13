import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Bookmark } from 'lucide-react';
import { api, fmtTime } from '../lib/api.js';
import { useStore } from '../lib/store.jsx';
import { PulseMap } from '../components/PulseMap.jsx';
import { Skeleton, EmptyState, SourceStamp } from '../components/ui.jsx';

export function Dashboard() {
  const { layers, setLayers, saved, toggleSave } = useStore();
  const [news, setNews] = useState(null);
  const [flights, setFlights] = useState(null);
  const [cams, setCams] = useState(null);
  const [streams, setStreams] = useState(null);
  const [focus, setFocus] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    try { const r = await api.get('/api/news', { params: { limit: 12 } }); setNews(r.data); } catch { setNews({ data: [], meta: {} }); }
    try { const r = await api.get('/api/flights'); setFlights(r.data); } catch { setFlights({ data: [], meta: {} }); }
    try { const r = await api.get('/api/webcams'); setCams(r.data); } catch { setCams({ data: [], meta: {} }); }
    try { const r = await api.get('/api/streams'); setStreams(r.data); } catch { setStreams({ data: [], meta: {} }); }
  };
  useEffect(() => { load(); const t = setInterval(load, 10 * 60 * 1000); return () => clearInterval(t); }, []);

  const stats = [
    { label: 'Intel feed', value: news?.meta?.updatedAt ? fmtTime(news.meta.updatedAt) : '···', sub: news?.meta?.stale ? 'STALE' : news?.meta?.provider ? `VIA ${String(news.meta.provider).toUpperCase()}` : 'OFFLINE', live: !!news?.meta?.updatedAt && !news?.meta?.stale },
    { label: 'Aircraft tracked', value: flights ? String(flights.data?.length ?? 0) : '···', sub: flights?.meta?.demo ? 'SIMULATION' : 'LIVE', live: !!flights && !flights?.meta?.demo },
    { label: 'Cams online', value: cams ? `${cams.meta?.playable ?? 0} / ${cams.data?.length ?? 0}` : '···', sub: 'PUBLIC ONLY', live: false },
    { label: 'Active channels', value: streams ? String(streams.data?.length ?? 0) : '···', sub: 'CURATED', live: false },
  ];

  return (
    <div className="grid gap-12">
      {/* overview strip */}
      <section aria-label="Global overview">
        <p className="hud-label">Global overview</p>
        {!news && !flights ? <Skeleton className="mt-4 h-24" /> : (
          <div className="mt-4 grid grid-cols-2 border-y border-white/10 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`px-6 py-6 ${i > 0 ? 'border-l border-white/10' : ''} ${i === 2 ? 'max-md:border-l-0 max-md:border-t max-md:border-white/10' : ''} ${i === 3 ? 'max-md:border-t max-md:border-white/10' : ''}`}>
                <p className="hud-label">{s.label}</p>
                <p className="mt-3 text-2xl font-extralight tabular-nums tracking-wide md:text-[26px]">{s.value} {s.live && <span className="live-dot ml-1 align-middle" aria-label="live" />}</p>
                <p className="mt-2 text-[10px] tracking-[0.3em] text-faint">{s.sub}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-12 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Breaking news">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="hud-label">Intel feed</p><h2 className="mt-2 text-2xl">Breaking news</h2></div>
            <div className="flex gap-3">
              <button className="btn btn-compact" onClick={async () => { try { await api.post('/api/news/refresh'); } catch {} load(); }}><RefreshCw size={12} strokeWidth={1.5} />Refresh</button>
              <Link to="/news" className="btn btn-compact btn-primary">All news</Link>
            </div>
          </div>
          <div className="mt-6">
            {!news ? <Skeleton className="h-64" /> : news.data.length === 0 ? <EmptyState title="No headlines available" hint="Provider may be down — cached feed will appear when refreshed." /> : (
              <ul className="border-t border-white/10">
                {news.data.slice(0, 8).map((a, i) => (
                  <li key={a.url + i} className="flex gap-5 border-b border-white/10 py-5">
                    <span className="pt-1 text-[11px] font-light tabular-nums text-faint">{String(i + 1).padStart(2, '0')}</span>
                    {a.imageUrl ? <img src={a.imageUrl} alt="" loading="lazy" className="hidden h-16 w-24 rounded-sm object-cover opacity-80 sm:block" onError={e => e.currentTarget.style.display = 'none'} /> : null}
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-faint">{a.source} · {fmtTime(a.publishedAt)} · {a.category}</p>
                      <a href={a.url} target="_blank" rel="noreferrer" className="mt-1.5 block text-[17px] font-light leading-snug transition-colors hover:text-white">{a.title}</a>
                      <p className="mt-1 line-clamp-1 text-[13px] font-light text-mist">{a.summary}</p>
                      <div className="mt-2 flex items-center gap-5 text-[10px] uppercase tracking-[0.28em]">
                        <a className="text-cyan2/90 hover:text-white" href={a.url} target="_blank" rel="noreferrer">Read original</a>
                        <button aria-label="Save article" onClick={() => toggleSave(a.url)} className="text-faint transition-colors hover:text-white"><Bookmark size={13} strokeWidth={1.5} fill={saved.includes(a.url) ? 'currentColor' : 'none'} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {news?.meta && <div className="mt-4"><SourceStamp updatedAt={news.meta.updatedAt} source={news.meta.provider} stale={news.meta.stale} /></div>}
        </section>

        <aside className="grid content-start gap-10" aria-label="Live activity">
          <div>
            <p className="hud-label">Airspace</p>
            <h3 className="mt-2 text-xl font-extralight uppercase tracking-[0.14em]">Live flights</h3>
            {!flights ? <Skeleton className="mt-4 h-24" /> : (
              <ul className="mt-4 border-t border-white/10 text-[13px] font-light">
                {flights.data.slice(0, 12).map(f => <li key={f.icao24} className="flex justify-between border-b border-white/10 py-2.5"><span className="tracking-[0.18em]">{f.callsign || f.icao24}</span><span className="text-faint">{f.originCountry || '—'}</span></li>)}
              </ul>
            )}
            <Link to="/flights" className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em] text-cyan2/90 hover:text-white">Open flight tracker →</Link>
          </div>
          <div>
            <p className="hud-label">Broadcasts</p>
            <h3 className="mt-2 text-xl font-extralight uppercase tracking-[0.14em]">Public streams</h3>
            {!streams ? <Skeleton className="mt-4 h-24" /> : (
              <ul className="mt-4 space-y-3 border-t border-white/10 pt-4 text-[13px] font-light">{streams.data.slice(0, 5).map(s => <li key={s.id}><a className="transition-colors hover:text-white" href={`https://www.youtube.com/watch?v=${s.youtubeId}`} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
            )}
            <Link to="/streams" className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em] text-cyan2/90 hover:text-white">Discover streams →</Link>
          </div>
        </aside>
      </div>

      <section aria-label="Earth map">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div><p className="hud-label">Tactical view</p><h2 className="mt-2 text-2xl">Interactive earth</h2></div>
          <div className="flex gap-5">
            {['news', 'flights', 'cams'].map(k => (
              <label key={k} className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-mist"><input type="checkbox" className="accent-[#cfe3ee]" checked={layers[k]} onChange={() => setLayers({ ...layers, [k]: !layers[k] })} />{k}</label>
            ))}
          </div>
          {detail && <span className="ml-auto text-[11px] tracking-[0.2em] text-mist">TARGET — {(detail.item.callsign || detail.item.icao24 || detail.item.title || '').toUpperCase()} <button className="ml-2 text-cyan2 hover:text-white" onClick={() => setDetail(null)}>CLEAR</button></span>}
        </div>
        <div className="map-frame mt-6">
          <PulseMap flights={flights?.data || []} layers={layers} focus={focus} onSelect={setDetail} />
        </div>
        {flights?.meta && <div className="mt-4"><SourceStamp updatedAt={flights.meta.updatedAt} source={flights.meta.demo ? 'Simulation — OpenSky unavailable' : 'OpenSky Network'} stale={flights.meta.stale} /></div>}
      </section>
    </div>
  );
}
