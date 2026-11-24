import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, Sparkles, Lock, ArrowLeft, KeyRound } from "lucide-react";
import apiClient from "../services/apiClient";

export interface GlassyOtpVerificationProps {
  identifier: string; // Phone number or email
  onSuccess: (data: { verified: boolean; identifier: string }) => void;
  onCancel?: () => void;
  type?: "VERIFY_ACCOUNT" | "LOGIN" | "SIGNUP" | "RESET_PASSWORD";
  initialDevCode?: string; // Pre-filled in test/dev environments
  apiBaseUrl?: string;
  title?: string;
  subtitle?: string;
  embedded?: boolean; // If true, renders directly without modal backdrop
}

type AnimationPhase = "input" | "verifying" | "orbiting" | "converging" | "burst" | "verified";

export const GlassyOtpVerification: React.FC<GlassyOtpVerificationProps> = ({
  identifier,
  onSuccess,
  onCancel,
  type = "VERIFY_ACCOUNT",
  initialDevCode = "",
  apiBaseUrl = "/api/v1",
  title = "Secure Verification",
  subtitle,
  embedded = false,
}) => {
  // 4 Individual digit values
  const [digits, setDigits] = useState<string[]>(() => {
    if (initialDevCode && initialDevCode.length === 4) {
      return initialDevCode.split("");
    }
    return ["", "", "", ""];
  });

  const [phase, setPhase] = useState<AnimationPhase>("input");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [devCode, setDevCode] = useState<string>(initialDevCode);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first empty input on mount
  useEffect(() => {
    if (phase === "input") {
      const firstEmpty = digits.findIndex((d) => !d);
      const targetIndex = firstEmpty === -1 ? 0 : firstEmpty;
      inputRefs[targetIndex]?.current?.focus();
    }
  }, [phase]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    setErrorMessage(null);

    // Filter only the last typed digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto-advance to next input
    if (index < 3 && char) {
      inputRefs[index + 1]?.current?.focus();
    }

    // Auto-submit if all 4 digits filled
    if (index === 3 && char && next.every((d) => d !== "")) {
      executeVerification(next.join(""));
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Handle pasting full 4-digit OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasteData) return;

    const next = ["", "", "", ""];
    for (let i = 0; i < pasteData.length; i++) {
      next[i] = pasteData[i];
    }
    setDigits(next);

    // Focus appropriate box
    if (pasteData.length < 4) {
      inputRefs[pasteData.length]?.current?.focus();
    } else {
      inputRefs[3]?.current?.blur();
      // Auto verify on 4-digit paste
      executeVerification(pasteData);
    }
  };

  // Request new OTP from backend
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post("/auth/send-otp", {
        identifier,
        type,
      });

      if (response.data?.code) {
        setDevCode(response.data.code);
      }

      setResendCooldown(30);
      setDigits(["", "", "", ""]);
      inputRefs[0]?.current?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
      setErrorMessage(msg || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Execute verification against real backend
  const executeVerification = async (otpOverride?: string) => {
    const code = otpOverride || digits.join("");
    if (code.length !== 4) {
      setErrorMessage("Please enter all 4 digits of your verification code.");
      return;
    }

    setPhase("verifying");
    setErrorMessage(null);

    try {
      const response = await apiClient.post("/auth/verify-otp", {
        identifier,
        otp: code,
      });

      if (response.data?.verified || response.data?.success) {
        // Step 1: Detach and Orbit
        setPhase("orbiting");

        // Step 2: Converge into center after 1100ms of circular orbiting
        setTimeout(() => {
          setPhase("converging");
        }, 1100);

        // Step 3: Burst into glowing verification core
        setTimeout(() => {
          setPhase("burst");
        }, 1750);

        // Step 4: Reveal green checkmark and success state
        setTimeout(() => {
          setPhase("verified");
        }, 2100);

        // Step 5: Notify parent after celebration
        setTimeout(() => {
          onSuccess({ verified: true, identifier });
        }, 3400);
      } else {
        throw new Error(response.data?.message || "Verification could not be confirmed.");
      }
    } catch (err: any) {
      setPhase("input");
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
      setErrorMessage(msg || "Invalid code. Please check your OTP and try again.");
      inputRefs[0]?.current?.focus();
    }
  };

  // Masked destination display
  const displayIdentifier = (() => {
    const clean = identifier.trim();
    if (clean.includes("@")) {
      const [u, d] = clean.split("@");
      return `${u.slice(0, 2)}•••••@${d}`;
    }
    const digitsOnly = clean.replace(/\D/g, "");
    if (digitsOnly.length >= 10) {
      return `+91 ${digitsOnly.slice(0, 2)}••••••${digitsOnly.slice(-2)}`;
    }
    return clean;
  })();

  // Orbital box coordinates (4 points on circle of radius R=52px)
  // Box 0: Top (0° -> 0, -52)
  // Box 1: Right (90° -> 52, 0)
  // Box 2: Bottom (180° -> 0, 52)
  // Box 3: Left (270° -> -52, 0)
  const getOrbitalCoordinates = (index: number) => {
    const angle = (index * 90) * (Math.PI / 180);
    const radius = 54;
    return {
      x: Math.round(Math.cos(angle) * radius),
      y: Math.round(Math.sin(angle) * radius),
    };
  };

  const cardContent = (
    <div className="relative w-full max-w-[420px] rounded-3xl p-7 md:p-8 overflow-hidden bg-[#0c0c10]/80 backdrop-blur-2xl border border-amber-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,215,0,0.25)] text-white select-none">
      {/* Cinematic Ambient Lighting - Gold & Bronze Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 rounded-full bg-gradient-to-br from-amber-500/20 via-yellow-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-tl from-amber-700/25 via-amber-900/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

      {/* Subtle Glass Surface Reflection Line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      {/* Header & Cinevenue Branding */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {onCancel && phase === "input" && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute left-0 top-0 text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-700/15 border border-amber-500/30 mb-3.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-300/90">
            Cinevenue VIP Security
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-b from-white via-amber-100 to-amber-300/80 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-xs text-white/60 mt-1 max-w-[280px]">
          {subtitle || (
            <>
              Enter the 4-digit passkey dispatched to{" "}
              <strong className="text-amber-300 font-mono font-medium">{displayIdentifier}</strong>
            </>
          )}
        </p>

        {/* Development Helper Auto-Fill Chip (Shown in dev when OTP code returned) */}
        {devCode && phase === "input" && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              const code = devCode.slice(0, 4);
              setDigits(code.split(""));
              executeVerification(code);
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-[11px] font-mono text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Dev Auto-Fill:</span>
            <span className="font-bold tracking-wider underline">{devCode}</span>
          </motion.button>
        )}
      </div>

      {/* MAIN INTERACTION ZONE: OTP BOXES OR ORBITING CHOREOGRAPHY */}
      <div className="relative z-10 my-7 min-h-[140px] flex items-center justify-center">
        {/* PHASE A: STANDARD INPUT (4 Glassy Digit Boxes) */}
        {phase === "input" || phase === "verifying" ? (
          <motion.div
            key="input-row"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 md:gap-3.5"
          >
            {digits.map((digit, idx) => {
              const isFilled = Boolean(digit);
              return (
                <div key={idx} className="relative group">
                  {/* Subtle Box Glow when Focused/Filled */}
                  <div
                    className={`pointer-events-none absolute -inset-0.5 rounded-2xl blur-md transition duration-300 ${
                      isFilled
                        ? "bg-gradient-to-br from-amber-400/40 via-yellow-500/30 to-amber-700/20 opacity-100"
                        : "bg-transparent opacity-0 group-hover:opacity-40"
                    }`}
                  />

                  <input
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={phase === "verifying"}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`relative w-14 h-16 md:w-16 md:h-18 text-center font-mono text-2xl md:text-3xl font-extrabold rounded-2xl outline-none transition-all duration-200 select-all cursor-text ${
                      isFilled
                        ? "bg-gradient-to-b from-[#1c1a24] to-[#121118] text-amber-300 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                        : "bg-white/[0.04] text-white border border-white/15 hover:border-amber-500/40 focus:border-amber-400 focus:bg-[#16151e] focus:shadow-[0_0_18px_rgba(212,175,55,0.25)]"
                    }`}
                  />
                </div>
              );
            })}
          </motion.div>
        ) : null}

        {/* PHASE B: SIGNATURE ORBIT & CONVERGENCE CHOREOGRAPHY */}
        <AnimatePresence>
          {phase === "orbiting" || phase === "converging" ? (
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Central Gravitational Core Aura */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: phase === "converging" ? [1, 1.4, 0.8] : [0.8, 1.2, 0.8],
                  opacity: phase === "converging" ? [0.4, 0.8, 1] : [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-500/20 to-amber-600/30 blur-xl pointer-events-none"
              />

              {/* Central Glowing Target Core */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: phase === "converging" ? 1.2 : 0.8 }}
                className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_30px_rgba(212,175,55,0.7)] flex items-center justify-center"
              >
                <Lock className="w-4 h-4 text-black animate-pulse" />
              </motion.div>

              {/* 4 Detached Orbiting Glass Boxes */}
              {digits.map((digit, idx) => {
                const coords = getOrbitalCoordinates(idx);
                return (
                  <motion.div
                    key={`orb-box-${idx}`}
                    initial={{
                      x: (idx - 1.5) * 62,
                      y: 0,
                      scale: 1,
                      rotate: 0,
                      opacity: 1,
                    }}
                    animate={
                      phase === "orbiting"
                        ? {
                            // Circular Orbit around central point
                            x: [
                              coords.x,
                              -coords.y,
                              -coords.x,
                              coords.y,
                              coords.x,
                            ],
                            y: [
                              coords.y,
                              coords.x,
                              -coords.y,
                              -coords.x,
                              coords.y,
                            ],
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.08, 0.96, 1.08, 1],
                          }
                        : {
                            // Converging Phase: Rapid spiral into center (0,0)
                            x: [coords.x, coords.x * 0.4, 0],
                            y: [coords.y, coords.y * 0.4, 0],
                            scale: [1, 0.6, 0.1],
                            rotate: [360, 540, 720],
                            opacity: [1, 0.9, 0],
                          }
                    }
                    transition={
                      phase === "orbiting"
                        ? {
                            duration: 1.1,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }
                        : {
                            duration: 0.65,
                            ease: [0.34, 1.56, 0.64, 1],
                          }
                    }
                    className="absolute w-12 h-14 rounded-xl bg-gradient-to-b from-[#262130] to-[#121118] border border-amber-400 text-amber-300 font-mono text-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.65),inset_0_0_10px_rgba(255,215,0,0.3)] backdrop-blur-lg"
                  >
                    {digit}
                  </motion.div>
                );
              })}
            </div>
          ) : null}
        </AnimatePresence>

        {/* PHASE C & D: ENERGY BURST & ANIMATED GLOWING CHECKMARK */}
        <AnimatePresence>
          {phase === "burst" || phase === "verified" ? (
            <motion.div
              key="verified-orb"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 18,
              }}
              className="relative flex flex-col items-center justify-center"
            >
              {/* Expanding Shockwave Ring on Burst */}
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/80 pointer-events-none"
              />

              {/* Glowing Emerald Green Verification Sphere */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)",
                    "0 0 40px rgba(16, 185, 129, 0.8), 0 0 80px rgba(16, 185, 129, 0.4)",
                    "0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)",
                  ],
                }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg border border-emerald-300/40 relative z-10"
              >
                {/* Smooth Animated SVG Checkmark Drawing */}
                <svg
                  className="w-11 h-11 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M4 12.5L9.5 18L20 6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.15,
                      ease: "easeOut",
                    }}
                  />
                </svg>
              </motion.div>

              {/* Verification Feedback Typography */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-4 text-center space-y-1"
              >
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent tracking-wide">
                  Verified Successfully
                </h3>
                <p className="text-xs text-white/80 max-w-[260px]">
                  Your account has been securely verified.
                </p>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Error Message Display */}
      {errorMessage && phase === "input" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="leading-snug">{errorMessage}</span>
        </motion.div>
      )}

      {/* Primary Action Button (Transforms to "Verified & Secured") */}
      <div className="relative z-10 space-y-3.5">
        <motion.button
          type="button"
          disabled={phase !== "input" || digits.some((d) => !d)}
          onClick={() => executeVerification()}
          animate={
            phase === "verified"
              ? {
                  backgroundColor: "#059669",
                  boxShadow: "0 0 30px rgba(16, 185, 129, 0.65)",
                  scale: [0.98, 1],
                }
              : {}
          }
          className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            phase === "verified"
              ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-emerald-500/40"
              : digits.every((d) => d)
              ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black hover:brightness-110 shadow-amber-500/30 cursor-pointer active:scale-[0.98]"
              : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
          }`}
        >
          {phase === "verifying" ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Verifying Passkey...</span>
            </>
          ) : phase === "orbiting" || phase === "converging" || phase === "burst" ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-black" />
              <span>Securing Session...</span>
            </>
          ) : phase === "verified" ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-base font-extrabold tracking-wide">Verified & Secured</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Passkey</span>
            </>
          )}
        </motion.button>

        {/* Resend OTP & Help Controls */}
        {phase === "input" && (
          <div className="flex items-center justify-between text-xs text-white/50 pt-1">
            <span>Didn't receive code?</span>
            <button
              type="button"
              disabled={resendCooldown > 0 || isResending}
              onClick={handleResend}
              className={`font-medium transition cursor-pointer flex items-center gap-1.5 ${
                resendCooldown > 0
                  ? "text-white/40 cursor-not-allowed"
                  : "text-amber-400 hover:text-amber-300 hover:underline"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? (
                <span>Resend in <strong className="font-mono text-amber-300">{resendCooldown}s</strong></span>
              ) : (
                <span>Resend Code</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {cardContent}
    </div>
  );
};

export default GlassyOtpVerification;
