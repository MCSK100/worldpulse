// In-memory TTL cache with stale-fallback support.
// NOTE: resets on restart, not shared across instances. Documented in README.
class TTLCache {
  constructor() { this.store = new Map(); }
  set(key, value, ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs, setAt: Date.now() });
  }
  _entry(key) { return this.store.get(key) || null; }
  getFresh(key) {
    const e = this._entry(key);
    if (!e) return null;
    if (Date.now() > e.expiresAt) return null;
    return e;
  }
  getWithStale(key) {
    const e = this._entry(key);
    if (!e) return { value: null, stale: true, updatedAt: null };
    return { value: e.value, stale: Date.now() > e.expiresAt, updatedAt: new Date(e.setAt).toISOString() };
  }
  clear() { this.store.clear(); }
}
module.exports = new TTLCache();
