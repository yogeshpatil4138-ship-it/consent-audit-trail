import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-white/10 text-paper shadow-[inset_0_-2px_0_#F4A63B]'
      : 'text-mist hover:bg-white/5 hover:text-paper'}`;

function Mark() {
  return (
    <svg viewBox="0 0 32 36" className="h-7 w-7" aria-hidden="true">
      <path d="M16 2 L29 7 V18 C29 26 23 31 16 34 C9 31 3 26 3 18 V7 Z" fill="none" stroke="#F4A63B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 18 L14.5 22.5 L22 13" fill="none" stroke="#35C3AE" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-3 z-20 px-4 pt-3">
      <nav className="glass mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-2">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <Mark /> Consent Audit Trail
        </Link>
        {user && (
          <div className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={linkCls}>Dashboard</NavLink>
            <NavLink to="/consents" end className={linkCls}>Consents</NavLink>
            <NavLink to="/consents/new" className={linkCls}>New consent</NavLink>
            <NavLink to="/analytics" className={linkCls}>Analytics</NavLink>
            <span className="mx-2 hidden text-sm text-mist sm:inline">
              {user.username} <span className="badge bg-white/10 text-paper">{user.role}</span>
            </span>
            <button onClick={() => { logout(); nav('/login'); }} className="btn-ghost px-3 py-1.5 text-sm">
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
