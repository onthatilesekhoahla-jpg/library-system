import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lib_session')) || null; } catch { return null; }
  });
  const login = (result) => {
    const next = { user: result.user, token: result.token };
    setSession(next);
    localStorage.setItem('lib_session', JSON.stringify(next));
    localStorage.removeItem('lib_user');
  };
  const logout = () => { setSession(null); localStorage.removeItem('lib_session'); localStorage.removeItem('lib_user'); };
  return <AuthContext.Provider value={{ user: session?.user || null, token: session?.token || null, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
