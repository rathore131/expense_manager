import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API } from "@/lib/api";

interface User {
  id: string;
  email: string;
  has_completed_onboarding: number;
  user_metadata: { full_name: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string; otp?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<string | null>;
  forgotPassword: (email: string) => Promise<{ error?: string; dev_otp?: string | null }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session
    const token = localStorage.getItem('supabase-auth-token');
    if (token) {
      API.get('/auth/me')
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('supabase-auth-token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const data = await API.post('/auth/login', { email, password });
      localStorage.setItem('supabase-auth-token', data.access_token);
      setUser(data.user);
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ error?: string; otp?: string }> => {
    try {
      const data = await API.post('/auth/signup', { name, email, password });
      return { otp: data.otp };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const verifyEmail = async (email: string, otp: string): Promise<string | null> => {
    try {
      await API.post('/auth/verify', { email, otp });
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string; dev_otp?: string | null }> => {
    try {
      const data = await API.post('/auth/forgot-password', { email });
      return { dev_otp: data.dev_otp };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<string | null> => {
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const logout = async () => {
    localStorage.removeItem('supabase-auth-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
