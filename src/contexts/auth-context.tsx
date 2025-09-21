
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockLogin, mockSignup, mockLogout, mockGetSession, type User, type SignupData, type UserRole } from '@/lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


export type { User, SignupData, UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (data: SignupData) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const sessionUser = await mockGetSession();
      setUser(sessionUser);
      setLoading(false);
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const loggedInUser = await mockLogin(email, password);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    const newUser = await mockSignup(data);
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = async () => {
    await mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
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
