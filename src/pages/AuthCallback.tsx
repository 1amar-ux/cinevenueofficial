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
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [detailedError, setDetailedError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(
          location.hash.startsWith("#") ? location.hash.substring(1) : location.hash
        );

        const code = searchParams.get("code") || hashParams.get("code");
        const oauthError = searchParams.get("error") || hashParams.get("error");
        const oauthErrorDesc =
          searchParams.get("error_description") || hashParams.get("error_description");

        if (oauthError) {
          const detail = oauthErrorDesc || oauthError;
          setDetailedError(detail);
          throw new Error(detail || "Authentication was cancelled or failed with Google.");
        }

        let activeSession = null;

        // 1. If PKCE code is available, exchange it for session
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("Code exchange notice:", exchangeError.message);
            setDetailedError(exchangeError.message);
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
        const rawMsg = err?.message || "";
        if (rawMsg.includes("Unable to exchange external code")) {
          setErrorMessage(
            "Google sign-in could not be completed. The external authorization credentials or redirect URL in your Supabase Auth settings need verification. Please sign in with email/password or contact support."
          );
        } else {
          setErrorMessage(
            rawMsg || "Unable to complete Google authentication. Please try signing in again."
          );
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [location, navigate, refreshSession]);

  return (
    <div className="min-h-screen bg-[var(--cv-bg,#070709)] text-[var(--cv-text-primary,#ffffff)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--cv-card,#0B0B0D)] border border-[var(--cv-border,rgba(255,255,255,0.1))] rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <CineVenueLogo size="md" />
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Completing Google Sign-In</h2>
            <p className="text-xs text-white/60">
              Synchronizing your secure session with CineVenue. Please wait a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-white">Welcome to CineVenue!</h2>
            <p className="text-xs text-emerald-400">
              Authentication successful. Redirecting to platform...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-2 text-left">
            <div className="flex items-center gap-3 justify-center text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
              <h2 className="text-lg font-bold text-white">Authentication Notice</h2>
            </div>

            <div className="text-xs text-rose-300 leading-relaxed bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
              {errorMessage}
            </div>

            {detailedError && (
              <p className="text-[11px] font-mono text-white/50 bg-black/40 border border-white/5 rounded-lg p-2.5 break-all">
                Detail: {detailedError}
              </p>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className="w-full py-2.5 px-4 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-gold/20"
              >
                <span>Sign In with Email</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapsible Supabase / Google Setup Instructions for Admin */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="text-[11px] text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{showConfigHelp ? "Hide" : "How to fix this in Supabase & Google Console"}</span>
              </button>

              {showConfigHelp && (
                <div className="mt-2.5 text-[11px] text-white/70 space-y-2 bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="font-semibold text-gold">1. Google Cloud Console Redirect URI:</p>
                  <p className="text-white/60">
                    In Google Cloud Console &gt; APIs &amp; Services &gt; Credentials &gt; OAuth 2.0 Client ID, add this exact URL to <b>Authorized redirect URIs</b>:
                  </p>
                  <code className="block bg-black/60 text-emerald-400 p-1.5 rounded select-all break-all">
                    https://mpeedjoyvimegnmymweb.supabase.co/auth/v1/callback
                  </code>

                  <p className="font-semibold text-gold mt-2">2. Supabase Dashboard Google Provider:</p>
                  <p className="text-white/60">
                    In Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google, ensure the <b>Client ID</b> and <b>Client Secret</b> match your Google Cloud Console credentials.
                  </p>

                  <p className="font-semibold text-gold mt-2">3. Google OAuth Consent Screen:</p>
                  <p className="text-white/60">
                    If your app is in <b>Testing</b> mode in Google Cloud Console, add your Google email under <b>Test users</b>, or click <b>Publish App</b>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
