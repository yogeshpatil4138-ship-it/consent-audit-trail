import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ConsentList() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (p = 0, query = '') => {
    setBusy(true);
    try {
      const url = query ? '/api/consents/search' : '/api/consents';
      const { data } = await api.get(url, { params: { q: query || undefined, page: p, size: 20 } });
      setRows(data.content); setTotal(data.totalElements); setPage(p);
    } finally { setBusy(false); }
  };

  useEffect(() => { load(0, ''); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(0, q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex-1">Consent records</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="Search subject / purpose / email…"
               className="border rounded px-3 py-2 min-w-[260px]" />
        <a href={`${api.defaults.baseURL}/api/consents/export`} className="btn bg-brand-light text-white px-3 py-2 rounded">
          Export CSV
        </a>
        <Link to="/consents/new" className="btn bg-brand text-white px-3 py-2 rounded">+ New</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">ID</th><th className="p-3">Subject</th>
              <th className="p-3">Purpose</th><th className="p-3">Basis</th>
              <th className="p-3">Status</th><th className="p-3">Expires</th><th></th>
            </tr>
          </thead>
          <tbody>
            {busy && <tr><td colSpan="7" className="p-6 text-center text-slate-400">Loading…</td></tr>}
            {!busy && rows.length === 0 && (
              <tr><td colSpan="7" className="p-6 text-center text-slate-400">No records.</td></tr>
            )}
            {!busy && rows.map(r => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.subjectId}</td>
                <td className="p-3">{r.purpose}</td>
                <td className="p-3">{r.legalBasis}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'EXPIRED' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'WITHDRAWN' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'}`}>{r.status}</span>
                </td>
                <td className="p-3">{r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : '—'}</td>
                <td className="p-3"><Link to={`/consents/${r.id}`} className="text-brand hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-sm text-slate-600">
        <span>Total: {total}</span>
        <div className="space-x-2">
          <button className="btn bg-white border px-3 py-1 rounded" disabled={page === 0 || busy}
                  onClick={() => load(page - 1, q)}>Prev</button>
          <span>Page {page + 1}</span>
          <button className="btn bg-white border px-3 py-1 rounded"
                  disabled={busy || (page + 1) * 20 >= total}
                  onClick={() => load(page + 1, q)}>Next</button>
        </div>
      </div>
    </div>
  );
}
