'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthUser, logout as logoutFn, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    setLoading(false);

    if (!authUser && pathname !== '/login') {
      router.replace('/login');
    } else if (authUser && pathname === '/login') {
      router.replace('/');
    }
  }, [pathname, router]);

  const logout = () => {
    logoutFn();
    setUser(null);
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
