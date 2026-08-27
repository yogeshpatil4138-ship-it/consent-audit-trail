import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const LEGAL_BASES = ['Consent', 'Contract', 'Legal Obligation', 'Legitimate Interest', 'Vital Interests', 'Public Task'];

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

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editing ? 'Edit consent' : 'New consent'}</h1>
      <form onSubmit={submit} className="space-y-4 bg-white p-5 rounded-lg shadow">
        <Field label="Subject ID*">
          <input required value={form.subjectId} onChange={e => set('subjectId', e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </Field>
        <Field label="Subject email">
          <input type="email" value={form.subjectEmail} onChange={e => set('subjectEmail', e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </Field>
        <Field label="Purpose*">
          <textarea required value={form.purpose} onChange={e => set('purpose', e.target.value)}
                    rows="2" className="w-full border rounded px-3 py-2" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Legal basis*">
            <select value={form.legalBasis} onChange={e => set('legalBasis', e.target.value)}
                    className="w-full border rounded px-3 py-2">
              {LEGAL_BASES.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Source">
            <input value={form.source} onChange={e => set('source', e.target.value)}
                   className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Granted at">
            <input type="datetime-local" value={form.grantedAt} onChange={e => set('grantedAt', e.target.value)}
                   className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Expires at">
            <input type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)}
                   className="w-full border rounded px-3 py-2" />
          </Field>
        </div>
        <Field label="Evidence URL">
          <input value={form.evidenceUrl} onChange={e => set('evidenceUrl', e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </Field>
        <Field label="Data categories (comma-separated)">
          <input value={form.dataCategories} onChange={e => set('dataCategories', e.target.value)}
                 className="w-full border rounded px-3 py-2" placeholder="email,name,location" />
        </Field>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.consentGiven}
                 onChange={e => set('consentGiven', e.target.checked)} />
          Consent given
        </label>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50">
            {busy ? 'Saving…' : (editing ? 'Save changes' : 'Create')}
          </button>
          <button type="button" onClick={() => nav(-1)} className="bg-white border px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
