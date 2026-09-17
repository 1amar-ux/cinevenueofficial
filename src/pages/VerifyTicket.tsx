import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  Ticket, 
  User, 
  ArrowLeft, 
  Sparkles,
  QrCode
} from "lucide-react";
import apiClient from "../services/apiClient";

interface VerificationResult {
  success: boolean;
  status: "VALID" | "ALREADY_USED" | "CANCELLED" | "INVALID";
  message: string;
  checkedIn?: boolean;
  ticket?: {
    ticketCode?: string;
    bookingNumber?: string;
    passCode?: string;
    type?: string;
    title?: string;
    venue?: string;
    screen?: string;
    showTime?: string;
    date?: string;
    time?: string;
    ticketCount?: number;
    seats?: string[];
    customerName?: string;
    usedAt?: string;
    scannedBy?: string;
    verifiedAt?: string;
    token?: string;
  };
}

export default function VerifyTicket() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get("token") || "";

  const [tokenInput, setTokenInput] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const verifyToken = async (targetToken: string, doCheckIn: boolean = false) => {
    if (!targetToken.trim()) return;
    if (doCheckIn) setCheckingIn(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/tickets/verify`, {
        params: {
          token: targetToken.trim(),
          checkIn: doCheckIn ? "true" : "false",
          operator: "CineVenue Gate Terminal 1"
        }
      });
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.data) {
        setResult(err.response.data);
      } else {
        setError(err.message || "Failed to reach verification authority.");
      }
    } finally {
      setLoading(false);
      setCheckingIn(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      verifyToken(initialToken);
    }
  }, [initialToken]);

  return (
    <div className="min-h-screen bg-[#07090E] text-text-primary flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-gold transition-colors cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to CineVenue</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-mono text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gate Security</span>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-md bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3 shadow-lg shadow-gold/5">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-wide text-text-primary">
            Ticket <span className="text-gold">Verification</span>
          </h1>
          <p className="text-xs text-text-secondary">
            Authoritative Turnstile & Admission Validator
          </p>
        </div>

        {/* Search / Scan Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            verifyToken(tokenInput);
          }}
          className="space-y-2"
        >
          <div className="relative">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter QR token, Ticket code, or Booking ID"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold text-xs py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-gold/10"
          >
            {loading ? "Authenticating Token..." : "Verify Admission Token"}
          </button>
        </form>

        {/* Error Notice */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Container */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              result.status === "VALID"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : result.status === "ALREADY_USED"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {result.status === "VALID" ? (
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              ) : result.status === "ALREADY_USED" ? (
                <AlertCircle className="w-6 h-6 shrink-0 text-amber-400" />
              ) : (
                <XCircle className="w-6 h-6 shrink-0 text-red-400" />
              )}
              <div>
                <p className="font-bold text-sm uppercase tracking-wider">
                  {result.status === "VALID"
                    ? "ADMISSION VALID"
                    : result.status === "ALREADY_USED"
                    ? "ALREADY SCANNED"
                    : result.status === "CANCELLED"
                    ? "TICKET CANCELLED"
                    : "INVALID TICKET"}
                </p>
                <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                  {result.message}
                </p>
              </div>
            </div>

            {/* Ticket Details */}
            {result.ticket && (
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-text-secondary text-[10px] uppercase font-bold tracking-wider">Reference</span>
                  <span className="font-mono text-gold font-bold">
                    {result.ticket.ticketCode || result.ticket.passCode || result.ticket.bookingNumber || tokenInput}
                  </span>
                </div>

                {result.ticket.title && (
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Movie / Event</span>
                    <span className="font-display font-bold text-sm text-text-primary">
                      {result.ticket.title}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {result.ticket.venue && (
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{result.ticket.venue}</span>
                    </div>
                  )}
                  {(result.ticket.date || result.ticket.showTime) && (
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{result.ticket.date || ""} {result.ticket.showTime || ""}</span>
                    </div>
                  )}
                  {result.ticket.screen && (
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Ticket className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{result.ticket.screen}</span>
                    </div>
                  )}
                  {result.ticket.customerName && (
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <User className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{result.ticket.customerName}</span>
                    </div>
                  )}
                </div>

                {result.ticket.usedAt && (
                  <div className="pt-2 border-t border-white/5 text-[10px] text-amber-400/90 font-mono">
                    Scanned at: {new Date(result.ticket.usedAt).toLocaleString()} ({result.ticket.scannedBy || "Terminal"})
                  </div>
                )}
              </div>
            )}

            {/* Check-In Action Button (Gate Attendant) */}
            {result.status === "VALID" && !result.checkedIn && (
              <button
                type="button"
                onClick={() => verifyToken(tokenInput, true)}
                disabled={checkingIn}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{checkingIn ? "Recording Admission..." : "Admit Patron & Check-In"}</span>
              </button>
            )}

            {result.checkedIn && (
              <div className="text-center py-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                ✓ Check-In Recorded. Patron May Enter.
              </div>
            )}
          </div>
        )}

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-white/5 text-center text-[10px] text-text-muted flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold" />
          <span>Secured by CineVenue Cryptographic Authority</span>
        </div>
      </div>
    </div>
  );
}
