import { useEffect, useState } from 'react';

// Count up to the value once it arrives (skipped when reduced motion is on)
function useCountUp(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf; const t0 = performance.now(); const dur = 800;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

export default function KPICard({ label, value, dot = 'bg-sky' }) {
  const shown = useCountUp(value);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div onPointerMove={onMove} className="glass spotlight flex flex-col rounded-panel p-5">
      <div className="flex items-center gap-2 text-sm text-mist">
        <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
      </div>
      <div className="mt-3 text-5xl font-extrabold tracking-tight">{value == null ? '—' : shown}</div>
    </div>
  );
}
