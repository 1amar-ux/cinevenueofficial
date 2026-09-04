import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import apiClient from "../services/apiClient";
import { AuthContext } from "../context/AuthContext";
import CineVenueLogo from "../components/CineVenueLogo";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useContext(AuthContext);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        const oauthError = searchParams.get("error");
        const oauthErrorDesc = searchParams.get("error_description");

        if (oauthError) {
          throw new Error(oauthErrorDesc || oauthError || "Authentication was cancelled or failed with Google.");
        }

        let activeSession = null;

        // 1. If PKCE code is in query string, exchange it for session
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("Code exchange notice:", exchangeError.message);
          } else if (data?.session) {
            activeSession = data.session;
          }
        }

        // 2. If session wasn't obtained from exchange, check active Supabase session
        if (!activeSession) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            throw sessionError;
          }
          activeSession = sessionData?.session;
        }

        // 3. Verify authenticated user
        if (!activeSession?.user) {
          throw new Error("No authenticated session was returned from Google.");
        }

        const user = activeSession.user;
        const email = user.email || "";
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (email ? email.split("@")[0] : "Google User");
        const image =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // 4. Synchronize profile with CineVenue backend database
        try {
          await apiClient.post("/auth/google", {
            email,
            name,
            image,
            supabaseUserId: user.id
          });
        } catch (syncErr: any) {
          console.warn("Backend profile sync notice:", syncErr?.message || syncErr);
        }

        // 5. Establish local state
        if (email) {
          localStorage.setItem("cine_user_email", email);
        }

        if (refreshSession) {
          await refreshSession();
        }

        if (!isMounted) return;
        setStatus("success");

        // 6. Smooth redirect to home
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);

      } catch (err: any) {
        if (!isMounted) return;
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMessage(
          err?.message || "Unable to complete Google authentication. Please try signing in again."
        );
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [location, navigate, refreshSession]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B0B0D] border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <CineVenueLogo size="md" />
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Completing Google Sign-In</h2>
            <p className="text-xs text-white/50">
              Synchronizing your secure session with CineVenue. Please wait a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-white">Welcome to CineVenue!</h2>
            <p className="text-xs text-emerald-300">
              Authentication successful. Redirecting to platform...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Authentication Notice</h2>
            <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              {errorMessage}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="w-full py-3 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/15"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
