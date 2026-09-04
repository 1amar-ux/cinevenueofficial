import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import apiClient from "../services/apiClient";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
  role?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<AuthUser>;
  signUp: (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshSession: async () => {},
  signIn: async () => { throw new Error("Auth provider unavailable"); },
  signUp: async () => {},
  signInWithGoogle: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  verifyEmail: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      const nextUser = response.data?.data?.user ?? null;
      setUser(nextUser);
      if (nextUser?.email) {
        localStorage.setItem("cine_user_email", nextUser.email);
      }
    } catch {
      setUser(null);
      localStorage.removeItem("cine_user_email");
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = (data: AuthUser) => {
    setUser(data);
    if (data.email) localStorage.setItem("cine_user_email", data.email);
  };

  const signIn = async (identifier: string, password: string) => {
    const response = await apiClient.post("/auth/login", { identifier, password });
    const authenticatedUser = response.data?.data?.user as AuthUser;
    if (!authenticatedUser) {
      throw new Error("Authentication response was invalid");
    }
    setUser(authenticatedUser);
    localStorage.setItem("cine_user_email", authenticatedUser.email);
    return authenticatedUser;
  };

  const signUp = async (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => {
    if (data.confirmPassword && data.confirmPassword !== data.password) {
      throw new Error("Passwords do not match.");
    }
    await apiClient.post("/auth/register", {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
    });
    await refreshSession();
  };

  const signInWithGoogle = async () => {
    window.location.href = "/api/v1/auth/google";
  };

  const forgotPassword = async (email: string) => {
    await apiClient.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  };

  const verifyEmail = async (token: string) => {
    await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } finally {
      setUser(null);
      localStorage.removeItem("cine_user_email");
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshSession,
    signIn,
    signUp,
    signInWithGoogle,
    forgotPassword,
    resetPassword,
    verifyEmail,
  }), [user, loading, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
