import React from 'react';
import { useStore } from '../lib/store.jsx';
export function SettingsPage() {
  const { saved, region, setRegion } = useStore();
  return (
    <div className="grid max-w-2xl gap-10">
      <div><p className="hud-label">Configuration</p><h1 className="mt-2 text-2xl">Settings</h1></div>
      <div className="card">
        <p className="hud-label">Preferences — stored locally</p>
        <label className="mt-5 block text-[13px] font-light tracking-wide">Default region
          <select value={region} onChange={e => setRegion(e.target.value)} className="hud-input ml-3"><option value="global">Global</option><option value="EU">Europe</option><option value="NA">North America</option><option value="AS">Asia</option></select>
        </label>
        <p className="mt-4 text-[13px] font-light tracking-wide text-mist">Display — dark, always on.</p>
      </div>
      <div className="card">
        <p className="hud-label">Saved articles — {saved.length}</p>
        {saved.length === 0 ? <p className="mt-4 text-[13px] font-light text-mist">No saved articles yet. Use the bookmark icon on the dashboard.</p> :
          <ul className="mt-4 space-y-2 text-[13px] font-light">{saved.map(u => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="break-all text-cyan2/90 hover:text-white">{u}</a></li>)}</ul>}
        <p className="mt-5 text-[11px] font-light leading-relaxed text-faint">Accounts via Supabase are optional and not required. To enable cloud sync, set SUPABASE_URL / SUPABASE_ANON_KEY and add an auth + favorites table (see README).</p>
      </div>
    </div>
  );
}
