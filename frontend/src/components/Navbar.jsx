import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded ${isActive ? 'bg-brand-dark text-white' : 'text-white/90 hover:bg-brand-light'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="bg-brand text-white shadow">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between px-4 py-2">
        <Link to="/" className="font-bold text-lg">Consent Audit Trail</Link>
        {user && (
          <div className="flex gap-1 items-center flex-wrap">
            <NavLink to="/" end className={linkCls}>Dashboard</NavLink>
            <NavLink to="/consents" className={linkCls}>Consents</NavLink>
            <NavLink to="/consents/new" className={linkCls}>New</NavLink>
            <NavLink to="/analytics" className={linkCls}>Analytics</NavLink>
            <span className="mx-3 text-sm">{user.username} ({user.role})</span>
            <button onClick={() => { logout(); nav('/login'); }}
                    className="bg-white text-brand px-3 py-1 rounded font-semibold">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
