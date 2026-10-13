import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Cinematic entry scene: full-screen particle planet + starfield on raw canvas.
// Original code — no third-party assets. Honors prefers-reduced-motion.
export function Landing() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(100, Math.floor(((t - t0) / 2400) * 100));
      setProgress(p);
      if (p >= 100) { setReady(true); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onMove = (e) => { mouse.current = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 }; };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(1.5, window.devicePixelRatio || 1);
    let w, h, raf;

    const stars = Array.from({ length: 240 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3,
      tw: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 1.2,
    }));
    // fibonacci sphere point cloud
    const N = 750, pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = i * 2.399963;
      pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]);
    }

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let rot = 0;
    const draw = (t) => {
      ctx.fillStyle = '#04070c';
      ctx.fillRect(0, 0, w, h);
      const mx = mouse.current.x, my = mouse.current.y;
      // stars with drift + twinkle
      for (const s of stars) {
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.001 * s.sp + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#cfe3ee';
        ctx.beginPath();
        ctx.arc(((s.x + t * 0.000004 * s.sp) % 1) * w + mx * -12, s.y * h + my * -8, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // planet
      const R = Math.min(w, h) * 0.3;
      const cx = w / 2 + mx * 22, cy = h / 2 + my * 16;
      // atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.45);
      glow.addColorStop(0, 'rgba(0,0,0,0)');
      glow.addColorStop(0.78, 'rgba(64,160,190,0.10)');
      glow.addColorStop(0.9, 'rgba(120,220,240,0.20)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2); ctx.fill();
      // disc
      ctx.fillStyle = '#060b13';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // particle surface
      rot += reduced ? 0 : 0.0016;
      const tilt = 0.42;
      for (const [x0, y0, z0] of pts) {
        const lon = Math.atan2(z0, x0) + rot;
        const x1 = Math.cos(lon) * Math.sqrt(Math.max(0, 1 - y0 * y0));
        const z1 = Math.sin(lon) * Math.sqrt(Math.max(0, 1 - y0 * y0));
        const y1 = y0 * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = y0 * Math.sin(tilt) + z1 * Math.cos(tilt);
        if (z2 < -0.08) continue;
        const px = cx + x1 * R, py = cy + y1 * R;
        const edge = Math.sqrt(x1 * x1 + y1 * y1);
        const a = Math.max(0.06, (z2 + 0.08) * 0.75) * (1.15 - edge * 0.55);
        ctx.globalAlpha = Math.min(0.9, a);
        ctx.fillStyle = edge > 0.86 ? '#9fdcef' : '#5e7f95';
        const s = edge > 0.86 ? 1.7 : 1.3;
        ctx.fillRect(px, py, s, s);
      }
      ctx.globalAlpha = 1;
      // terminator sweep (slow light band)
      const band = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
      band.addColorStop(0, 'rgba(0,0,0,0.42)');
      band.addColorStop(0.55, 'rgba(0,0,0,0)');
      band.addColorStop(1, 'rgba(0,0,0,0.30)');
      ctx.fillStyle = band;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw(0);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04070c] text-[#eef4f8]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(2,5,9,0.72) 100%)' }} aria-hidden />

      {/* top HUD */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-xs font-bold tracking-[0.42em]">WORLD&nbsp;PULSE</span>
        <span className="flex items-center gap-2 text-[10px] tracking-[0.32em] text-[#9fb4c2]">
          <span className="live-dot" aria-hidden /> LIVE // GLOBAL
        </span>
      </div>

      {/* center hero */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className={`flex flex-col items-center transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <p className="mb-5 text-[11px] tracking-[0.5em] text-[#9fb4c2]">REAL-TIME GLOBAL DISCOVERY</p>
          <h1 className="max-w-4xl text-4xl font-light leading-[1.12] tracking-[0.08em] md:text-6xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', textShadow: 'none' }}>
            THE WORLD,<br />HAPPENING RIGHT NOW.
          </h1>
          <p className="mt-6 max-w-xl text-sm font-light leading-relaxed tracking-wide text-[#b9c9d4]">
            Live world news, aircraft, public webcams and broadcasts —
            orchestrated on one planetary dashboard.
          </p>
          <Link to="/dashboard" className="landing-cta mt-9" aria-label="Enter the live dashboard">
            INITIATE SYSTEM
          </Link>
          <p className="mt-6 text-[10px] tracking-[0.3em] text-[#728795]">LIVE DATA · REFRESHES EVERY 10 MINUTES</p>
        </div>
      </div>

      {/* loader percent */}
      <div className={`absolute bottom-8 left-6 transition-opacity duration-700 md:left-10 ${ready ? 'opacity-0' : 'opacity-100'}`} aria-live="polite">
        <span className="text-6xl font-extralight tabular-nums md:text-7xl">{progress}</span>
        <span className="ml-1 text-2xl font-extralight">%</span>
      </div>
      <div className="absolute bottom-8 right-6 text-[10px] tracking-[0.3em] text-[#728795] md:right-10">
        PLANETARY SCALE
      </div>
    </div>
  );
}
