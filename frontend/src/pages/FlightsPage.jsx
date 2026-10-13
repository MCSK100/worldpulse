import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { PulseMap } from '../components/PulseMap.jsx';
import { Skeleton, EmptyState, SourceStamp } from '../components/ui.jsx';

export function FlightsPage() {
  const [flights, setFlights] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const dq = q;
  const load = async () => {
    try { const r = await api.get('/api/flights', { params: { callsign: dq || undefined } }); setFlights(r.data); }
    catch { setFlights({ data: [], meta: {} }); }
  };
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [q]);
  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div><p className="hud-label">Airspace</p><h1 className="mt-2 text-2xl">Live flights {flights?.meta?.demo && <span className="tag ml-2 border-amber-300/40 align-middle text-amber-200/90">Simulation</span>}</h1></div>
        <div className="map-frame mt-6">
          {!flights ? <Skeleton className="h-[60vh]" /> : <PulseMap flights={flights.data} layers={{ flights: true }} height="62vh" onSelect={(d) => setSel(d.item)} />}
        </div>
        {flights?.meta && <div className="mt-4"><SourceStamp updatedAt={flights.meta.updatedAt} source={flights.meta.demo ? 'Simulation' : 'OpenSky Network'} stale={flights.meta.stale} /></div>}
        <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-faint">Attribution — {flights?.meta?.attribution || 'OpenSky Network'}</p>
      </div>
      <aside className="card h-fit">
        <p className="hud-label">Target search</p>
        <input aria-label="Search aircraft" value={q} onChange={e => setQ(e.target.value)} placeholder="CALLSIGN / ICAO24" className="hud-input mb-4 mt-4 w-full" />
        {!flights ? <Skeleton className="h-40" /> : flights.data.length === 0 ? <EmptyState title="No aircraft" hint="Try clearing the search or zooming out." /> : (
          <ul className="max-h-[50vh] overflow-auto text-[13px] font-light">
            {flights.data.slice(0, 80).map(f => (
              <li key={f.icao24} className="border-b border-white/10"><button className="flex w-full justify-between py-2.5 text-left transition-colors hover:text-white" onClick={() => setSel(f)}>
                <span className="tracking-[0.18em]">{f.callsign || f.icao24}</span><span className="tabular-nums text-faint">{f.altitude ?? '—'} ft</span>
              </button></li>
            ))}
          </ul>
        )}
        {sel && (
          <div className="mt-5 border border-white/20 p-4 text-[13px] font-light" role="dialog" aria-label="Aircraft details">
            <p className="text-base font-light tracking-[0.2em]">{sel.callsign || sel.icao24}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <dt className="uppercase tracking-[0.24em] text-faint">ICAO24</dt><dd className="tabular-nums">{sel.icao24}</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Position</dt><dd className="tabular-nums">{sel.lat?.toFixed(2)}, {sel.lon?.toFixed(2)}</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Altitude</dt><dd className="tabular-nums">{sel.altitude ?? '—'} ft</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Speed</dt><dd className="tabular-nums">{sel.velocity ?? '—'} m/s</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Heading</dt><dd className="tabular-nums">{sel.heading ?? '—'}°</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Country</dt><dd>{sel.originCountry || '—'}</dd>
              <dt className="uppercase tracking-[0.24em] text-faint">Updated</dt><dd>{sel.lastUpdate ? new Date(sel.lastUpdate).toLocaleTimeString() : '—'}</dd>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
}
