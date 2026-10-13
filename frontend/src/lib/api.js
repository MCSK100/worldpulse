import React from 'react';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';
export const api = axios.create({ baseURL, timeout: 20000 });

export const fmtTime = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toUTCString().slice(5, 22) + ' UTC'; } catch { return '—'; }
};
export const timeAgo = (iso) => {
  if (!iso) return 'unknown';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};
export function useDebounced(value, ms = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
