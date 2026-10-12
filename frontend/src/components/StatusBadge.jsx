const STYLES = {
  ACTIVE:    { dot: 'bg-seal',    text: 'text-seal',    bg: 'bg-seal/10' },
  PENDING:   { dot: 'bg-sky',     text: 'text-sky',     bg: 'bg-sky/10' },
  EXPIRED:   { dot: 'bg-saffron', text: 'text-saffron', bg: 'bg-saffron/10' },
  WITHDRAWN: { dot: 'bg-rose',    text: 'text-rose',    bg: 'bg-rose/10' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] || { dot: 'bg-mist', text: 'text-mist', bg: 'bg-white/5' };
  return (
    <span className={`badge ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : '—'}
    </span>
  );
}
