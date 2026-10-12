import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const LEGAL_BASES = ['Consent', 'Contract', 'Legal Obligation', 'Legitimate Interest', 'Vital Interests', 'Public Task'];

// Defined at module level: declaring this inside ConsentForm remounted every input on each
// keystroke, which dropped focus after one character.
const Field = ({ label, children }) => (
  <label className="block">
    <span className="label">{label}</span>
    <div className="mt-1.5">{children}</div>
  </label>
);

export default function ConsentForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const [form, setForm] = useState({
    subjectId: '', subjectEmail: '', purpose: '', legalBasis: 'Consent',
    consentGiven: true, grantedAt: '', expiresAt: '', source: 'web-signup',
    evidenceUrl: '', dataCategories: '',
  });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/api/consents/${id}`).then(r => {
      const c = r.data;
      setForm({
        subjectId: c.subjectId, subjectEmail: c.subjectEmail || '',
        purpose: c.purpose, legalBasis: c.legalBasis, consentGiven: c.consentGiven,
        grantedAt: c.grantedAt?.slice(0, 16) || '',
        expiresAt: c.expiresAt?.slice(0, 16) || '',
        source: c.source || '', evidenceUrl: c.evidenceUrl || '',
        dataCategories: c.dataCategories || '',
      });
    });
  }, [id, editing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const payload = { ...form,
      grantedAt: form.grantedAt || null,
      expiresAt: form.expiresAt || null };
    try {
      if (editing) await api.put(`/api/consents/${id}`, payload);
      else         await api.post('/api/consents', payload);
      nav('/consents');
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-5 text-4xl font-extrabold tracking-tight">{editing ? 'Edit consent' : 'New consent'}</h1>
      <form onSubmit={submit} className="glass space-y-5 rounded-panel p-6">
        <Field label="Subject ID (required)">
          <input required value={form.subjectId} onChange={e => set('subjectId', e.target.value)} className="input" />
        </Field>
        <Field label="Subject email">
          <input type="email" value={form.subjectEmail} onChange={e => set('subjectEmail', e.target.value)} className="input" />
        </Field>
        <Field label="Purpose (required)">
          <textarea required value={form.purpose} onChange={e => set('purpose', e.target.value)} rows="2" className="input" />
        </Field>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Legal basis (required)">
            <select value={form.legalBasis} onChange={e => set('legalBasis', e.target.value)} className="input">
              {LEGAL_BASES.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Source">
            <input value={form.source} onChange={e => set('source', e.target.value)} className="input" />
          </Field>
          <Field label="Granted at">
            <input type="datetime-local" value={form.grantedAt} onChange={e => set('grantedAt', e.target.value)} className="input" />
          </Field>
          <Field label="Expires at">
            <input type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="Evidence URL">
          <input value={form.evidenceUrl} onChange={e => set('evidenceUrl', e.target.value)} className="input" />
        </Field>
        <Field label="Data categories (comma-separated)">
          <input value={form.dataCategories} onChange={e => set('dataCategories', e.target.value)}
                 className="input" placeholder="email, name, location" />
        </Field>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" className="h-4 w-4 accent-saffron" checked={form.consentGiven}
                 onChange={e => set('consentGiven', e.target.checked)} />
          Consent given
        </label>
        {err && <p role="alert" className="rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">{err}</p>}
        <div className="flex gap-3">
          <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : (editing ? 'Save changes' : 'Create consent')}</button>
          <button type="button" onClick={() => nav(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
