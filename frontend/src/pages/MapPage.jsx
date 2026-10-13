import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { PulseMap } from '../components/PulseMap.jsx';
import { useStore } from '../lib/store.jsx';

export function MapPage() {
  const { layers, setLayers, region, setRegion } = useStore();
  const [flights, setFlights] = useState({ data: [] });
  const [regions, setRegions] = useState([]);
  useEffect(() => { api.get('/api/flights').then(r => setFlights(r.data)).catch(() => {}); }, []);
  useEffect(() => { api.get('/api/regions').then(r => setRegions(r.data.data)).catch(() => {}); }, []);
  const focus = regions.find(r => r.code === region)?.bbox ? (() => { const b = regions.find(r => r.code === region).bbox; return [(b.lamin + b.lamax) / 2, (b.lomin + b.lomax) / 2]; })() : null;
  return (
    <div>
      <div><p className="hud-label">Planetary view</p><h1 className="mt-2 text-2xl">World map</h1></div>
      <div className="mb-5 mt-5 flex flex-wrap items-center gap-5">
        <select aria-label="Region" value={region} onChange={e => setRegion(e.target.value)} className="hud-input">
          <option value="global">Global</option>{regions.filter(r => r.code !== 'global').map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
        {['news', 'flights', 'cams'].map(k => <label key={k} className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-mist"><input type="checkbox" className="accent-[#cfe3ee]" checked={layers[k]} onChange={() => setLayers({ ...layers, [k]: !layers[k] })} />{k}</label>)}
      </div>
      <div className="map-frame">
        <PulseMap flights={flights.data} layers={layers} focus={focus} height="70vh" />
      </div>
    </div>
  );
}
