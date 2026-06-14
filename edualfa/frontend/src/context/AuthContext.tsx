import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/axios';

interface User {
  id: string;
  role: 'admin' | 'student';
  name?: string;
  studentId?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginEntry: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('edualfa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user as User);
      })
      .catch(() => {
        localStorage.removeItem('edualfa_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const loginEntry = (token: string, userData: User) => {
    localStorage.setItem('edualfa_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('edualfa_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user as User);
    } catch {
      // ignore
    }
  };

  return <AuthContext.Provider value={{ user, loading, loginEntry, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
