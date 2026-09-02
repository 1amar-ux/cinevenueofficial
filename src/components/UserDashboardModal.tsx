import React, { useState } from "react";
import { 
  X, Ticket, Calendar, MapPin, Clock, User, 
  CheckCircle2, AlertCircle, XCircle, Mail, 
  Smartphone, CreditCard, Sparkles, Download, Share2,
  Eye, RefreshCw, Upload, ShieldCheck, QrCode
} from "lucide-react";
import { Booking, EventRegistration } from "../types";

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  bookings: Booking[];
  eventRegistrations: EventRegistration[];
  onOpenAuth: () => void;
  onUpdateBookingUtr?: (bookingId: string, utr: string, screenshotUrl: string) => void;
  onUpdateRegistrationUtr?: (regId: string, utr: string, screenshotUrl: string) => void;
}

export default function UserDashboardModal({
  isOpen,
  onClose,
  userEmail,
  bookings,
  eventRegistrations,
  onOpenAuth,
  onUpdateBookingUtr,
  onUpdateRegistrationUtr,
}: UserDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<"movies" | "events">("movies");
  const [selectedPass, setSelectedPass] = useState<EventRegistration | Booking | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Editing UTR / Screenshot Modal state
  const [editingItem, setEditingItem] = useState<{ id: string; type: "movie" | "event" } | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [screenshotInput, setScreenshotInput] = useState("");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items for current logged in user
  const userBookings = bookings.filter(
    (b) => b.userEmail && b.userEmail.toLowerCase() === (userEmail || "").toLowerCase()
  );

  const userEventRegistrations = eventRegistrations.filter(
    (r) => r.userEmail && r.userEmail.toLowerCase() === (userEmail || "").toLowerCase()
  );

  const handleDownloadTicketTxt = (item: Booking | EventRegistration, isEvent: boolean) => {
    const title = isEvent ? (item as EventRegistration).eventTitle : (item as Booking).movieTitle;
    const venue = isEvent ? (item as EventRegistration).venueName : (item as Booking).theatreName;
    const date = item.date;
    const time = isEvent ? (item as EventRegistration).time : (item as Booking).timeSlot;
    const details = isEvent 
      ? `Category: ${(item as EventRegistration).categoryName} (${(item as EventRegistration).quantity} Pass)` 
      : `Seats: ${(item as Booking).seats.join(", ")}`;

    const text = `
==================================================
              CINEVENUE VERIFIED PASS
==================================================
Pass Code  : ${item.id}
Title      : ${title}
Venue      : ${venue}
Date/Time  : ${date} @ ${time}
Details    : ${details}
Holder     : ${item.userName || "Valued Customer"}
Email      : ${item.userEmail || userEmail}
Total Paid : ₹${item.totalPrice}
Status     : ${item.paymentVerificationStatus || item.status || "Approved"}
UTR Ref    : ${item.utrNumber || "N/A"}
Verification: QR GATED PASS VERIFIED BY CINEVENUE

Show this ticket with QR Code at the venue entrance.
==================================================
`;
    const blob = new Blob([text.trim()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cinevenue-pass-${item.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = (item: Booking | EventRegistration, isEvent: boolean) => {
    const title = isEvent ? (item as EventRegistration).eventTitle : (item as Booking).movieTitle;
    const venue = isEvent ? (item as EventRegistration).venueName : (item as Booking).theatreName;
    const date = item.date;
    const time = isEvent ? (item as EventRegistration).time : (item as Booking).timeSlot;

    const message = encodeURIComponent(
      `🎟 *CineVenue Verified Pass*\n\n` +
      `*Event/Movie:* ${title}\n` +
      `*Venue:* ${venue}\n` +
      `*Date & Time:* ${date} at ${time}\n` +
      `*Pass Code:* ${item.id}\n` +
      `*Holder:* ${item.userName || userEmail}\n` +
      `*Status:* ${item.paymentVerificationStatus || "Approved"}\n\n` +
      `See you at the show!`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!utrInput || utrInput.trim().length < 6) {
      setUploadMessage("Please enter a valid 12-digit UTR transaction reference number.");
      return;
    }

    const defaultScreenshot = screenshotInput || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600";

    if (editingItem.type === "movie" && onUpdateBookingUtr) {
      onUpdateBookingUtr(editingItem.id, utrInput.trim(), defaultScreenshot);
    } else if (editingItem.type === "event" && onUpdateRegistrationUtr) {
      onUpdateRegistrationUtr(editingItem.id, utrInput.trim(), defaultScreenshot);
    }

    setUploadMessage("✅ Payment UTR screenshot updated! Sent to Admin queue for verification (5-15 mins window).");
    setTimeout(() => {
      setEditingItem(null);
      setUtrInput("");
      setScreenshotInput("");
      setUploadMessage(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0D0D11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 text-text-primary">
        
        {/* HEADER BAR */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#121218]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold tracking-wide text-white flex items-center gap-2">
                My Tickets & Gate Passes
              </h2>
              <p className="text-xs text-text-secondary">
                {userEmail ? `Logged in as ${userEmail}` : "Track UPI verification status & download QR passes"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {!userEmail ? (
            <div className="py-12 text-center space-y-4">
              <User className="w-16 h-16 text-gold/40 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">Login to View Your Tickets & Passes</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Sign in with your email address to track pending screenshot reviews, access digital QR passes, and download your tax receipts.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-gold/20"
              >
                Login / Sign Up Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TABS */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <button
                  onClick={() => setActiveTab("movies")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === "movies"
                      ? "bg-gold text-black border-gold shadow-lg shadow-gold/20"
                      : "bg-white/5 text-text-secondary border-white/10 hover:text-white"
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  Movie Tickets ({userBookings.length})
                </button>

                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === "events"
                      ? "bg-gold text-black border-gold shadow-lg shadow-gold/20"
                      : "bg-white/5 text-text-secondary border-white/10 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Live Event Passes ({userEventRegistrations.length})
                </button>
              </div>

              {/* NOTICE STRIP FOR VERIFICATION */}
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-amber-200/90 text-xs">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400">Manual UPI Payment Review System:</span> After submitting your 12-digit UTR reference and payment screenshot, admin verifies your transaction within <strong className="text-white">5 to 15 minutes</strong>. Once approved, your Digital QR Gate Pass unlocks automatically.
                </div>
              </div>

              {/* MOVIES TAB CONTENT */}
              {activeTab === "movies" && (
                <div className="space-y-4">
                  {userBookings.length === 0 ? (
                    <div className="py-10 text-center text-text-muted text-xs bg-white/[0.02] border border-white/5 rounded-xl">
                      No movie ticket bookings found for <span className="text-gold">{userEmail}</span>.
                    </div>
                  ) : (
                    userBookings.map((b) => {
                      const verification = b.paymentVerificationStatus || "Approved";
                      const isApproved = verification === "Approved" || b.status === "Settled";
                      const isPending = verification === "Pending Review";
                      const isRejected = verification === "Rejected";

                      return (
                        <div 
                          key={b.id} 
                          className="bg-[#121218] border border-white/10 hover:border-gold/30 rounded-xl p-5 transition-all space-y-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">
                                  {b.id}
                                </span>
                                
                                {/* Status Pill */}
                                {isApproved && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified & Approved
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    Verification Pending (5-15 mins)
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Payment Rejected
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-white">{b.movieTitle}</h3>
                              <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-gold" /> {b.theatreName} ({b.city || "Venue"})
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-text-muted block">Total Amount</span>
                              <span className="text-lg font-bold text-gold font-mono">₹{b.totalPrice}</span>
                            </div>
                          </div>

                          {/* DETAILS GRID */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/40 p-3 rounded-lg border border-white/5">
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Show Date</span>
                              <span className="text-white font-medium">{b.date}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Showtime</span>
                              <span className="text-white font-medium">{b.timeSlot}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Reserved Seats</span>
                              <span className="text-gold font-bold">{b.seats.join(", ")}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">UTR Reference</span>
                              <span className="text-white font-mono">{b.utrNumber || "N/A"}</span>
                            </div>
                          </div>

                          {/* SCREENSHOT & UTR REVIEW ALERT FOR PENDING OR REJECTED */}
                          {isPending && (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                  Verification under review by Admin Queue
                                </span>
                                {b.paymentScreenshot && (
                                  <button
                                    onClick={() => setPreviewImage(b.paymentScreenshot || null)}
                                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> View Uploaded Screenshot
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-amber-200/80">
                                Submitted UTR: <strong className="font-mono text-white">{b.utrNumber || "Pending"}</strong>. Admin is reviewing payment credits against UTR. Please keep this screen open or check back shortly.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingItem({ id: b.id, type: "movie" });
                                  setUtrInput(b.utrNumber || "");
                                  setScreenshotInput(b.paymentScreenshot || "");
                                }}
                                className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                              >
                                Edit UTR or Re-upload Screenshot
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs space-y-2">
                              <span className="text-rose-400 font-bold block">
                                Payment Verification Failed / Rejected
                              </span>
                              <p className="text-[11px] text-rose-200/80">
                                The UTR reference ({b.utrNumber || "N/A"}) or payment screenshot was not matched in bank credits. Please check your UPI transaction history and update below.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingItem({ id: b.id, type: "movie" });
                                  setUtrInput(b.utrNumber || "");
                                  setScreenshotInput(b.paymentScreenshot || "");
                                }}
                                className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                              >
                                Re-enter 12-Digit UTR & Upload Screenshot
                              </button>
                            </div>
                          )}

                          {/* DIGITAL GATE PASS ON APPROVAL */}
                          {isApproved && (
                            <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black border border-emerald-500/30 p-4 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {/* QR Code Graphic */}
                                  <div className="bg-white p-2 rounded-lg border border-emerald-400/40 shrink-0">
                                    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                                      <rect x="0" y="0" width="100" height="100" fill="white" />
                                      <rect x="5" y="5" width="25" height="25" fill="black" />
                                      <rect x="9" y="9" width="17" height="17" fill="white" />
                                      <rect x="13" y="13" width="9" height="9" fill="black" />
                                      <rect x="70" y="5" width="25" height="25" fill="black" />
                                      <rect x="74" y="9" width="17" height="17" fill="white" />
                                      <rect x="78" y="13" width="9" height="9" fill="black" />
                                      <rect x="5" y="70" width="25" height="25" fill="black" />
                                      <rect x="9" y="74" width="17" height="17" fill="white" />
                                      <rect x="13" y="78" width="9" height="9" fill="black" />
                                      <path d="M35,10 L45,10 L45,20 L35,20 Z M50,5 L60,5 L60,15 L50,15 Z M35,30 L65,30 L65,40 L35,40 Z M10,40 L25,40 L25,50 L10,50 Z M70,40 L90,40 L90,55 L70,55 Z M40,50 L55,50 L55,70 L40,70 Z M60,65 L85,65 L85,85 L60,85 Z M10,60 L25,60 L25,65 L10,65 Z M35,75 L50,75 L50,90 L35,90 Z" fill="black" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                                      Verified Digital Gate Pass
                                    </span>
                                    <h4 className="text-sm font-bold text-white">Entry Code: {b.id}</h4>
                                    <p className="text-[11px] text-text-secondary">
                                      Valid for {b.seats.length} Seat(s) · {b.seats.join(", ")}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleDownloadTicketTxt(b, false)}
                                    className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Pass
                                  </button>
                                  <button
                                    onClick={() => handleShareWhatsApp(b, false)}
                                    className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    WhatsApp
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* EVENTS TAB CONTENT */}
              {activeTab === "events" && (
                <div className="space-y-4">
                  {userEventRegistrations.length === 0 ? (
                    <div className="py-10 text-center text-text-muted text-xs bg-white/[0.02] border border-white/5 rounded-xl">
                      No live event passes found for <span className="text-gold">{userEmail}</span>.
                    </div>
                  ) : (
                    userEventRegistrations.map((r) => {
                      const verification = r.paymentVerificationStatus || "Approved";
                      const isApproved = verification === "Approved" || r.status === "Confirmed";
                      const isPending = verification === "Pending Review";
                      const isRejected = verification === "Rejected";

                      return (
                        <div 
                          key={r.id} 
                          className="bg-[#121218] border border-white/10 hover:border-gold/30 rounded-xl p-5 transition-all space-y-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">
                                  {r.id}
                                </span>

                                {/* Status Pill */}
                                {isApproved && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified & Approved
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    Verification Pending (5-15 mins)
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Payment Rejected
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-white">{r.eventTitle}</h3>
                              <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-gold" /> {r.venueName}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-text-muted block">Total Paid</span>
                              <span className="text-lg font-bold text-gold font-mono">₹{r.totalPrice}</span>
                            </div>
                          </div>

                          {/* DETAILS GRID */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/40 p-3 rounded-lg border border-white/5">
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Event Date</span>
                              <span className="text-white font-medium">{r.date}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Event Time</span>
                              <span className="text-white font-medium">{r.time}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">Pass Tier / Qty</span>
                              <span className="text-gold font-bold">{r.categoryName} ({r.quantity}x)</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[10px] uppercase font-bold">UTR Reference</span>
                              <span className="text-white font-mono">{r.utrNumber || "N/A"}</span>
                            </div>
                          </div>

                          {/* SCREENSHOT & UTR REVIEW ALERT FOR PENDING OR REJECTED */}
                          {isPending && (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                  Verification under review by Admin Queue
                                </span>
                                {r.paymentScreenshot && (
                                  <button
                                    onClick={() => setPreviewImage(r.paymentScreenshot || null)}
                                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> View Uploaded Screenshot
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-amber-200/80">
                                Submitted UTR: <strong className="font-mono text-white">{r.utrNumber || "Pending"}</strong>. Verification window is 5-15 mins.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingItem({ id: r.id, type: "event" });
                                  setUtrInput(r.utrNumber || "");
                                  setScreenshotInput(r.paymentScreenshot || "");
                                }}
                                className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                              >
                                Edit UTR or Re-upload Screenshot
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs space-y-2">
                              <span className="text-rose-400 font-bold block">
                                Payment Verification Failed / Rejected
                              </span>
                              <p className="text-[11px] text-rose-200/80">
                                Submitted UTR reference ({r.utrNumber || "N/A"}) was rejected. Please re-check UTR and submit screenshot.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingItem({ id: r.id, type: "event" });
                                  setUtrInput(r.utrNumber || "");
                                  setScreenshotInput(r.paymentScreenshot || "");
                                }}
                                className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                              >
                                Re-enter 12-Digit UTR & Upload Screenshot
                              </button>
                            </div>
                          )}

                          {/* DIGITAL GATE PASS ON APPROVAL */}
                          {isApproved && (
                            <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black border border-emerald-500/30 p-4 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {/* QR Code Graphic */}
                                  <div className="bg-white p-2 rounded-lg border border-emerald-400/40 shrink-0">
                                    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                                      <rect x="0" y="0" width="100" height="100" fill="white" />
                                      <rect x="5" y="5" width="25" height="25" fill="black" />
                                      <rect x="9" y="9" width="17" height="17" fill="white" />
                                      <rect x="13" y="13" width="9" height="9" fill="black" />
                                      <rect x="70" y="5" width="25" height="25" fill="black" />
                                      <rect x="74" y="9" width="17" height="17" fill="white" />
                                      <rect x="78" y="13" width="9" height="9" fill="black" />
                                      <rect x="5" y="70" width="25" height="25" fill="black" />
                                      <rect x="9" y="74" width="17" height="17" fill="white" />
                                      <rect x="13" y="78" width="9" height="9" fill="black" />
                                      <path d="M35,10 L45,10 L45,20 L35,20 Z M50,5 L60,5 L60,15 L50,15 Z M35,30 L65,30 L65,40 L35,40 Z M10,40 L25,40 L25,50 L10,50 Z M70,40 L90,40 L90,55 L70,55 Z M40,50 L55,50 L55,70 L40,70 Z M60,65 L85,65 L85,85 L60,85 Z M10,60 L25,60 L25,65 L10,65 Z M35,75 L50,75 L50,90 L35,90 Z" fill="black" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                                      Verified Concert / Event Pass
                                    </span>
                                    <h4 className="text-sm font-bold text-white">Entry Code: {r.id}</h4>
                                    <p className="text-[11px] text-text-secondary">
                                      Tier: {r.categoryName} · {r.quantity} Attendee(s)
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleDownloadTicketTxt(r, true)}
                                    className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Pass
                                  </button>
                                  <button
                                    onClick={() => handleShareWhatsApp(r, true)}
                                    className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    WhatsApp
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-[#121218] border border-white/20 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Payment Screenshot Preview</span>
              <button onClick={() => setPreviewImage(null)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black max-h-[70vh] flex items-center justify-center">
              <img src={previewImage} alt="Payment Screenshot" className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* EDIT UTR & SCREENSHOT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-[#121218] border border-gold/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-gold" />
                Update Payment Details ({editingItem.id})
              </span>
              <button onClick={() => setEditingItem(null)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUtrSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-secondary uppercase font-bold text-[10px] mb-1">
                  12-Digit UTR / Transaction Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. 419820491823"
                  className="w-full bg-black/60 border border-white/15 focus:border-gold rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-text-secondary uppercase font-bold text-[10px] mb-1">
                  Payment Screenshot Image URL
                </label>
                <input
                  type="text"
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  placeholder="Paste image link or leave for default screenshot"
                  className="w-full bg-black/60 border border-white/15 focus:border-gold rounded-lg p-2.5 text-white"
                />
              </div>

              {uploadMessage && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded text-[11px]">
                  {uploadMessage}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Submit For Review
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
