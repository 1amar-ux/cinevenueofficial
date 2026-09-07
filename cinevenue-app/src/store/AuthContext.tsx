import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile } from '../api/authApi';
import { getStoredAuthToken } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  register: (userData: { name: string; email: string; mobile?: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await getStoredAuthToken();
      if (token) {
        const profile = await authApi.getCurrentUser();
        setUser(profile);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }) => {
    setIsLoading(true);
    try {
      await authApi.login(credentials);
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; mobile?: string; password?: string }) => {
    setIsLoading(true);
    try {
      await authApi.register(userData);
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } catch (e) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
