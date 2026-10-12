import { useEffect, useState } from 'react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SLICES = [
  { key: 'Active',    color: '#35C3AE', dot: 'bg-seal' },
  { key: 'Pending',   color: '#6EA8FF', dot: 'bg-sky' },
  { key: 'Expired',   color: '#F4A63B', dot: 'bg-saffron' },
  { key: 'Withdrawn', color: '#F0647A', dot: 'bg-rose' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/api/consents/stats').then(r => setStats(r.data)).catch(e => setErr(e.message));
  }, []);

  const values = stats ? {
    Active: stats.active,
    Pending: Math.max(0, stats.total - stats.active - stats.expired - stats.withdrawn),
    Expired: stats.expired,
    Withdrawn: stats.withdrawn,
  } : {};
  const chart = SLICES.map(s => ({ name: s.key, value: values[s.key] ?? 0, color: s.color }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Consent overview</h1>
        <p className="mt-1 text-mist">Live counts across every record in the trail.</p>
      </div>
      {err && <p role="alert" className="rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">Could not load stats: {err}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard label="Total records" value={stats?.total} dot="bg-paper" />
        <KPICard label="Active"    value={stats?.active}    dot="bg-seal" />
        <KPICard label="Expired"   value={stats?.expired}   dot="bg-saffron" />
        <KPICard label="Withdrawn" value={stats?.withdrawn} dot="bg-rose" />
      </div>

      <div className="glass grid gap-6 rounded-panel p-6 md:grid-cols-5">
        <div className="relative md:col-span-2" style={{ height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chart} dataKey="value" nameKey="name" innerRadius={78} outerRadius={118}
                   paddingAngle={3} stroke="none" cornerRadius={5}>
                {chart.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0E1B3D', border: '1px solid rgba(150,180,235,.25)', borderRadius: 12, color: '#E9EEF8' }}
                       itemStyle={{ color: '#E9EEF8' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold">{stats?.total ?? '—'}</span>
            <span className="text-sm text-mist">records</span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 md:col-span-3">
          <h2 className="text-xl font-bold">Where consent stands</h2>
          {SLICES.map((s) => {
            const n = values[s.key] ?? 0;
            const pct = stats?.total ? Math.round((n / stats.total) * 100) : 0;
            return (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.dot}`} />{s.key}</span>
                  <span className="text-mist">{n} · {pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-[width] duration-700"
                       style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
