import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await login(u, p);
      nav(loc.state?.from?.pathname || '/', { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-brand mb-4">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input value={u} onChange={(e) => setU(e.target.value)}
                 className="mt-1 w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={p} onChange={(e) => setP(e.target.value)}
                 className="mt-1 w-full border rounded px-3 py-2" required />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="bg-brand text-white px-4 py-2 rounded w-full disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-4">Demo: <b>admin/admin123</b> or <b>auditor/audit123</b></p>
    </div>
  );
}
