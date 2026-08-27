export default function KPICard({ label, value, tint = 'bg-brand' }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col">
      <div className={`w-10 h-1 rounded ${tint} mb-2`} />
      <div className="text-3xl font-bold text-slate-800">{value ?? '—'}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
