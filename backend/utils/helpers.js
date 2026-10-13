function normalizeText(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function canonicalUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(p => url.searchParams.delete(p));
    return url.toString().replace(/\/$/, '');
  } catch { return String(u || '').trim(); }
}
function dedupeArticles(articles) {
  const seenUrl = new Set(); const seenTitle = new Set(); const out = [];
  for (const a of articles) {
    const cu = canonicalUrl(a.url); const nt = normalizeText(a.title);
    if (!nt || !cu) continue;
    if (seenUrl.has(cu) || seenTitle.has(nt)) continue;
    seenUrl.add(cu); seenTitle.add(nt); out.push({ ...a, url: cu });
  }
  return out;
}
function isValidHttpUrl(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}
function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
module.exports = { normalizeText, canonicalUrl, dedupeArticles, isValidHttpUrl, clampInt };
