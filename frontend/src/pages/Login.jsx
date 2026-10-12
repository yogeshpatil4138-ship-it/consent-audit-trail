import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seal from '../components/Seal';

const PROOF = [
  'Every record is timestamped and tied to a legal basis.',
  'Expiry alerts go out before a consent lapses.',
  'Export the full trail for a regulator in one click.',
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [off, setOff] = useState({ x: 0, y: 0 });

  // light parallax for the shield, driven by the pointer
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e) => setOff({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await login(u, p);
      nav(loc.state?.from?.pathname || '/', { replace: true });
    } catch (e) {
      setErr(e.response
        ? (e.response.data?.message || 'Wrong username or password.')
        : "Can't reach the server. Check that the backend is running.");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.15fr_.85fr]">
      <section>
        <h1 className="rise legible max-w-xl text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ '--d': '.1s' }}>
          Every yes, on the record.
        </h1>
        <p className="rise legible mt-5 max-w-lg text-lg leading-relaxed text-mist" style={{ '--d': '.3s' }}>
          Track who agreed to what, under which legal basis, and prove it the moment you are asked.
          Built around India's DPDP Act, 2023.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <Seal offset={off} className="w-40 shrink-0 sm:w-52" />
          <ul className="rise legible space-y-3 text-sm leading-snug text-paper/90" style={{ '--d': '.6s' }}>
            {PROOF.map((t) => (
              <li key={t} className="flex max-w-xs gap-2.5">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M4 10.5 L8.2 14.5 L16 5.5" fill="none" stroke="#35C3AE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rise glass rounded-panel p-7 sm:p-8" style={{ '--d': '.45s' }}>
        <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
        <p className="mt-1 text-sm text-mist">Use your auditor or admin account.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="label">Username</span>
            <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username"
                   className="input mt-1.5" required />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password"
                   className="input mt-1.5" required />
          </label>
          {err && <p role="alert" className="rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">{err}</p>}
          <button disabled={busy} className="btn-primary w-full py-3 text-base">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-xs text-mist">
          Demo accounts
          <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => { setU('admin'); setP('admin123'); }}>Admin</button>
          <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => { setU('auditor'); setP('audit123'); }}>Auditor</button>
        </div>
      </section>
    </div>
  );
}
