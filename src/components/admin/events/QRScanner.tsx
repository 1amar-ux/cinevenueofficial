import React, { useState } from 'react';
import {
  Scan,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Ticket,
  Calendar,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  validatePass,
  validateAndCheckInTicket,
  reverseCheckInTicket,
  getBookingPassId,
} from '../../../services/eventBookingService';
import type { EventBookingRecord } from '../../../types/eventBooking';

type ScanPhase = 'idle' | 'valid_preview' | 'checked_in_success' | 'already_checked_in' | 'cancelled' | 'invalid';

export default function QRScanner() {
  const [passInput, setPassInput] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [currentBooking, setCurrentBooking] = useState<EventBookingRecord | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const handleScanOrLookup = (identifier: string) => {
    if (!identifier.trim()) return;

    const result = validatePass(identifier.trim());

    if (result.status === 'VALID' && result.booking) {
      setCurrentBooking(result.booking);
      setPhase('valid_preview');
      setFeedbackMessage('Pass verified. Ready to check in attendee.');
    } else if (result.status === 'ALREADY_CHECKED_IN' && result.booking) {
      setCurrentBooking(result.booking);
      setCheckInTime(result.checkedInAt || result.booking.checkedInAt || 'Earlier today');
      setPhase('already_checked_in');
      setFeedbackMessage('This pass has already been checked in. Duplicate entry prohibited.');
    } else if (result.status === 'CANCELLED' && result.booking) {
      setCurrentBooking(result.booking);
      setPhase('cancelled');
      setFeedbackMessage('Pass has been cancelled or refunded. Access Denied!');
    } else {
      setCurrentBooking(null);
      setPhase('invalid');
      setFeedbackMessage('No valid ticket found matching this pass or QR reference.');
    }
  };

  const handlePerformCheckIn = () => {
    if (!currentBooking) return;
    const passId = getBookingPassId(currentBooking);
    const res = validateAndCheckInTicket(passId, 'Event Admin');

    if (res.success && res.booking) {
      setCurrentBooking(res.booking);
      setCheckInTime(res.booking.checkedInAt || new Date().toLocaleTimeString());
      setPhase('checked_in_success');
      setFeedbackMessage(res.message);
    } else {
      setFeedbackMessage(res.message);
    }
  };

  const handleReverseCheckIn = () => {
    if (!currentBooking) return;
    const passId = getBookingPassId(currentBooking);
    const res = reverseCheckInTicket(passId, 'Event Admin');
    if (res.success && res.booking) {
      setCurrentBooking(res.booking);
      setPhase('valid_preview');
      setFeedbackMessage('Check-in status reversed. Attendee is now NOT CHECKED-IN.');
    }
  };

  const resetScanner = () => {
    setPassInput('');
    setPhase('idle');
    setCurrentBooking(null);
    setCheckInTime('');
    setFeedbackMessage('');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <span>Event Entry</span>
            <span className="text-gold">QR Scanner</span>
          </h3>
          <p className="text-xs text-text-secondary">
            Scan attendee vertical passes or enter Pass ID to validate and record gate check-in.
          </p>
        </div>

        {/* Scanner Viewfinder Box */}
        <div
          onClick={() => handleScanOrLookup(passInput || 'CV-EVT-2026-000184')}
          className="w-full max-w-md h-56 bg-black border-2 border-dashed border-emerald-500/50 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-emerald-400 transition-colors shadow-2xl"
        >
          <Scan className="w-14 h-14 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
            Scanner Active • Tap to Simulate Scan
          </span>
          <span className="text-white/40 text-[10px] mt-1">Supports camera QR feeds and 2D barcode wands</span>
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/60 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        {/* Quick Test Demo Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-text-muted text-[10px] uppercase font-bold">Quick Test Passes:</span>
          <button
            onClick={() => {
              setPassInput('CV-EVT-2026-000184');
              handleScanOrLookup('CV-EVT-2026-000184');
            }}
            className="bg-white/5 hover:bg-white/15 text-gold border border-gold/30 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
          >
            CV-EVT-2026-000184 (Paid VIP)
          </button>
          <button
            onClick={() => {
              setPassInput('CV-EVT-2026-000219');
              handleScanOrLookup('CV-EVT-2026-000219');
            }}
            className="bg-white/5 hover:bg-white/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
          >
            CV-EVT-2026-000219 (Free Pass)
          </button>
          <button
            onClick={() => {
              setPassInput('CV-EVT-2026-000142');
              handleScanOrLookup('CV-EVT-2026-000142');
            }}
            className="bg-white/5 hover:bg-white/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
          >
            CV-EVT-2026-000142 (Checked-In Duplicate)
          </button>
          <button
            onClick={() => {
              setPassInput('CV-EVT-2026-000108');
              handleScanOrLookup('CV-EVT-2026-000108');
            }}
            className="bg-white/5 hover:bg-white/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
          >
            CV-EVT-2026-000108 (Cancelled)
          </button>
        </div>

        {/* Manual Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScanOrLookup(passInput);
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Enter Pass ID (e.g. CV-EVT-2026-000184)"
              className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            className="bg-gold hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Verify Pass
          </button>
        </form>

        {/* Scan Results Sections */}

        {/* 15. PASS VALID: READY FOR CHECK-IN */}
        {phase === 'valid_preview' && currentBooking && (
          <div className="max-w-md mx-auto bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-6 text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-emerald-400 border-b border-emerald-500/20 pb-3">
              <CheckCircle2 className="w-7 h-7 shrink-0" />
              <div>
                <h4 className="font-black text-lg tracking-wide uppercase">PASS VALID</h4>
                <p className="text-xs text-emerald-300">Verified official pass. Ready for gate admission.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-text-muted font-bold">Event:</span>
                <span className="font-bold text-white text-right">{currentBooking.eventTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-text-muted font-bold">Pass Holder:</span>
                <span className="font-bold text-white">{currentBooking.primaryAttendee.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-text-muted font-bold">Pass Type:</span>
                <span className="font-bold text-amber-300">{currentBooking.ticketTypeName || 'VIP'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-text-muted font-bold">Pass ID:</span>
                <span className="font-mono font-bold text-gold">{getBookingPassId(currentBooking)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted font-bold">Status:</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  NOT CHECKED-IN
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePerformCheckIn}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> [CHECK IN]
              </button>
              <button
                onClick={resetScanner}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Scan Next
              </button>
            </div>
          </div>
        )}

        {/* 15. AFTER CHECK-IN: STATUS: CHECKED-IN */}
        {phase === 'checked_in_success' && currentBooking && (
          <div className="max-w-md mx-auto bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl p-6 text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-black text-xl tracking-wider uppercase">STATUS: CHECKED-IN</h4>
                <p className="text-xs text-white/80">Gate entry granted. Pass marked as attended.</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 space-y-2 text-xs border border-white/10">
              <div className="flex justify-between">
                <span className="text-text-muted">Attendee:</span>
                <span className="font-bold text-white">{currentBooking.primaryAttendee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pass ID:</span>
                <span className="font-mono text-gold font-bold">{getBookingPassId(currentBooking)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">CHECK-IN TIME:</span>
                <span className="font-bold text-emerald-400">{checkInTime || currentBooking.checkedInAt}</span>
              </div>
            </div>

            <button
              onClick={resetScanner}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
            >
              Scan Another Pass
            </button>
          </div>
        )}

        {/* 16. DUPLICATE SCANNING PROTECTION: ALREADY CHECKED-IN */}
        {phase === 'already_checked_in' && currentBooking && (
          <div className="max-w-md mx-auto bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-6 text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-amber-400 border-b border-amber-500/20 pb-3">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-black text-xl tracking-wider uppercase">ALREADY CHECKED-IN</h4>
                <p className="text-xs text-amber-200">Duplicate entry attempt detected!</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 space-y-2 text-xs border border-white/10">
              <div className="flex justify-between">
                <span className="text-text-muted">Pass ID:</span>
                <span className="font-mono text-gold font-bold">{getBookingPassId(currentBooking)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pass Holder:</span>
                <span className="font-bold text-white">{currentBooking.primaryAttendee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Checked-in:</span>
                <span className="font-bold text-amber-400">{checkInTime || currentBooking.checkedInAt}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Do not allow another check-in unless an authorized admin explicitly reverses it.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleReverseCheckIn}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reverse Check-In (Admin)
              </button>
              <button
                onClick={resetScanner}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Scan Next
              </button>
            </div>
          </div>
        )}

        {/* 17. CANCELLED PASS */}
        {phase === 'cancelled' && currentBooking && (
          <div className="max-w-md mx-auto bg-red-500/15 border-2 border-red-500/50 rounded-2xl p-6 text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/20 pb-3">
              <XCircle className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-black text-xl tracking-wider uppercase">CANCELLED PASS</h4>
                <p className="text-xs text-red-300">Ticket cancelled or refunded. Do not allow entry.</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 space-y-2 text-xs border border-white/10">
              <div className="flex justify-between">
                <span className="text-text-muted">Pass ID:</span>
                <span className="font-mono text-white font-bold">{getBookingPassId(currentBooking)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Holder:</span>
                <span className="font-bold text-white">{currentBooking.primaryAttendee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="font-bold text-red-400">CANCELLED</span>
              </div>
            </div>

            <button
              onClick={resetScanner}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
            >
              Scan Next Pass
            </button>
          </div>
        )}

        {/* 17. INVALID PASS */}
        {phase === 'invalid' && (
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-200">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h4 className="text-red-400 font-black text-lg uppercase tracking-wider">INVALID PASS</h4>
            <p className="text-xs text-text-secondary">
              No booking record found for this reference. Ensure attendee has a valid CineVenue pass.
            </p>
            <button
              onClick={resetScanner}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer mt-2"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
