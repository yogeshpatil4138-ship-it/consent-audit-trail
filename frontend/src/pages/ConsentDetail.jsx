import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AIPanel from '../components/AIPanel';
import { useAuth } from '../context/AuthContext';

export default function ConsentDetail() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [err, setErr] = useState(null);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/api/consents/${id}`).then(r => setRec(r.data)).catch(e => setErr(e.message));
  }, [id]);

  const remove = async () => {
    if (!confirm('Soft-delete this consent record?')) return;
    await api.delete(`/api/consents/${id}`);
    nav('/consents');
  };

  if (err) return <p className="p-4 text-red-600">Error: {err}</p>;
  if (!rec) return <p className="p-4 text-slate-400">Loading…</p>;

  const Row = ({ k, v }) => (
    <div className="flex py-1 border-b border-slate-100 text-sm">
      <span className="w-40 text-slate-500">{k}</span>
      <span className="flex-1">{v ?? '—'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold flex-1">Consent #{rec.id}</h1>
        <Link to={`/consents/${rec.id}/edit`} className="btn bg-brand text-white px-3 py-2 rounded">Edit</Link>
        {user?.role === 'ADMIN' &&
          <button onClick={remove} className="btn bg-red-600 text-white px-3 py-2 rounded">Delete</button>}
      </div>
      <div className="bg-white rounded-lg shadow p-5">
        <Row k="Subject ID"    v={rec.subjectId} />
        <Row k="Subject email" v={rec.subjectEmail} />
        <Row k="Purpose"       v={rec.purpose} />
        <Row k="Legal basis"   v={rec.legalBasis} />
        <Row k="Consent given" v={rec.consentGiven ? 'Yes' : 'No'} />
        <Row k="Status"        v={rec.status} />
        <Row k="Granted at"    v={rec.grantedAt ? new Date(rec.grantedAt).toLocaleString() : null} />
        <Row k="Expires at"    v={rec.expiresAt ? new Date(rec.expiresAt).toLocaleString() : null} />
        <Row k="Withdrawn at"  v={rec.withdrawnAt ? new Date(rec.withdrawnAt).toLocaleString() : null} />
        <Row k="Source"        v={rec.source} />
        <Row k="Evidence URL"  v={rec.evidenceUrl && <a href={rec.evidenceUrl} className="text-brand underline" target="_blank" rel="noreferrer">{rec.evidenceUrl}</a>} />
        <Row k="Data categories" v={rec.dataCategories} />
        {rec.aiDescription && <Row k="AI description" v={rec.aiDescription} />}
        {rec.aiScore != null && <Row k="AI score" v={rec.aiScore} />}
      </div>
      <AIPanel record={rec} />
    </div>
  );
}
