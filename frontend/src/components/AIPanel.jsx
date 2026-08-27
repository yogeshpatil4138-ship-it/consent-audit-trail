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
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="text-lg font-semibold mb-3">AI Assistant</h3>
      <div className="flex gap-2 flex-wrap">
        <button onClick={callDescribe} disabled={!!loading}
                className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50">
          {loading === 'describe' ? 'Describing…' : 'Describe'}
        </button>
        <button onClick={callRecommend} disabled={!!loading}
                className="bg-brand-light text-white px-4 py-2 rounded disabled:opacity-50">
          {loading === 'recommend' ? 'Working…' : 'Recommend'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}
      {describe && (
        <div className="mt-4 border-l-4 border-brand pl-3">
          <p className="text-sm text-slate-700">{describe.description}</p>
          {describe.compliance_score != null && (
            <span className="inline-block mt-2 bg-brand/10 text-brand px-2 py-0.5 rounded text-xs">
              Compliance score: {describe.compliance_score}
              {describe.is_fallback && ' (fallback)'}
            </span>
          )}
        </div>
      )}
      {recs?.recommendations && (
        <ul className="mt-4 space-y-2">
          {recs.recommendations.map((r, i) => (
            <li key={i} className="border-l-4 border-brand-light pl-3">
              <span className="font-semibold">[{r.priority}]</span> {r.action_type}: {r.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
