import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return <div className="card m-6" role="alert"><p className="hud-label">System fault</p><h2 className="mt-2 font-light">Something went wrong.</h2><p className="mt-1 text-sm text-mist">{String(this.state.err.message)}</p><button className="btn btn-compact mt-4" onClick={() => location.reload()}>Reload</button></div>;
    return this.props.children;
  }
}
export const Skeleton = ({ className = 'h-20' }) => <div className={`skel ${className}`} aria-hidden />;
export const EmptyState = ({ title, hint }) => (
  <div className="card py-12 text-center" role="status">
    <p className="hud-label">No signal</p>
    <p className="mt-2 text-lg font-extralight uppercase tracking-[0.2em]">{title}</p>
    {hint && <p className="mt-2 text-sm font-light text-mist">{hint}</p>}
  </div>
);
export const SourceStamp = ({ updatedAt, source, stale }) => (
  <p className="text-[10px] uppercase tracking-[0.3em] text-faint" aria-live="polite">
    Source — {source || '—'} · Updated — {updatedAt ? new Date(updatedAt).toLocaleString() : '—'}
    {stale && <span className="tag ml-3 border-amber-300/40 text-amber-200/90">Stale</span>}
  </p>
);
