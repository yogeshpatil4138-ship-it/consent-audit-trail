import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cat_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('cat_token', data.token);
    localStorage.setItem('cat_user', JSON.stringify({ username: data.username, role: data.role }));
    setUser({ username: data.username, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('cat_token');
    localStorage.removeItem('cat_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
