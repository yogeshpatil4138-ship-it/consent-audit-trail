import { useEffect, useState } from 'react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#1B4F8A', '#2E6BAE', '#D97706', '#DC2626'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/api/consents/stats').then(r => setStats(r.data)).catch(e => setErr(e.message));
  }, []);

  const chart = stats ? [
    { name: 'Active',    value: stats.active },
    { name: 'Pending',   value: Math.max(0, stats.total - stats.active - stats.expired - stats.withdrawn) },
    { name: 'Expired',   value: stats.expired },
    { name: 'Withdrawn', value: stats.withdrawn },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      {err && <p className="text-red-600 text-sm">Error: {err}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total records" value={stats?.total} />
        <KPICard label="Active"    value={stats?.active}    tint="bg-emerald-600" />
        <KPICard label="Expired"   value={stats?.expired}   tint="bg-amber-500" />
        <KPICard label="Withdrawn" value={stats?.withdrawn} tint="bg-red-600" />
      </div>
      <div className="bg-white p-5 rounded-lg shadow">
        <h2 className="font-semibold mb-3">Consent status distribution</h2>
        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chart} dataKey="value" nameKey="name" outerRadius={110} label>
                {chart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
