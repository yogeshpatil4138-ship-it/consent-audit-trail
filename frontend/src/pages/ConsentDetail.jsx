import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AIPanel from '../components/AIPanel';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const Row = ({ k, v }) => (
  <div className="grid gap-1 border-b border-white/10 py-3 text-sm last:border-0 sm:grid-cols-[11rem_1fr]">
    <span className="text-mist">{k}</span>
    <span>{v ?? '—'}</span>
  </div>
);

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

  if (err) return <p role="alert" className="mx-auto max-w-4xl p-6 text-rose">Could not load this record: {err}</p>;
  if (!rec) return <p className="mx-auto max-w-4xl p-6 text-mist">Loading record…</p>;

  const when = (d) => (d ? new Date(d).toLocaleString() : null);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-4xl font-extrabold tracking-tight">Consent #{rec.id}</h1>
        <Link to={`/consents/${rec.id}/edit`} className="btn btn-primary">Edit</Link>
        {user?.role === 'ADMIN' && <button onClick={remove} className="btn-danger">Delete</button>}
      </div>
      <div className="glass rounded-panel p-6">
        <Row k="Subject ID"    v={rec.subjectId} />
        <Row k="Subject email" v={rec.subjectEmail} />
        <Row k="Purpose"       v={rec.purpose} />
        <Row k="Legal basis"   v={rec.legalBasis} />
        <Row k="Consent given" v={rec.consentGiven ? 'Yes' : 'No'} />
        <Row k="Status"        v={<StatusBadge status={rec.status} />} />
        <Row k="Granted at"    v={when(rec.grantedAt)} />
        <Row k="Expires at"    v={when(rec.expiresAt)} />
        <Row k="Withdrawn at"  v={when(rec.withdrawnAt)} />
        <Row k="Source"        v={rec.source} />
        <Row k="Evidence URL"  v={rec.evidenceUrl && <a href={rec.evidenceUrl} className="text-saffron underline" target="_blank" rel="noreferrer">{rec.evidenceUrl}</a>} />
        <Row k="Data categories" v={rec.dataCategories} />
        {rec.aiDescription && <Row k="AI description" v={rec.aiDescription} />}
        {rec.aiScore != null && <Row k="AI score" v={rec.aiScore} />}
      </div>
      <AIPanel record={rec} />
    </div>
  );
}
