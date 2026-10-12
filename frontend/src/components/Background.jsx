import { useEffect, useRef } from 'react';

/**
 * Live "consent ledger" background.
 *  - Nodes drift and link to neighbours; square nodes are sealed records.
 *  - The cursor pulls nearby nodes in and lights their links saffron.
 *  - Small receipts travel node-to-node along the links.
 *  - Clicking sends a ripple and fires receipts from the nearest records.
 * Honors prefers-reduced-motion (draws one still frame) and pauses when the tab is hidden.
 */
const LINK = 150;   // max link length (px)
const REACH = 200;  // cursor influence radius (px)

export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, raf = 0, last = 0, spawnIn = 0;
    let nodes = [], pulses = [], ripples = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.round((w * h) / 13000));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.4,
        sealed: i % 9 === 0,
        phase: Math.random() * Math.PI * 2,
      }));
      pulses = []; ripples = [];
    };

    const neighbours = (n) =>
      nodes.filter((m) => m !== n && Math.hypot(m.x - n.x, m.y - n.y) < LINK);

    const launch = (from, hops = 4) => {
      const next = neighbours(from);
      if (!next.length) return;
      pulses.push({ a: from, b: next[(Math.random() * next.length) | 0], t: 0, hops });
    };

    const step = (dt) => {
      for (const n of nodes) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < REACH && d > 1) {
          const f = (1 - d / REACH) * 0.035;
          n.vx += (dx / d) * f; n.vy += (dy / d) * f;
        }
        n.vx *= 0.985; n.vy *= 0.985;
        // keep a gentle drift so the field never goes still
        n.vx += (Math.random() - 0.5) * 0.012; n.vy += (Math.random() - 0.5) * 0.012;
        n.x += n.vx * dt * 60; n.y += n.vy * dt * 60;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        n.phase += dt * 1.6;
      }
      spawnIn -= dt;
      if (spawnIn <= 0) { launch(nodes[(Math.random() * nodes.length) | 0]); spawnIn = 0.9 + Math.random() * 1.1; }
      for (const p of pulses) p.t += dt / 0.8;
      pulses = pulses.filter((p) => {
        if (p.t < 1) return true;
        if (p.hops > 0) {
          const opts = neighbours(p.b).filter((m) => m !== p.a);
          if (opts.length) pulses.push({ a: p.b, b: opts[(Math.random() * opts.length) | 0], t: 0, hops: p.hops - 1 });
        }
        return false;
      });
      for (const r of ripples) r.t += dt / 1.1;
      ripples = ripples.filter((r) => r.t < 1);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK) continue;
          const near = Math.min(
            Math.hypot(a.x - mouse.x, a.y - mouse.y),
            Math.hypot(b.x - mouse.x, b.y - mouse.y));
          const hot = near < REACH ? 1 - near / REACH : 0;
          const base = (1 - d / LINK) * 0.28;
          ctx.strokeStyle = hot > 0
            ? `rgba(244,166,59,${Math.min(0.85, base + hot * 0.6)})`
            : `rgba(120,160,230,${base})`;
          ctx.lineWidth = hot > 0 ? 1.1 : 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // cursor tether to the closest few nodes
      if (mouse.x > -999) {
        nodes
          .map((n) => [n, Math.hypot(n.x - mouse.x, n.y - mouse.y)])
          .filter(([, d]) => d < REACH)
          .sort((p, q) => p[1] - q[1]).slice(0, 5)
          .forEach(([n, d]) => {
            ctx.strokeStyle = `rgba(244,166,59,${0.4 * (1 - d / REACH)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          });
      }
      // nodes
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const hot = d < REACH ? 1 - d / REACH : 0;
        if (n.sealed) {
          const s = 3.6 + hot * 3 + Math.sin(n.phase) * 0.5;
          ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(Math.PI / 4);
          ctx.strokeStyle = hot > 0.05 ? `rgba(244,166,59,${0.55 + hot * 0.4})` : 'rgba(53,195,174,.75)';
          ctx.fillStyle = 'rgba(8,18,42,.85)'; ctx.lineWidth = 1.2;
          ctx.fillRect(-s, -s, s * 2, s * 2); ctx.strokeRect(-s, -s, s * 2, s * 2);
          ctx.restore();
        } else {
          ctx.fillStyle = hot > 0.05 ? `rgba(244,166,59,${0.6 + hot * 0.4})` : 'rgba(150,185,245,.6)';
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + hot * 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }
      // receipts
      for (const p of pulses) {
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, 'rgba(53,195,174,.95)'); g.addColorStop(1, 'rgba(53,195,174,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E9EEF8'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      // click ripples
      for (const r of ripples) {
        ctx.strokeStyle = `rgba(244,166,59,${0.6 * (1 - r.t)})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.t * 150, 0, Math.PI * 2); ctx.stroke();
      }
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      step(dt); draw(); raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    const onDown = (e) => {
      if (reduce) return;
      ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
      nodes
        .map((n) => [n, Math.hypot(n.x - e.clientX, n.y - e.clientY)])
        .sort((p, q) => p[1] - q[1]).slice(0, 3)
        .forEach(([n]) => launch(n, 5));
    };
    let resizeTimer;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { build(); if (reduce) draw(); }, 150); };
    const onVisibility = () => (document.hidden ? stop() : start());

    build();
    if (reduce) draw(); else start();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop(); clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
      {/* soft vignette keeps text readable at the edges */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,9,24,.55) 100%)' }} />
    </>
  );
}
