import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const dot = (color) => L.divIcon({ className: '', html: `<span style="display:block;width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}"></span>`, iconSize: [10, 10] });

function FlyTo({ center }) {
  const map = useMap();
  React.useEffect(() => { if (center) map.flyTo(center, Math.max(map.getZoom(), 5), { duration: 0.8 }); }, [center]);
  return null;
}

export function PulseMap({ flights = [], cams = [], news = [], layers, focus, height = '60vh', onSelect }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setReady(true), 50); return () => clearTimeout(t); }, []);
  if (!ready) return <div className="skel" style={{ height }} role="status" aria-label="Map loading" />;
  const flightMarkers = (layers?.flights === false ? [] : flights).slice(0, 400);
  return (
    <MapContainer center={[25, 10]} zoom={2} style={{ height, width: '100%' }} className="rounded-xl" scrollWheelZoom>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
      <FlyTo center={focus} />
      {flightMarkers.map(a => a.lat != null && (
        <Marker key={a.icao24} position={[a.lat, a.lon]} icon={dot('#cfe3ee')} eventHandlers={{ click: () => onSelect && onSelect({ kind: 'flight', item: a }) }}>
          <Popup><b>{a.callsign || a.icao24}</b><br />{a.originCountry || ''} · {a.altitude ?? '—'} ft</Popup>
        </Marker>
      ))}
      {(layers?.news === false ? [] : news).filter(n => n.lat).slice(0, 100).map((n, i) => (
        <Marker key={'n' + i} position={[n.lat, n.lon]} icon={dot('#7fd4e8')}>
          <Popup><b>{n.title}</b><br /><a href={n.url} target="_blank" rel="noreferrer">Read original</a></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
