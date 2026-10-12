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
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-4xl font-extrabold tracking-tight">AI audit report</h1>
        <button onClick={generate} disabled={busy} className="btn-primary">
          {busy ? 'Generating…' : 'Regenerate report'}
        </button>
      </div>
      {err && <p role="alert" className="rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">Could not generate the report: {err}</p>}
      {report && (
        <div className="glass space-y-5 rounded-panel p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-saffron">{report.title}</h2>
            {report.is_fallback && <span className="badge bg-saffron/10 text-saffron">Fallback response</span>}
          </div>
          <p className="max-w-prose text-lg leading-relaxed">{report.summary}</p>
          {report.overview && <p className="max-w-prose leading-relaxed text-mist">{report.overview}</p>}
          {report.key_items && (
            <div>
              <h3 className="mb-2 font-semibold">Key observations</h3>
              <ul className="space-y-2">
                {report.key_items.map((k, i) => (
                  <li key={i} className="flex gap-2.5 text-paper/90"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-seal" />{k}</li>
                ))}
              </ul>
            </div>
          )}
          {report.recommendations && (
            <div>
              <h3 className="mb-2 font-semibold">Recommendations</h3>
              <ol className="list-decimal space-y-2 pl-6 marker:text-saffron">
                {report.recommendations.map((r, i) => <li key={i} className="pl-1 text-paper/90">{r}</li>)}
              </ol>
            </div>
          )}
          {report.generated_at &&
            <p className="text-xs text-mist">Generated {new Date(report.generated_at).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}
