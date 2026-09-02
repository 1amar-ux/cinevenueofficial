import React, { useState } from "react";
import { 
  X, Ticket, Calendar, MapPin, Clock, User, 
  CheckCircle2, AlertCircle, XCircle, Mail, 
  MessageSquare, Smartphone, Inbox, CreditCard, Sparkles, Download, Printer,
  Database
} from "lucide-react";
import { Booking, EventRegistration } from "../types";

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  bookings: Booking[];
  eventRegistrations: EventRegistration[];
  onOpenAuth: () => void;
}

export default function OrdersModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  bookings, 
  eventRegistrations, 
  onOpenAuth 
}: OrdersModalProps) {
  const [activeTab, setActiveTab] = useState<"movies" | "events">("movies");
  const [movieFilter, setMovieFilter] = useState<"upcoming" | "past">("upcoming");
  const [selectedPassForSim, setSelectedPassForSim] = useState<EventRegistration | null>(null);
  const [notificationSimTab, setNotificationSimTab] = useState<"sms" | "email">("sms");
  const [downloadingPassId, setDownloadingPassId] = useState<string | null>(null);
  const [emailingPassId, setEmailingPassId] = useState<string | null>(null);
  const [localActionSuccessMessage, setLocalActionSuccessMessage] = useState<string | null>(null);
  const [viewingPastBookings, setViewingPastBookings] = useState(false);

  const handleDownloadPass = (pass: EventRegistration) => {
    setDownloadingPassId(pass.id);
    setLocalActionSuccessMessage(null);
    setTimeout(() => {
      setDownloadingPassId(null);
      
      const ticketContent = `
==================================================
              CINEVENUE EVENT PASS
==================================================
Pass Code  : ${pass.id}
Event      : ${pass.eventTitle}
Category   : ${pass.categoryName} Class Pass
Venue      : ${pass.venueName}
Date       : ${pass.date}
Time       : ${pass.time}
Holder     : ${pass.userName}
Email      : ${pass.userEmail}
Mobile     : ${pass.mobileNumber || "N/A"}
Qty        : ${pass.quantity}x
Total Price: ₹${pass.totalPrice}
Status     : ${pass.status}
Gateway    : ${pass.paymentMethod}
Booking DT : ${pass.bookingDate || "N/A"}

Thank you for choosing CineVenue Elite Concierge.
Please keep this copy secure and show it at the venue gates.
==================================================
`;
      const blob = new Blob([ticketContent.trim()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cinevenue-pass-${pass.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLocalActionSuccessMessage(`📥 Digital Pass ${pass.id} downloaded successfully!`);
    }, 800);
  };

  const handleEmailPass = (pass: EventRegistration) => {
    setEmailingPassId(pass.id);
    setLocalActionSuccessMessage(null);
    setTimeout(() => {
      setEmailingPassId(null);
      setLocalActionSuccessMessage(`✉ VIP Pass details for ${pass.id} successfully mailed to ${pass.userEmail}!`);
    }, 800);
  };

  if (!isOpen) return null;

  // Filter bookings and registrations for the logged in user
  const userBookings = bookings.filter(
    (b) => b.userEmail && b.userEmail.toLowerCase() === (userEmail || "").toLowerCase()
  );

  const userEventRegistrations = eventRegistrations.filter(
    (r) => r.userEmail && r.userEmail.toLowerCase() === (userEmail || "").toLowerCase()
  );

  // Parse booking date to categorize as upcoming vs past
  const isPastBooking = (booking: Booking) => {
    if (booking.date === "Today") return false;
    try {
      const bDate = new Date(booking.date);
      const today = new Date("2026-07-04"); // System reference date
      return bDate < today;
    } catch (e) {
      return false;
    }
  };

  const upcomingBookings = userBookings.filter((b) => !isPastBooking(b));
  const pastBookings = userBookings.filter((b) => isPastBooking(b));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Main container */}
      <div className="relative bg-[#0A0A0B] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-text-primary">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold tracking-wide text-text-primary">
                Your <span className="text-gold">Orders & Passes</span>
              </h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                {userEmail ? `Logged in as: ${userEmail}` : "Secure Access"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        {!userEmail ? (
          /* Locked State - Prompt Login */
          <div className="p-12 text-center flex flex-col items-center justify-center flex-grow max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold mb-6 animate-pulse">
              <Ticket className="w-8 h-8" />
            </div>
            <h4 className="font-display text-lg font-bold text-text-primary uppercase tracking-wider mb-2">
              Member Portal Locked
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed mb-8">
              Please sign in to your VIP membership account to easily track your premium movie theatre bookings, past history, and active event entry passes.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full bg-gold hover:bg-gold-light text-black font-bold text-xs py-4 rounded-sm tracking-[0.2em] uppercase transition-all shadow-lg shadow-gold/10 cursor-pointer"
            >
              Sign In / Join CineVenue
            </button>
          </div>
        ) : (
          /* Logged In State */
          <div className="flex-grow overflow-y-auto flex flex-col lg:flex-row min-h-0">
            
            {/* Sidebar Controls */}
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 p-5 bg-white/[0.01] shrink-0 space-y-4">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] block">
                Category Navigation
              </span>
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveTab("movies");
                    setSelectedPassForSim(null);
                  }}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border-0 cursor-pointer ${
                    activeTab === "movies"
                      ? "bg-gold text-black shadow-lg shadow-gold/15"
                      : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Movie Bookings</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("events");
                    setSelectedPassForSim(null);
                  }}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border-0 cursor-pointer ${
                    activeTab === "events"
                      ? "bg-gold text-black shadow-lg shadow-gold/15"
                      : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Event Passes</span>
                </button>
              </div>

              <div className="hidden lg:block bg-[#0E0E10] border border-white/5 p-4 rounded-lg">
                <h5 className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live Notifications
                </h5>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  CineVenue automatically dispatches verified SMS and HTML emails upon event pass confirmation. Look for the button to test the simulation output.
                </p>
              </div>
            </div>

            {/* Display Area */}
            <div className="flex-grow p-6 overflow-y-auto min-h-0">
              
              {/* Tab: Movies */}
              {activeTab === "movies" && (
                <div className="space-y-6">
                  {/* Movie Filters */}
                  <div className="flex border-b border-white/5 pb-3 justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMovieFilter("upcoming")}
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          movieFilter === "upcoming"
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-transparent border-transparent text-text-secondary hover:text-white"
                        }`}
                      >
                        Upcoming Bookings ({upcomingBookings.length})
                      </button>
                      <button
                        onClick={() => setMovieFilter("past")}
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          movieFilter === "past"
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-transparent border-transparent text-text-secondary hover:text-white"
                        }`}
                      >
                        Past Bookings ({pastBookings.length})
                      </button>
                    </div>
                  </div>

                  {/* Booking Cards list */}
                  {((movieFilter === "upcoming" ? upcomingBookings : pastBookings).length === 0) ? (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                      <Ticket className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-text-secondary">No movie tickets found in this segment.</p>
                      <p className="text-xs text-text-muted mt-1">Book your private luxury theatre showroom slot now!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(movieFilter === "upcoming" ? upcomingBookings : pastBookings).map((booking) => (
                        <div 
                          key={booking.id}
                          className="bg-[#0E0E10] border border-white/5 hover:border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-stretch gap-4 transition-all"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded">
                                {booking.id}
                              </span>
                              <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                                {booking.city || "All Locations"}
                              </span>
                            </div>
                            <h4 className="font-display text-lg font-bold text-text-primary">
                              {booking.movieTitle}
                            </h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-text-secondary">
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span className="truncate">{booking.theatreName}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span>{booking.date}</span>
                              </p>
                              <p className="flex items-center gap-1.5 col-span-2">
                                <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span>Selected Show Time: <strong className="text-text-primary">{booking.timeSlot}</strong></span>
                              </p>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Seats:</span>
                              {booking.seats.map(seat => (
                                <span key={seat} className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-text-primary">
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between items-end md:w-48 shrink-0">
                            <div className="text-right w-full">
                              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Total Paid</p>
                              <p className="font-display text-xl font-bold text-gold mt-0.5">₹{booking.totalPrice}</p>
                            </div>
                            
                            {/* Past Bookings column/indicator */}
                            <div className="w-full my-2 text-right">
                              {(() => {
                                const priorCount = bookings.filter(ob => ob.userEmail?.toLowerCase() === userEmail?.toLowerCase() && ob.id !== booking.id).length;
                                return (
                                  <div className="flex items-center justify-between md:justify-end gap-2 text-xs">
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Past Bookings</span>
                                    <button
                                      type="button"
                                      onClick={() => setViewingPastBookings(true)}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer border transition-all ${
                                        priorCount > 0
                                          ? "bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-black"
                                          : "bg-white/5 text-text-secondary border-white/10"
                                      }`}
                                      title="Click to view full booking logs"
                                    >
                                      {priorCount} prior
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="w-full flex items-center justify-end gap-2 mt-4 md:mt-0">
                              {booking.status === "Settled" ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                                </span>
                              ) : booking.status === "Cancelled" ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded">
                                  <XCircle className="w-3 h-3" /> Cancelled
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded">
                                  <AlertCircle className="w-3 h-3" /> Pending Confirmation
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Events */}
              {activeTab === "events" && !selectedPassForSim && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Event Passes & Registrations
                    </h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      Verify pass approval status, download offline tickets, and access your digital SMS & Email confirmations.
                    </p>
                  </div>

                  {localActionSuccessMessage && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] leading-relaxed text-center font-medium animate-fade-in relative">
                      <span>{localActionSuccessMessage}</span>
                      <button 
                        onClick={() => setLocalActionSuccessMessage(null)}
                        className="absolute right-2 top-2 text-emerald-400 hover:text-emerald-200 bg-transparent border-0 font-bold cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {userEventRegistrations.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                      <Calendar className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-text-secondary">No booked event passes found.</p>
                      <p className="text-xs text-text-muted mt-1">Register for an upcoming premium masterclass or concert!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userEventRegistrations.map((pass) => (
                        <div 
                          key={pass.id}
                          className="bg-[#0E0E10] border border-white/5 hover:border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-stretch gap-4 transition-all"
                        >
                          <div className="space-y-2.5 flex-grow">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-widest bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded">
                                {pass.id}
                              </span>
                              <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                                {pass.categoryName} Class Pass
                              </span>
                            </div>
                            <h4 className="font-display text-lg font-bold text-text-primary">
                              {pass.eventTitle}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-text-secondary">
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span className="truncate">{pass.venueName}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span>{pass.date} at {pass.time}</span>
                              </p>
                              <p className="flex items-center gap-1.5 col-span-2">
                                <User className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span>Pass holder: <strong className="text-text-primary">{pass.userName}</strong></span>
                              </p>
                            </div>
                            <div className="pt-2.5 border-t border-white/5 flex justify-between items-center">
                              <span className="text-xs text-text-secondary">
                                Quantity: <strong className="text-text-primary">{pass.quantity}x</strong>
                              </span>
                              <span className="text-xs text-text-secondary">
                                Unit Price: <strong className="text-text-primary">₹{pass.ticketPrice}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between items-end md:w-56 shrink-0">
                            <div className="text-right w-full">
                              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Total Price</p>
                              <p className="font-display text-xl font-bold text-gold mt-0.5">₹{pass.totalPrice}</p>
                            </div>

                            <div className="space-y-2 w-full mt-4">
                              {/* Status Tag */}
                              <div className="flex justify-end">
                                {pass.status === "Confirmed" ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                                  </span>
                                ) : pass.status === "Cancelled" ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded">
                                    <XCircle className="w-3 h-3" /> Cancelled
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded animate-pulse">
                                    <AlertCircle className="w-3 h-3" /> Pending Approval
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-1.5 w-full">
                                {pass.status === "Confirmed" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedPassForSim(pass);
                                        setNotificationSimTab("sms");
                                      }}
                                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors border-0"
                                    >
                                      <Smartphone className="w-3.5 h-3.5" />
                                      <span>View SMS & Email</span>
                                    </button>

                                    <div className="grid grid-cols-2 gap-1.5 w-full">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadPass(pass)}
                                        disabled={downloadingPassId === pass.id}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 text-text-primary rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                                      >
                                        <Download className="w-3 h-3" />
                                        <span>{downloadingPassId === pass.id ? "..." : "Download"}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleEmailPass(pass)}
                                        disabled={emailingPassId === pass.id}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-blue-500 hover:text-black border border-white/10 text-text-primary rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                                      >
                                        <Mail className="w-3 h-3" />
                                        <span>{emailingPassId === pass.id ? "..." : "Mail Me"}</span>
                                      </button>
                                    </div>
                                  </>
                                ) : pass.status === "Cancelled" ? (
                                  <p className="text-[10px] text-red-400 text-right italic">Order rejected/cancelled.</p>
                                ) : (
                                  <div className="text-[10px] text-text-muted text-right space-y-1 bg-white/[0.01] border border-white/5 p-2 rounded">
                                    <p className="font-semibold text-gold text-xs">🔒 GATE BARCODE LOCKED</p>
                                    <div className="flex justify-between gap-2 text-[9px]">
                                      <span>Organizer approved:</span>
                                      <span className={pass.organizerApproved ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                        {pass.organizerApproved ? "Yes" : "Pending"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-2 text-[9px]">
                                      <span>Superadmin approved:</span>
                                      <span className={pass.superadminApproved ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                        {pass.superadminApproved ? "Yes" : "Pending"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-View: Notification Simulator for Confirmed Event Registration */}
              {selectedPassForSim && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Back Navigation header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedPassForSim(null)}
                        className="text-xs text-gold hover:underline cursor-pointer bg-transparent border-0 font-semibold"
                      >
                        ← Back to List
                      </button>
                      <span className="text-text-muted text-xs">/</span>
                      <span className="text-text-primary text-xs font-medium truncate max-w-[200px]">
                        Pass: {selectedPassForSim.id}
                      </span>
                    </div>

                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                      <button
                        onClick={() => setNotificationSimTab("sms")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          notificationSimTab === "sms"
                            ? "bg-gold text-black font-extrabold"
                            : "bg-transparent text-text-secondary hover:text-white"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS Message</span>
                      </button>
                      <button
                        onClick={() => setNotificationSimTab("email")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          notificationSimTab === "email"
                            ? "bg-gold text-black font-extrabold"
                            : "bg-transparent text-text-secondary hover:text-white"
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>VIP E-Mail</span>
                      </button>
                    </div>
                  </div>

                  {/* SMS Thread Simulator */}
                  {notificationSimTab === "sms" && (
                    <div className="max-w-md mx-auto bg-black border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative">
                      {/* Phone top notch */}
                      <div className="h-8 bg-[#161618] flex items-center justify-between px-6 text-[10px] text-text-secondary font-mono border-b border-white/5">
                        <span>9:41 AM</span>
                        <div className="w-20 h-4 bg-black rounded-b-xl mx-auto absolute left-1/2 -translate-x-1/2 top-0" />
                        <div className="flex gap-1.5 items-center">
                          <span>5G</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* SMS Chat Header */}
                      <div className="bg-[#1C1C1E] p-3 text-center border-b border-white/5 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold text-xs">
                          CV
                        </div>
                        <span className="text-xs font-bold text-text-primary mt-1">CineVenue passes</span>
                        <span className="text-[8px] text-emerald-400 font-semibold tracking-widest uppercase mt-0.5">✓ Verified Sender</span>
                      </div>

                      {/* SMS Messages list body */}
                      <div className="p-4 h-72 overflow-y-auto space-y-4 bg-[#0A0A0B] flex flex-col justify-end">
                        <div className="text-center">
                          <span className="bg-white/5 text-[9px] text-text-secondary px-2 py-0.5 rounded-full">
                            Today 9:41 AM
                          </span>
                        </div>

                        {/* Received SMS Bubble */}
                        <div className="flex flex-col gap-1 max-w-[85%] self-start">
                          <div className="bg-[#262629] text-white p-3.5 rounded-2xl text-xs leading-relaxed rounded-tl-sm border border-white/5">
                            🎟️ <strong className="text-gold">CineVenue VIP CONFIRMED!</strong>
                            <br /><br />
                            Hi {selectedPassForSim.userName}, your pass for <strong>{selectedPassForSim.eventTitle}</strong> has been officially confirmed!
                            <br /><br />
                            📍 Venue: {selectedPassForSim.venueName}
                            <br />
                            📅 Date: {selectedPassForSim.date}
                            <br />
                            ⏰ Time: {selectedPassForSim.time}
                            <br />
                            👥 Qty: {selectedPassForSim.quantity} Pass(es) ({selectedPassForSim.categoryName})
                            <br /><br />
                            🔖 Pass Code: <span className="font-mono text-gold font-bold">{selectedPassForSim.id}</span>
                            <br /><br />
                            Please present this SMS at the gate scan point. Enjoy your experience!
                          </div>
                          <span className="text-[9px] text-text-muted pl-1.5">Delivered via CineVenue Cloud SMS</span>
                        </div>
                      </div>

                      {/* Message Input bar mock */}
                      <div className="p-3 bg-[#1C1C1E] border-t border-white/5 flex items-center gap-3">
                        <div className="flex-grow bg-black rounded-full px-4 py-2 text-[11px] text-text-secondary border border-white/10">
                          iMessage
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#34C759] flex items-center justify-center text-white font-bold text-xs cursor-not-allowed">
                          ↑
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HTML VIP Email Simulator */}
                  {notificationSimTab === "email" && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#121214] shadow-2xl">
                      {/* Email Header */}
                      <div className="p-4 bg-black/40 border-b border-white/5 text-xs text-text-secondary space-y-1.5 text-left">
                        <p><strong>From:</strong> CineVenue Concierge &lt;vip-passes@cinevenue.com&gt;</p>
                        <p><strong>To:</strong> {selectedPassForSim.userName} &lt;{selectedPassForSim.userEmail}&gt;</p>
                        <p><strong>Subject:</strong> 🎟️ Your VIP Pass to {selectedPassForSim.eventTitle} is Confirmed! (ID: {selectedPassForSim.id})</p>
                      </div>

                      {/* Email Body */}
                      <div className="p-8 max-w-2xl mx-auto bg-[#0A0A0B] border border-white/5 my-6 rounded-lg text-left shadow-lg">
                        
                        {/* Brand Logo */}
                        <div className="text-center pb-6 border-b border-white/5">
                          <h2 className="font-display text-2xl font-medium tracking-wide text-text-primary">
                            <span className="not-italic">Cine</span><span className="text-gold not-italic">Venue</span>
                          </h2>
                          <p className="text-[9px] text-gold uppercase tracking-[0.3em] mt-1 font-semibold">
                            Elite Cinema & Masterclass Concierge
                          </p>
                        </div>

                        {/* Booking Success Greeting */}
                        <div className="py-6 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <h3 className="font-display text-lg font-bold text-text-primary">Your Pass is Confirmed!</h3>
                          <p className="text-xs text-text-secondary mt-1">
                            Thank you for reserving with CineVenue. Your access credentials are listed below.
                          </p>
                        </div>

                        {/* Summary Block */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-lg space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Confirmation Code</span>
                            <span className="font-mono text-gold font-bold tracking-wider">{selectedPassForSim.id}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Event Activity</span>
                            <span className="text-text-primary font-bold">{selectedPassForSim.eventTitle}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Venue Location</span>
                            <span className="text-text-primary font-bold">{selectedPassForSim.venueName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Event Date & Time</span>
                            <span className="text-text-primary font-bold">{selectedPassForSim.date} at {selectedPassForSim.time}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Pass Holder Name</span>
                            <span className="text-text-primary font-bold">{selectedPassForSim.userName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Category / Qty</span>
                            <span className="text-text-primary font-bold">{selectedPassForSim.quantity}x {selectedPassForSim.categoryName} Class Pass</span>
                          </div>
                        </div>

                        {/* Billing and Price breakdown */}
                        <div className="py-5 border-b border-white/5 space-y-2">
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Base Ticket Price ({selectedPassForSim.quantity}x ₹{selectedPassForSim.ticketPrice})</span>
                            <span>₹{selectedPassForSim.totalPrice}</span>
                          </div>
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Convenience & Booking Fee</span>
                            <span className="text-emerald-400">FREE</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-dashed border-white/10">
                            <span>Total Charge Paid</span>
                            <span className="text-gold">₹{selectedPassForSim.totalPrice}</span>
                          </div>
                        </div>

                        {/* Barcode Mock */}
                        <div className="py-6 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-lg mt-6">
                          <div className="font-mono text-xs tracking-[0.45em] text-white bg-black p-4 select-none border border-white/10 rounded">
                            ||||| | |||| || |||||| | | |||| ||
                          </div>
                          <span className="text-[10px] text-text-secondary font-mono mt-2 tracking-wider">
                            SECURE SCAN CODE: {selectedPassForSim.id}
                          </span>
                        </div>

                        <p className="text-[10px] text-text-muted text-center mt-6 leading-relaxed">
                          This is an automated system confirmation email from CineVenue Private Limited. Please do not reply directly to this mail. For concierge queries, contact support@cinevenue.com
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/[0.01] text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-gold" /> Secure CineVenue Pass Management
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            CineVenue v2.1 VIP
          </span>
        </div>

      </div>

      {/* User's past bookings history modal */}
      {viewingPastBookings && (
        <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-gold/30 rounded-2xl max-w-2xl w-full p-6 text-left space-y-6 shadow-2xl relative animate-fade-in">
            <button
              type="button"
              onClick={() => setViewingPastBookings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary tracking-wide flex items-center gap-2">
                <Database className="w-5 h-5 text-gold" />
                <span>Your Past Booking Records</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Viewing full movie booking history for your account: <span className="font-mono text-gold font-bold">{userEmail}</span>
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-1.5">
                🎬 Recorded Movie Booking Log ({userBookings.length})
              </span>

              {userBookings.length === 0 ? (
                <p className="text-xs text-text-muted italic py-8 text-center">No bookings recorded for this account.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {userBookings.map(b => (
                    <div key={b.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-mono text-gold font-bold">{b.id}</p>
                          <h4 className="font-semibold text-xs text-text-primary mt-0.5">{b.movieTitle}</h4>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            b.status === "Settled"
                              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                              : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary font-mono">
                        <p>📍 {b.theatreName}</p>
                        <p>🕒 {b.timeSlot}</p>
                        <p>📅 {b.date}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                        <div className="flex gap-1 items-center">
                          <span className="text-[9px] uppercase font-bold text-text-muted">Seats:</span>
                          {b.seats.map(s => (
                            <span key={s} className="px-1 py-0.5 rounded bg-white/5 text-[9px] text-text-secondary">{s}</span>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-gold font-mono">₹{b.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPastBookings(false)}
                className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-text-secondary hover:text-text-primary"
              >
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable elegant gold logo matching the design prompt
export function CineVenueLogoSymbol({ className = "w-28 h-24" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className} select-none`}>
      <svg
        viewBox="0 0 360 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9E3" />
            <stop offset="35%" stopColor="#E6C25A" />
            <stop offset="70%" stopColor="#B38E28" />
            <stop offset="100%" stopColor="#73540F" />
          </linearGradient>
          <linearGradient id="goldGradLight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFCEE" />
            <stop offset="50%" stopColor="#F5D880" />
            <stop offset="100%" stopColor="#9C771B" />
          </linearGradient>
          <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFECA8" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#967210" />
          </linearGradient>
          <linearGradient id="silverMetallic" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#EAEAEA" />
            <stop offset="100%" stopColor="#B2B2B2" />
          </linearGradient>
          <radialGradient id="lensGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#6D4C00" />
          </radialGradient>
        </defs>

        {/* 3D EMBOSSED STAR ON THE LEFT (Centered at 135, 145) */}
        <g>
          {/* Top Spike */}
          <path d="M 135,145 L 135,90 L 147.3,128 Z" fill="url(#goldGrad)" />
          <path d="M 135,145 L 135,90 L 122.7,128 Z" fill="url(#goldGradLight)" />
          {/* Right Top Spike */}
          <path d="M 135,145 L 187.3,128 L 147.3,128 Z" fill="url(#goldGradLight)" />
          <path d="M 135,145 L 187.3,128 L 155,151.5 Z" fill="url(#goldGrad)" />
          {/* Right Bottom Spike */}
          <path d="M 135,145 L 167.3,189.5 L 155,151.5 Z" fill="url(#goldGradLight)" />
          <path d="M 135,145 L 167.3,189.5 L 135,166 Z" fill="url(#goldGrad)" />
          {/* Left Bottom Spike */}
          <path d="M 135,145 L 102.7,189.5 L 135,166 Z" fill="url(#goldGradLight)" />
          <path d="M 135,145 L 102.7,189.5 L 115,151.5 Z" fill="url(#goldGrad)" />
          {/* Left Top Spike */}
          <path d="M 135,145 L 82.7,128 L 115,151.5 Z" fill="url(#goldGradLight)" />
          <path d="M 135,145 L 82.7,128 L 122.7,128 Z" fill="url(#goldGrad)" />
          
          {/* Thin inner star highlight */}
          <polygon points="135,100 143,131 174,131 149,149 158,180 135,161 112,180 121,149 96,131 127,131" stroke="#FFF7D6" strokeWidth="0.7" fill="none" opacity="0.6" />
        </g>

        {/* FILM PROJECTOR & LOCATION PIN MERGED ON THE RIGHT (Centered at 225, 145) */}
        <g>
          {/* Top Left Film Reel */}
          <circle cx="202" cy="98" r="23" stroke="url(#goldGrad)" strokeWidth="3" fill="none" />
          <circle cx="202" cy="98" r="16" stroke="url(#goldGradLight)" strokeWidth="1" fill="none" />
          <circle cx="202" cy="98" r="5" fill="url(#goldGrad)" />
          {/* Spokes for Left Reel */}
          <line x1="202" y1="75" x2="202" y2="121" stroke="url(#goldGrad)" strokeWidth="2" />
          <line x1="179" y1="98" x2="225" y2="98" stroke="url(#goldGrad)" strokeWidth="2" />

          {/* Top Right Film Reel */}
          <circle cx="248" cy="98" r="23" stroke="url(#goldGradLight)" strokeWidth="3" fill="none" />
          <circle cx="248" cy="98" r="16" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
          <circle cx="248" cy="98" r="5" fill="url(#goldGradLight)" />
          {/* Spokes for Right Reel */}
          <line x1="231.7" y1="81.7" x2="264.3" y2="114.3" stroke="url(#goldGradLight)" strokeWidth="2" />
          <line x1="231.7" y1="114.3" x2="264.3" y2="81.7" stroke="url(#goldGradLight)" strokeWidth="2" />

          {/* Location Pin Shape as the Main Camera Lens/Shutter body */}
          <path
            d="M 225,115 C 208.5,115 195,128.5 195,145 C 195,166 225,191 225,191 C 225,191 255,166 255,145 C 255,128.5 241.5,115 225,115 Z"
            fill="url(#goldGrad)"
            stroke="url(#goldGradLight)"
            strokeWidth="2.5"
          />
          
          {/* Camera Lens in Center of Pin (Radial Gradient for glass look) */}
          <circle cx="225" cy="145" r="13" fill="url(#lensGrad)" stroke="url(#goldGradLight)" strokeWidth="2" />
          <circle cx="222" cy="142" r="4" fill="#FFFFFF" opacity="0.6" />

          {/* Film Conical Projector Lens cone protruding on the right */}
          <path
            d="M 254,133 L 285,120 L 285,170 L 254,157 Z"
            fill="url(#goldGradLight)"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
          />
          {/* Lens horizontal grooves */}
          <line x1="262" y1="130" x2="262" y2="160" stroke="#73540F" strokeWidth="1.5" opacity="0.4" />
          <line x1="270" y1="126" x2="270" y2="164" stroke="#73540F" strokeWidth="1.5" opacity="0.4" />
          <line x1="278" y1="123" x2="278" y2="167" stroke="#73540F" strokeWidth="1.5" opacity="0.4" />

          {/* Projector Base Stand */}
          <path d="M 215,190 L 205,212 L 245,212 L 235,190 Z" fill="url(#goldGrad)" />
        </g>

        {/* Traditional Serif High-Contrast Typography Wordmark */}
        <text
          x="180"
          y="255"
          textAnchor="middle"
          fontFamily="Playfair Display, Cormorant Garamond, Georgia, serif"
          fontSize="36"
          fontWeight="600"
          letterSpacing="0.04em"
        >
          <tspan fill="url(#silverMetallic)">Cine</tspan>
          <tspan fill="url(#goldMetallic)">Venue</tspan>
        </text>

        {/* Luxury Subtitle */}
        <text
          x="180"
          y="278"
          textAnchor="middle"
          fill="#A3A3A3"
          fontFamily="DM Sans, sans-serif"
          fontSize="10"
          fontWeight="500"
          letterSpacing="0.35em"
          opacity="0.8"
        >
          ELITE CINEMA CLUB
        </text>
      </svg>
    </div>
  );
}
