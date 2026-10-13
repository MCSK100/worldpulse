import React, { createContext, useContext, useEffect, useState } from 'react';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [region, setRegion] = useState(() => localStorage.getItem('wp-region') || 'global');
  const [layers, setLayers] = useState({ news: true, flights: true, cams: true });
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('wp-saved') || '[]'); } catch { return []; } });
  const theme = 'dark'; // dark-only cinematic theme.

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  useEffect(() => localStorage.setItem('wp-region', region), [region]);
  useEffect(() => localStorage.setItem('wp-saved', JSON.stringify(saved)), [saved]);

  const toggleSave = (url) => setSaved(s => s.includes(url) ? s.filter(u => u !== url) : [...s, url]);
  return <StoreCtx.Provider value={{ theme, region, setRegion, layers, setLayers, saved, toggleSave }}>{children}</StoreCtx.Provider>;
}
