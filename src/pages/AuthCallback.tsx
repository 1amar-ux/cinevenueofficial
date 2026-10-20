import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import CineVenueLogo from "../components/CineVenueLogo";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

interface ExtractedAuth {
  accessToken: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  supabaseUserId: string;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login, refreshSession, signInWithGoogle } = useContext(AuthContext);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [detailedError, setDetailedError] = useState("");
  const [currentStepText, setCurrentStepText] = useState("Initializing secure authentication...");
  const [progressPercent, setProgressPercent] = useState(15);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  useEffect(() => {
    let hasRedirected = false;
    let isFetching = false;
    let elapsedMs = 0;

    // Smoothly animate progress bar so it never stays at 0%
    const progressTimer = setInterval(() => {
      elapsedMs += 200;
      if (hasRedirected) return;

      setProgressPercent((prev) => {
        if (prev < 40) return prev + 5;
        if (prev < 75) return prev + 2;
        if (prev < 92) return prev + 1;
        return prev;
      });
    }, 200);

    // Extract auth from URL hash or initial captured hash
    function getAuthFromUrl(): ExtractedAuth | null {
      try {
        const rawHash =
          window.location.hash ||
          (window as any).__INITIAL_OAUTH_HASH__ ||
          "";
        if (rawHash) {
          const cleanHash = rawHash.startsWith("#") ? rawHash.substring(1) : rawHash;
          const hashParams = new URLSearchParams(cleanHash);

          const oauthError = hashParams.get("error");
          if (oauthError) {
            const errorDesc = hashParams.get("error_description") || oauthError;
            throw new Error(`[Step: OAuth Provider] ${errorDesc}`);
          }

          const token = hashParams.get("access_token");
          if (token) {
            const payload = decodeJwtPayload(token) || {};
            const email = payload.email || payload.user_metadata?.email || "";
            const name =
              payload.user_metadata?.full_name ||
              payload.user_metadata?.name ||
              (email ? email.split("@")[0] : "Google User");
            const avatar =
              payload.user_metadata?.avatar_url ||
              payload.user_metadata?.picture ||
              null;
            const userId = payload.sub || "";

            return {
              accessToken: token,
              email,
              name,
              profileImageUrl: avatar,
              supabaseUserId: userId
            };
          }
        }

        const rawSearch =
          window.location.search ||
          (window as any).__INITIAL_OAUTH_SEARCH__ ||
          "";
        if (rawSearch) {
          const searchParams = new URLSearchParams(rawSearch);
          const oauthError = searchParams.get("error");
          if (oauthError) {
            const errorDesc = searchParams.get("error_description") || oauthError;
            throw new Error(`[Step: OAuth Provider] ${errorDesc}`);
          }
        }
      } catch (err: any) {
        throw err;
      }
      return null;
    }

    // Extract auth from localStorage
    function getAuthFromStorage(): ExtractedAuth | null {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) || "";
          if (
            (key.startsWith("sb-") && key.endsWith("-auth-token")) ||
            key.includes("supabase.auth.token") ||
            key.includes("auth-token")
          ) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            const token = parsed.access_token || parsed.session?.access_token;
            const user = parsed.user || parsed.session?.user;
            if (token && (user?.email || parsed.email)) {
              const email = user?.email || parsed.email || "";
              const name =
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                (email ? email.split("@")[0] : "Google User");
              const avatar =
                user?.user_metadata?.avatar_url ||
                user?.user_metadata?.picture ||
                null;
              const userId = user?.id || parsed.user_id || "";
              return {
                accessToken: token,
                email,
                name,
                profileImageUrl: avatar,
                supabaseUserId: userId
              };
            }
          }
        }
      } catch (e) {
        console.debug("Storage check notice:", e);
      }
      return null;
    }

    // Send verified credentials to CineVenue backend and execute redirect
    async function syncAndRedirect(auth: ExtractedAuth) {
      if (hasRedirected || isFetching) return;
      isFetching = true;
      setCurrentStepText("Synchronizing session with CineVenue server...");
      setProgressPercent((p) => Math.max(p, 60));

      try {
        const res = await fetch("/api/v1/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            accessToken: auth.accessToken,
            idToken: auth.accessToken,
            email: auth.email,
            name: auth.name,
            profileImageUrl: auth.profileImageUrl,
            supabaseUserId: auth.supabaseUserId
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || errData.message || (typeof errData.error === "string" ? errData.error : "") || res.statusText || "Server verification failed";
          throw new Error(`[Step: Backend Sync] ${res.status}: ${errMsg}`);
        }

        const json = await res.json().catch(() => ({}));
        const user = json.data?.user || {
          id: auth.supabaseUserId,
          email: auth.email,
          name: auth.name,
          role: "CUSTOMER",
          isVerified: true,
          profileImageUrl: auth.profileImageUrl
        };

        hasRedirected = true;
        setProgressPercent(100);
        setCurrentStepText("Verification complete! Redirecting to platform...");
        setStatus("success");

        if (auth.email) {
          localStorage.setItem("cine_user_email", auth.email);
        }
        if (login) {
          login(user);
        }
        if (refreshSession) {
          refreshSession().catch(() => {});
        }

        // Hard redirect immediately to guarantee navigation
        window.location.replace("/");
      } catch (err: any) {
        isFetching = false;
        console.error("Authentication sync error:", err);
        throw err;
      }
    }

    // Primary check function running every 350ms
    async function checkSession() {
      if (hasRedirected) return;

      try {
        // Source 1: URL Hash
        let auth = getAuthFromUrl();

        // Source 2: localStorage
        if (!auth) {
          auth = getAuthFromStorage();
        }

        // Source 3: Active Supabase Client getSession
        if (!auth) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.access_token && data.session.user?.email) {
              const s = data.session;
              auth = {
                accessToken: s.access_token,
                email: s.user.email,
                name:
                  s.user.user_metadata?.full_name ||
                  s.user.user_metadata?.name ||
                  s.user.email.split("@")[0],
                profileImageUrl:
                  s.user.user_metadata?.avatar_url ||
                  s.user.user_metadata?.picture ||
                  null,
                supabaseUserId: s.user.id
              };
            }
          } catch {}
        }

        if (auth && auth.accessToken) {
          await syncAndRedirect(auth);
          return;
        }

        // Timeout fallback after 6 seconds (6000ms)
        if (elapsedMs >= 6000) {
          if (hasRedirected) return;
          clearInterval(checkInterval);
          clearInterval(progressTimer);

          setStatus("error");
          setErrorMessage(
            "Authentication timed out: unable to detect an active Google OAuth session within 6 seconds."
          );

          const storageKeys = Object.keys(localStorage);
          const relevantKeys = storageKeys.filter(
            (k) =>
              k.includes("sb-") ||
              k.includes("token") ||
              k.includes("auth") ||
              k.includes("cine")
          );
          const initialHash = (window as any).__INITIAL_OAUTH_HASH__ || "(empty)";
          const currentHash = window.location.hash || "(empty)";
          const search =
            window.location.search ||
            (window as any).__INITIAL_OAUTH_SEARCH__ ||
            "(empty)";

          let sbSessionStatus = "none";
          try {
            const { data } = await supabase.auth.getSession();
            sbSessionStatus = data?.session
              ? `active (user=${data.session.user?.email})`
              : "null";
          } catch (e: any) {
            sbSessionStatus = `error: ${e?.message || e}`;
          }

          const diagnostic = `[Diagnostic Dump] URL: ${window.location.href} | InitialHash: ${initialHash} | CurrentHash: ${currentHash} | Search: ${search} | SupabaseSession: ${sbSessionStatus} | StorageKeys: [${relevantKeys.join(", ")}]`;
          setDetailedError(diagnostic);
        }
      } catch (err: any) {
        if (hasRedirected) return;
        clearInterval(checkInterval);
        clearInterval(progressTimer);
        setStatus("error");
        const msg = err?.message || "Google authentication failed.";
        setErrorMessage(msg);
        setDetailedError(msg);
      }
    }

    // Attach Supabase auth listener as an immediate event trigger
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (hasRedirected) return;
        if (session?.access_token && session.user?.email) {
          try {
            await syncAndRedirect({
              accessToken: session.access_token,
              email: session.user.email,
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email.split("@")[0],
              profileImageUrl:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                null,
              supabaseUserId: session.user.id
            });
          } catch (err: any) {
            setStatus("error");
            setErrorMessage(err?.message || "Failed to complete authentication");
            setDetailedError(err?.message || "");
          }
        }
      }
    );

    // Initial check immediately, then poll every 350ms
    checkSession();
    const checkInterval = setInterval(checkSession, 350);

    return () => {
      clearInterval(checkInterval);
      clearInterval(progressTimer);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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

            {/* Visual Animated Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden my-3 p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-500 via-gold to-yellow-300 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-gold/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1">
              <span className="truncate max-w-[80%]">{currentStepText}</span>
              <span className="text-gold font-bold shrink-0">{progressPercent}%</span>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-white">Welcome to CineVenue!</h2>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden my-3">
              <div className="bg-emerald-400 h-full w-full rounded-full" />
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              Authentication successful. Redirecting to platform...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-2 text-left">
            <div className="flex items-center gap-3 justify-center text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
              <h2 className="text-lg font-bold text-white">Google Authentication Notice</h2>
            </div>

            <div className="text-xs text-rose-300 leading-relaxed bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
              {errorMessage}
            </div>

            {detailedError && (
              <p className="text-[11px] font-mono text-white/50 bg-black/40 border border-white/5 rounded-lg p-2.5 break-all">
                Detail: {detailedError}
              </p>
            )}

            {/* Safe UI Navigation Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithGoogle?.();
                  } catch {
                    navigate("/?auth=signin", { replace: true });
                  }
                }}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/20"
              >
                <span>Retry Google</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/?auth=signin", { replace: true })}
                className="w-full py-2.5 px-3 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-gold/20"
              >
                <span>Email / Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.replace("/")}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
              >
                <span>Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapsible Supabase / Google Setup Instructions for Admin */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="text-[11px] text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>
                  {showConfigHelp
                    ? "Hide Configuration Guide"
                    : "How to fix this in Supabase & Google Console"}
                </span>
              </button>

              {showConfigHelp && (
                <div className="mt-2.5 text-[11px] text-white/70 space-y-2.5 bg-white/5 border border-white/10 rounded-xl p-3.5 text-left">
                  <div>
                    <p className="font-semibold text-gold">
                      1. Add Authorized Redirect URI in Google Cloud Console:
                    </p>
                    <p className="text-white/60 mt-0.5">
                      Go to <b>console.cloud.google.com</b> &gt; <b>APIs &amp; Services</b> &gt;{" "}
                      <b>Credentials</b> &gt; click your <b>OAuth 2.0 Client ID</b>. Under{" "}
                      <b>Authorized redirect URIs</b>, ensure this exact URL is present:
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <code className="flex-1 bg-black/60 text-emerald-400 p-2 rounded text-[11px] select-all break-all font-mono">
                        https://mpeedjoyvimegnmymweb.supabase.co/auth/v1/callback
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            "https://mpeedjoyvimegnmymweb.supabase.co/auth/v1/callback"
                          );
                          alert("Supabase callback URL copied to clipboard!");
                        }}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gold">
                      2. Verify Client Secret in Supabase Dashboard:
                    </p>
                    <p className="text-white/60 mt-0.5">
                      In <b>supabase.com/dashboard</b> &gt; select project{" "}
                      <b>mpeedjoyvimegnmymweb</b> &gt; <b>Authentication</b> &gt; <b>Providers</b> &gt;{" "}
                      <b>Google</b>: verify that the <b>Client ID</b> and <b>Client Secret</b> match
                      the values in your Google Cloud Console.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gold">
                      3. Google OAuth Consent Screen Status:
                    </p>
                    <p className="text-white/60 mt-0.5">
                      If your Google OAuth Consent screen is in <b>Testing</b> mode, make sure your
                      test account is added under <b>Test users</b> in Google Cloud Console, or
                      click <b>Publish App</b>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
