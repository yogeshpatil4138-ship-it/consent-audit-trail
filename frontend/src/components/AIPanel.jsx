import { useState } from 'react';
import api from '../services/api';

export default function AIPanel({ record }) {
  const [describe, setDescribe] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const callDescribe = async () => {
    setLoading('describe'); setError(null);
    try {
      const { data } = await api.post('/api/ai/describe', {
        subject: record.subjectId, purpose: record.purpose, legal_basis: record.legalBasis
      });
      setDescribe(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(null); }
  };

  const callRecommend = async () => {
    setLoading('recommend'); setError(null);
    try {
      const { data } = await api.post('/api/ai/recommend', {
        subject: record.subjectId, purpose: record.purpose, status: record.status
      });
      setRecs(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(null); }
  };

  return (
    <div className="glass rounded-panel p-6">
      <h3 className="mb-3 text-xl font-bold">AI assistant</h3>
      <div className="flex gap-2 flex-wrap">
        <button onClick={callDescribe} disabled={!!loading}
                className="btn-primary">
          {loading === 'describe' ? 'Describing…' : 'Describe'}
        </button>
        <button onClick={callRecommend} disabled={!!loading}
                className="btn-ghost">
          {loading === 'recommend' ? 'Working…' : 'Recommend'}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">Error: {error}</p>}
      {describe && (
        <div className="mt-4 border-l-2 border-seal pl-3">
          <p className="text-sm text-paper/90">{describe.description}</p>
          {describe.compliance_score != null && (
            <span className="inline-block mt-2 badge bg-seal/10 text-seal">
              Compliance score: {describe.compliance_score}
              {describe.is_fallback && ' (fallback)'}
            </span>
          )}
        </div>
      )}
      {recs?.recommendations && (
        <ul className="mt-4 space-y-2">
          {recs.recommendations.map((r, i) => (
            <li key={i} className="border-l-2 border-sky pl-3">
              <span className="font-semibold text-saffron">{r.priority}</span> {r.action_type}: {r.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
