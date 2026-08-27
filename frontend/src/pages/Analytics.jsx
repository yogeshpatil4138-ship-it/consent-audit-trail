import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Analytics() {
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const generate = async () => {
    setBusy(true); setErr(null);
    try {
      const { data } = await api.get('/api/consents/report');
      setReport(data);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI-generated audit report</h1>
        <button onClick={generate} disabled={busy}
                className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50">
          {busy ? 'Generating…' : 'Regenerate'}
        </button>
      </div>
      {err && <p className="text-red-600 text-sm">Error: {err}</p>}
      {report && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-brand">{report.title}</h2>
          {report.is_fallback && (
            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">
              Fallback response
            </span>
          )}
          <p className="text-slate-700">{report.summary}</p>
          {report.overview && <p className="text-slate-600">{report.overview}</p>}
          {report.key_items && (
            <div>
              <h3 className="font-semibold mb-1">Key observations</h3>
              <ul className="list-disc pl-6 space-y-1">
                {report.key_items.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
          {report.recommendations && (
            <div>
              <h3 className="font-semibold mb-1">Recommendations</h3>
              <ol className="list-decimal pl-6 space-y-1">
                {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </div>
          )}
          {report.generated_at &&
            <p className="text-xs text-slate-400">Generated {new Date(report.generated_at).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}
