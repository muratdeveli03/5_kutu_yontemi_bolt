import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, supabase } from '../lib/supabase';

interface AuthContextType {
  student: Student | null;
  isAdmin: boolean;
  login: (code: string) => Promise<boolean>;
  adminLogin: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    const storedAdmin = localStorage.getItem('isAdmin');

    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*', { count: 'exact' })
        .ilike('code', code)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      setStudent(data);
      localStorage.setItem('student', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (password: string): Promise<boolean> => {
    if (password === 'sefer1295') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setStudent(null);
    setIsAdmin(false);
    localStorage.removeItem('student');
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ student, isAdmin, login, adminLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
