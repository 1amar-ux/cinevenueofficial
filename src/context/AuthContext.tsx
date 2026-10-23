import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import apiClient from "../services/apiClient";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
  role?: string;
  isVerified?: boolean;
  profileImageUrl?: string | null;
  theatreId?: string | number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: AuthUser, token?: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<AuthUser>;
  signUp: (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
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
  forgotPassword: async () => ({}),
  resetPassword: async () => {},
  verifyEmail: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

let isBackendSyncing = false;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      const nextUser = response.data?.data?.user ?? null;
      if (nextUser) {
        setUser(nextUser);
        if (nextUser.email) {
          localStorage.setItem("cine_user_email", nextUser.email);
        }
        return;
      }
    } catch {
      // Backend session not active; check if Supabase session is active
    }

    // Do NOT fire parallel /auth/google sync if on /auth/callback route
    // (AuthCallback has its own lifecycle, error handling, and sync management)
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth/callback")) {
      return;
    }

    if (isBackendSyncing) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email && session.access_token) {
        isBackendSyncing = true;
        try {
          const syncRes = await apiClient.post("/auth/google", {
            idToken: session.access_token,
            accessToken: session.access_token,
            supabaseUserId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0],
            profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null
          });
          const syncedUser = syncRes.data?.data?.user ?? null;
          if (syncedUser) {
            setUser(syncedUser);
            localStorage.setItem("cine_user_email", syncedUser.email);
            return;
          }
        } finally {
          isBackendSyncing = false;
        }
      }
    } catch (e) {
      console.warn("Supabase session sync skipped:", e);
    }

    setUser(null);
    localStorage.removeItem("cine_user_email");
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Avoid parallel sync while on the dedicated callback page
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth/callback")) {
        return;
      }
      if (event === "SIGNED_IN" && session?.user?.email) {
        await refreshSession();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("cine_user_email");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const login = (data: AuthUser, token?: string) => {
    setUser(data);
    if (data.email) localStorage.setItem("cine_user_email", data.email);
    if (token) {
      localStorage.setItem("cine_access_token", token);
      localStorage.setItem("cine_auth_token", token);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    const response = await apiClient.post("/auth/login", { identifier, password });
    const authenticatedUser = response.data?.data?.user as AuthUser;
    const token = response.data?.token || response.data?.data?.tokens?.accessToken;
    const refreshToken = response.data?.data?.tokens?.refreshToken;
    if (!authenticatedUser) {
      throw new Error("Authentication response was invalid");
    }
    if (token) {
      localStorage.setItem("cine_access_token", token);
      localStorage.setItem("cine_auth_token", token);
    }
    if (refreshToken) {
      localStorage.setItem("cine_refresh_token", refreshToken);
    }
    setUser(authenticatedUser);
    localStorage.setItem("cine_user_email", authenticatedUser.email);
    return authenticatedUser;
  };

  const signUp = async (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => {
    if (data.confirmPassword && data.confirmPassword !== data.password) {
      throw new Error("Passwords do not match.");
    }
    const response = await apiClient.post("/auth/register", {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
    });
    const token = response.data?.token || response.data?.data?.tokens?.accessToken;
    const refreshToken = response.data?.data?.tokens?.refreshToken;
    if (token) {
      localStorage.setItem("cine_access_token", token);
      localStorage.setItem("cine_auth_token", token);
    }
    if (refreshToken) {
      localStorage.setItem("cine_refresh_token", refreshToken);
    }
    const newUser = response.data?.data?.user;
    if (newUser) {
      setUser(newUser);
      if (newUser.email) localStorage.setItem("cine_user_email", newUser.email);
    } else {
      await refreshSession();
    }
  };

  const signInWithGoogle = async (customRedirectTo?: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Google Sign-In is not configured yet. Please sign in using your Email & Password, or add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel environment variables."
      );
    }

    const origin = typeof window !== "undefined" ? window.location.origin.replace("://www.", "://") : "https://cinevenue.com";
    const callbackUrl = customRedirectTo || `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        scopes: "openid email profile",
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  };

  const verifyEmail = async (token: string) => {
    await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  };

  const logout = async () => {
    try {
      await Promise.allSettled([
        apiClient.post("/auth/logout", {}),
        supabase.auth.signOut()
      ]);
    } finally {
      setUser(null);
      localStorage.removeItem("cine_user_email");
      localStorage.removeItem("cine_access_token");
      localStorage.removeItem("cine_auth_token");
      localStorage.removeItem("cine_refresh_token");
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
