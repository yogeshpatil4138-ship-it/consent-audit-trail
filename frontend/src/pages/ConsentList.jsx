import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-4xl font-extrabold tracking-tight">Consent records</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search consent records"
               placeholder="Search subject, purpose or email"
               className="input min-w-[260px] sm:w-80" />
        <a href={`${api.defaults.baseURL}/api/consents/export`} className="btn btn-ghost">Export CSV</a>
        <Link to="/consents/new" className="btn btn-primary">New consent</Link>
      </div>

      <div className="glass overflow-x-auto rounded-panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-mist">
              <th className="p-4 font-medium">ID</th><th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Purpose</th><th className="p-4 font-medium">Basis</th>
              <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Expires</th><th></th>
            </tr>
          </thead>
          <tbody>
            {busy && <tr><td colSpan="7" className="p-8 text-center text-mist">Loading records…</td></tr>}
            {!busy && rows.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-mist">
                No records match. Try a different search, or add a new consent.
              </td></tr>
            )}
            {!busy && rows.map(r => (
              <tr key={r.id} className="border-t border-white/5 transition hover:bg-white/5">
                <td className="p-4 text-mist">{r.id}</td>
                <td className="p-4 font-medium">{r.subjectId}</td>
                <td className="p-4">{r.purpose}</td>
                <td className="p-4 text-mist">{r.legalBasis}</td>
                <td className="p-4"><StatusBadge status={r.status} /></td>
                <td className="p-4 text-mist">{r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : '—'}</td>
                <td className="p-4"><Link to={`/consents/${r.id}`} className="font-semibold text-saffron hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-mist">
        <span>{total} records</span>
        <div className="flex items-center gap-3">
          <button className="btn-ghost px-3 py-1" disabled={page === 0 || busy} onClick={() => load(page - 1, q)}>Previous</button>
          <span>Page {page + 1}</span>
          <button className="btn-ghost px-3 py-1" disabled={busy || (page + 1) * 20 >= total} onClick={() => load(page + 1, q)}>Next</button>
        </div>
      </div>
    </div>
  );
}
