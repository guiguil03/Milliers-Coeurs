import React, { createContext, useContext, ReactNode } from 'react';
import { usePostgresAuth } from '../hooks/usePostgresAuth';
import { UserData, LoginCredentials } from '../services/postgresAuthService';

interface PostgresAuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (userData: UserData) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const PostgresAuthContext = createContext<PostgresAuthContextType | undefined>(undefined);

export function PostgresAuthProvider({ children }: { children: ReactNode }) {
  const auth = usePostgresAuth();

  return (
    <PostgresAuthContext.Provider value={auth}>
      {children}
    </PostgresAuthContext.Provider>
  );
}

export function usePostgresAuthContext() {
  const context = useContext(PostgresAuthContext);
  if (context === undefined) {
    throw new Error('usePostgresAuthContext doit être utilisé dans un PostgresAuthProvider');
  }
  return context;
}
