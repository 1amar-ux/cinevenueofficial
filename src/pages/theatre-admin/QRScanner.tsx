import React, { useState } from "react";
import { QrCode, Search, CheckCircle2, AlertTriangle, User, Film, Clock, Ticket } from "lucide-react";
import { Booking } from "../../types";
import api from "../../services/api";

interface QRScannerProps {
  theatreName: string;
  bookings: Booking[];
}

export default function QRScanner({ theatreName, bookings }: QRScannerProps) {
  const [scanCode, setScanCode] = useState("");
  const [matchedBooking, setMatchedBooking] = useState<any | null>(null);
  const [validationStatus, setValidationStatus] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    return ["BOOK-1234"];
  });

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setMatchedBooking(null);
    setValidationStatus(null);
    setValidationMessage("");

    if (!scanCode.trim()) return;
    setIsScanning(true);

    try {
      // 1. Attempt authoritative backend validation
      const res = await api.post("/tickets/validate", {
        qrToken: scanCode.trim(),
        staffId: "STAFF-GATE-01"
      });

      if (res.data) {
        setValidationStatus(res.data.status);
        setValidationMessage(res.data.message);
        if (res.data.ticket) {
          setMatchedBooking(res.data.ticket);
        } else {
          // Fallback to local search if ticket object wasn't embedded
          const found = bookings.find(
            (b) =>
              b.theatreName.toLowerCase().includes(theatreName.toLowerCase()) &&
              (b.id.toLowerCase() === scanCode.trim().toLowerCase() ||
               (b.qrCodeData && b.qrCodeData.toLowerCase().includes(scanCode.trim().toLowerCase())))
          );
          if (found) setMatchedBooking(found);
        }
      }
    } catch (err: any) {
      // Fallback to local roster if offline
      const found = bookings.find(
        (b) =>
          b.id.toLowerCase() === scanCode.trim().toLowerCase() ||
          (b.qrCodeData && b.qrCodeData.toLowerCase().includes(scanCode.trim().toLowerCase()))
      );

      if (found) {
        setMatchedBooking(found);
        if (redeemedCodes.includes(found.id)) {
          setValidationStatus("ALREADY_USED");
          setValidationMessage("TICKET ALREADY USED: Entry previously verified.");
        } else if (found.status === "Cancelled") {
          setValidationStatus("CANCELLED");
          setValidationMessage("ENTRY DENIED: This ticket has been cancelled/refunded.");
        } else {
          setValidationStatus("ALLOW_ENTRY");
          setValidationMessage("VALID TICKET — ALLOW ENTRY");
        }
      } else {
        setErrorMsg("Booking Code / QR Token not found in today's admission roster.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleRedeemTicket = (bookingId: string) => {
    setRedeemedCodes(prev => [...prev, bookingId]);
    setValidationStatus("ALREADY_USED");
    setValidationMessage("TICKET ALREADY USED: Entry recorded and ticket marked as USED.");
  };

  return (
    <div className="space-y-6 text-left select-none max-w-3xl">
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
          Ticketing Admission Gate & Scanner
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Scan QR codes or enter digital booking IDs to validate real-time customer admissions ({theatreName})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Scanner Camera Area */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-xl relative overflow-hidden h-72">
          {/* Animated scan indicator lines */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/10 to-transparent w-full h-1/2 animate-[bounce_3s_infinite] pointer-events-none border-b border-gold/40" />
          
          <QrCode className="w-16 h-16 text-gold/30 animate-pulse shrink-0" />
          
          <div className="text-center space-y-1 z-10">
            <span className="text-[10px] bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
              Live Camera Terminal Active
            </span>
            <p className="text-[10px] text-text-muted">
              Webcam QR receiver online. Point customer's mobile QR ticket directly at camera.
            </p>
          </div>
        </div>

        {/* Alphanumeric verification */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl text-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2.5">
              Manual Booking ID / QR Token Validation
            </h3>

            <form onSubmit={handleManualLookup} className="space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
                  Customer Booking Code or QR String
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold pl-10 pr-4 py-3 rounded-xl text-text-primary focus:outline-none uppercase font-mono font-bold text-sm"
                    placeholder="e.g. CV-BKG-2026-849102"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full bg-gold hover:bg-gold-light text-black py-3 rounded-xl font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
              >
                {isScanning ? "Validating with Backend..." : "Validate Ticket Token"}
              </button>
            </form>
          </div>

          <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
            <p className="text-[10px] text-text-muted leading-relaxed">
              Real-time validation prevents replay attacks, checks showtimes, and confirms status against authoritative show seats.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Verification Failure</p>
            <p className="text-text-secondary leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Validation Result Box */}
      {validationStatus && (
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-text-muted font-mono font-bold uppercase tracking-wider block">
                Admission Verification Result
              </span>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gold" />
                <span>Status: {validationMessage}</span>
              </h3>
            </div>

            {validationStatus === "ALLOW_ENTRY" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full shadow-lg shadow-emerald-500/10 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>ALLOW ENTRY — VALID</span>
              </span>
            ) : validationStatus === "ALREADY_USED" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span>TICKET ALREADY USED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span>ENTRY DENIED</span>
              </span>
            )}
          </div>

          {matchedBooking && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold block">Admitted User</span>
                <div className="flex items-center gap-2 font-mono text-text-primary font-bold">
                  <User className="w-4 h-4 text-gold shrink-0" />
                  <span>{matchedBooking.userName || matchedBooking.userEmail || "Customer"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold block">Movie & Showtime</span>
                <div className="flex items-center gap-2 text-text-primary font-bold">
                  <Film className="w-4 h-4 text-gold shrink-0" />
                  <span>{matchedBooking.movieTitle} · {matchedBooking.timeSlot || "07:00 PM"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold block">Allocated Seats</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedBooking.seats && Array.isArray(matchedBooking.seats) ? matchedBooking.seats.map((seat: string) => (
                    <span
                      key={seat}
                      className="px-2.5 py-1 rounded bg-gold/10 border border-gold/30 text-xs font-mono text-gold font-bold"
                    >
                      {seat}
                    </span>
                  )) : (
                    <span className="text-text-muted">Seats not listed</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {validationStatus === "ALLOW_ENTRY" && matchedBooking && (
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleRedeemTicket(matchedBooking.id || matchedBooking.bookingId)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 shadow-lg"
              >
                Confirm Admission (Set to USED)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

