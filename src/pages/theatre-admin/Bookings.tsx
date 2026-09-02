import React, { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Filter,
  Mail,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  X,
  Phone,
  User,
  Film,
  Download,
  Printer,
  Send,
  ArrowUpDown,
  TrendingDown,
  Clock,
  ShieldCheck,
  Percent,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Booking } from "../../types";

interface BookingsProps {
  theatreName: string;
  bookings: Booking[];
  onUpdateBookings?: (updatedBookings: Booking[]) => void;
}

interface RefundClaim {
  id: string;
  bookingId: string;
  customerName: string;
  movieTitle: string;
  showTime: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedDate: string;
}

export default function Bookings({ theatreName, bookings, onUpdateBookings }: BookingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"all" | "refunds">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  
  // Selected booking for detailed modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Local/Session level Bookings list to support full cancellation state changes
  const [localBookings, setLocalBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(`cine_bookings_isolated_${theatreName}`);
    if (saved) return JSON.parse(saved);
    
    // Fallback: populate with some high-fidelity custom items for this specific theatre
    const baseBookings = bookings.filter(b => b.theatreName === theatreName);
    if (baseBookings.length > 0) return baseBookings;

    return [
      {
        id: "BK-829104",
        movieTitle: "Kalki 2898 AD",
        theatreName,
        seats: ["A3", "A4"],
        totalPrice: 530,
        date: "Today",
        timeSlot: "07:30 PM",
        status: "Settled",
        userEmail: "member@cinevenue.com",
        city: "Hyderabad",
        userName: "Premium Member",
        mobileNumber: "9876543210"
      },
      {
        id: "BK-193042",
        movieTitle: "Stree 2",
        theatreName,
        seats: ["F12", "F13", "F14"],
        totalPrice: 660,
        date: "Today",
        timeSlot: "04:30 PM",
        status: "Pending",
        userEmail: "shreyas.pant@gmail.com",
        city: "Hyderabad",
        userName: "Shreyas Pant",
        mobileNumber: "9988224411"
      },
      {
        id: "BK-552910",
        movieTitle: "Deadpool & Wolverine",
        theatreName,
        seats: ["J1", "J2"],
        totalPrice: 600,
        date: "Today",
        timeSlot: "10:15 PM",
        status: "Cancelled",
        userEmail: "vignesh.r@yahoo.co.in",
        city: "Hyderabad",
        userName: "Vignesh Raghavan",
        mobileNumber: "9123456780"
      }
    ];
  });

  // Refund Claims State (local persistent storage)
  const [refundClaims, setRefundClaims] = useState<RefundClaim[]>(() => {
    const saved = localStorage.getItem(`cine_refund_claims_${theatreName}`);
    return saved ? JSON.parse(saved) : [
      {
        id: "REF-4019",
        bookingId: "BK-193042",
        customerName: "Shreyas Pant",
        movieTitle: "Stree 2",
        showTime: "04:30 PM",
        amount: 660,
        reason: "Family emergency, unable to reach the theater in time. Requesting refund.",
        status: "Pending",
        requestedDate: "Today"
      },
      {
        id: "REF-2910",
        bookingId: "BK-552910",
        customerName: "Vignesh Raghavan",
        movieTitle: "Deadpool & Wolverine",
        showTime: "10:15 PM",
        amount: 600,
        reason: "Booked incorrect time slot accidentally.",
        status: "Approved",
        requestedDate: "Yesterday"
      }
    ];
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem(`cine_bookings_isolated_${theatreName}`, JSON.stringify(localBookings));
    if (onUpdateBookings) {
      onUpdateBookings(localBookings);
    }
  }, [localBookings]);

  useEffect(() => {
    localStorage.setItem(`cine_refund_claims_${theatreName}`, JSON.stringify(refundClaims));
  }, [refundClaims]);

  // Handle manual cancel booking
  const handleCancelBooking = (bookingId: string) => {
    if (confirm(`Are you sure you want to cancel booking ${bookingId}? Seats will be released instantly.`)) {
      setLocalBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(p => p ? { ...p, status: "Cancelled" } : null);
      }
      showToastMsg(`Booking ${bookingId} cancelled successfully!`);
    }
  };

  // Resend via Email/SMS
  const handleResendNotification = (b: Booking, type: "Email" | "SMS") => {
    showToastMsg(`Resending Ticket via ${type} to ${type === "Email" ? b.userEmail : b.mobileNumber || "client's phone"}...`);
    setTimeout(() => {
      alert(`API Success! Ticket details for booking ${b.id} dispatched via secure CineVenue gateway!`);
    }, 800);
  };

  // Reprint ticket simulator
  const handleReprintTicket = (b: Booking) => {
    showToastMsg(`Spooling printer job for ticket ${b.id}...`);
    setTimeout(() => {
      alert(`POS Printer Spool Successful!\nTicket ID: ${b.id}\nMovie: ${b.movieTitle}\nSeats: ${b.seats.join(", ")}\nTotal: ₹${b.totalPrice}`);
    }, 600);
  };

  // Download ticket PDF simulator
  const handleDownloadTicket = (b: Booking) => {
    showToastMsg(`Generating high-res secure PDF receipt for ${b.id}...`);
    setTimeout(() => {
      alert(`Download started: ticket_receipt_${b.id}.pdf`);
    }, 500);
  };

  // Approve Refund Claim
  const handleApproveRefund = (claimId: string, bookingId: string) => {
    setRefundClaims(prev =>
      prev.map(c => (c.id === claimId ? { ...c, status: "Approved" } : c))
    );
    setLocalBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
    );
    showToastMsg(`Refund claim ${claimId} approved! Funds routed back.`);
  };

  // Reject Refund Claim
  const handleRejectRefund = (claimId: string) => {
    setRefundClaims(prev =>
      prev.map(c => (c.id === claimId ? { ...c, status: "Rejected" } : c))
    );
    showToastMsg(`Refund claim ${claimId} rejected.`);
  };

  // Filtering Logic
  const filteredBookings = localBookings.filter((b) => {
    const matchesSearch =
      b.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.userName && b.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.mobileNumber && b.mobileNumber.includes(searchTerm));
    
    const matchesStatus =
      statusFilter === "All" ||
      b.status === statusFilter;
    
    const matchesDate = !dateFilter || b.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 text-left select-none relative pb-12 text-xs">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl bg-gold text-[#0A0A0B] font-bold flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide flex items-center gap-2">
            <Ticket className="w-6 h-6 text-gold" />
            <span>Ticketing & Booking Core</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit user seat bookings, dispatch multi-channel vouchers, and resolve customer refund requests
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#121215] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeSubTab === "all"
                ? "bg-gold text-black shadow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Active Bookings ({filteredBookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("refunds")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeSubTab === "refunds"
                ? "bg-gold text-black shadow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Refund Requests ({refundClaims.filter(r => r.status === "Pending").length})
          </button>
        </div>
      </div>

      {activeSubTab === "all" ? (
        <>
          {/* Filtering controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-[#121215] border border-white/5 p-4 rounded-xl shadow-md">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold pl-10 pr-4 py-2.5 rounded-xl text-text-primary focus:outline-none transition-all placeholder:text-text-muted text-xs font-mono"
                placeholder="Search Booking ID, Customer Name, Mobile, Movie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted uppercase text-[9px] font-bold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0A0A0B]">All Bookings</option>
                  <option value="Settled" className="bg-[#0A0A0B]">Settled / Paid</option>
                  <option value="Pending" className="bg-[#0A0A0B]">Pending Gateway</option>
                  <option value="Cancelled" className="bg-[#0A0A0B]">Cancelled / Released</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-text-muted uppercase text-[9px] font-bold">Show Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#0A0A0B]">All Dates</option>
                  <option value="Today" className="bg-[#0A0A0B]">Today</option>
                  <option value="Tomorrow" className="bg-[#0A0A0B]">Tomorrow</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Bookings List Table */}
          <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-text-secondary border-b border-white/5">
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booking Code</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Movie Film</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Timing Slot</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booked Seats</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Gross Cost</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booking Status</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 font-mono font-semibold text-gold">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="hover:underline font-mono font-semibold text-gold text-left bg-transparent border-0 cursor-pointer"
                        >
                          {b.id}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="space-y-0.5 text-left">
                          <strong className="text-text-primary text-[11px] block">{b.userName || "Premium Member"}</strong>
                          <span className="text-text-muted font-mono block text-[9px]">{b.userEmail || "guest@cinevenue.com"}</span>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-text-primary">{b.movieTitle}</td>
                      <td className="py-4 font-mono text-text-secondary">{b.timeSlot}</td>
                      <td className="py-4">
                        <div className="flex gap-1 flex-wrap">
                          {b.seats.map((seat) => (
                            <span
                              key={seat}
                              className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-secondary font-bold"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold text-text-primary">₹{b.totalPrice}</td>
                      <td className="py-4">
                        {b.status === "Settled" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Active / Paid
                          </span>
                        )}
                        {b.status === "Pending" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                        {b.status === "Cancelled" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-text-primary rounded uppercase font-bold text-[9px] border border-white/5 cursor-pointer"
                          >
                            Details
                          </button>
                          {b.status !== "Cancelled" && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-2 py-1 bg-red-500/5 hover:bg-red-500 hover:text-black text-red-400 rounded uppercase font-bold text-[9px] border border-red-500/10 cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-16 text-text-muted space-y-2">
                <Ticket className="w-12 h-12 mx-auto opacity-10" />
                <p className="text-xs">No active bookings found matching your search.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* REFUND CLAIMS TAB VIEW */
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Customer Refund & Claims Dashboard</h3>
            <p className="text-[11px] text-text-secondary mt-0.5">Approve ticket cancellation compensation claim logs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-text-secondary border-b border-white/5">
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Claim ID</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booking Code</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Customer Name</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Movie Film</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Claim Amount</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Reason justification</th>
                  <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Refund Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {refundClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-mono font-semibold text-text-muted">{claim.id}</td>
                    <td className="py-4 font-mono font-semibold text-gold">{claim.bookingId}</td>
                    <td className="py-4 font-bold text-text-primary">{claim.customerName}</td>
                    <td className="py-4 text-text-secondary">{claim.movieTitle} ({claim.showTime})</td>
                    <td className="py-4 font-mono font-bold text-gold">₹{claim.amount}</td>
                    <td className="py-4 text-text-muted max-w-xs truncate leading-relaxed" title={claim.reason}>{claim.reason}</td>
                    <td className="py-4 text-right">
                      {claim.status === "Pending" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveRefund(claim.id, claim.bookingId)}
                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded font-bold uppercase text-[9px] border-0 cursor-pointer"
                          >
                            Approve Refund
                          </button>
                          <button
                            onClick={() => handleRejectRefund(claim.id)}
                            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 rounded font-bold uppercase text-[9px] border border-red-500/10 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          claim.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {claim.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED BOOKING DIALOG OVERLAY */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[#0A0A0B]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/5 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[fadeIn_0.2s_ease-out] text-left">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-text-secondary hover:text-white transition-all cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title block */}
            <div className="p-6 md:p-8 border-b border-white/5 space-y-1">
              <span className="text-[10px] text-gold font-mono font-bold uppercase tracking-wider">CineVenue Core Ledger Verification</span>
              <h3 className="text-base font-bold text-white font-display">
                Voucher ID: <span className="font-mono text-gold">{selectedBooking.id}</span>
              </h3>
            </div>

            {/* Content info layout */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gold" />
                    <span>Customer Details</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="text-text-muted">Full Name:</span><strong className="text-white">{selectedBooking.userName || "Premium Member"}</strong></div>
                    <div className="flex justify-between"><span className="text-text-muted">Email address:</span><strong className="text-white font-mono">{selectedBooking.userEmail || "guest@cinevenue.com"}</strong></div>
                    <div className="flex justify-between"><span className="text-text-muted">Mobile phone:</span><strong className="text-white font-mono">{selectedBooking.mobileNumber || "+91 98765 43210"}</strong></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-gold" />
                    <span>Screening & Tickets</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="text-text-muted">Movie Title:</span><strong className="text-white">{selectedBooking.movieTitle}</strong></div>
                    <div className="flex justify-between"><span className="text-text-muted">Showtime Slot:</span><strong className="text-white font-mono">{selectedBooking.timeSlot}</strong></div>
                    <div className="flex justify-between"><span className="text-text-muted">Screen Hall:</span><strong className="text-white">Audi 1 (IMAX)</strong></div>
                    <div className="flex justify-between"><span className="text-text-muted">Booked Date:</span><strong className="text-white font-mono">{selectedBooking.date}</strong></div>
                  </div>
                </div>
              </div>

              {/* Seats and pricing categories */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">Assigned Seat row layout</span>
                  <div className="flex gap-1">
                    {selectedBooking.seats.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold text-[10px] font-mono font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-text-muted block">PAYMENT METHOD</span>
                    <strong className="text-white uppercase">Razorpay Payment Gateway</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block">TOTAL GROSS AMOUNT</span>
                    <strong className="text-gold font-mono text-xs">₹{selectedBooking.totalPrice}.00 (Incl. Taxes)</strong>
                  </div>
                </div>
              </div>

              {/* Action Controls Deck */}
              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleResendNotification(selectedBooking, "Email")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 flex items-center gap-1.5 uppercase font-bold text-[9px]"
                    title="Resend Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    <span>Resend Email</span>
                  </button>
                  <button
                    onClick={() => handleResendNotification(selectedBooking, "SMS")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 flex items-center gap-1.5 uppercase font-bold text-[9px]"
                    title="Resend SMS"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Resend SMS</span>
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleReprintTicket(selectedBooking)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 flex items-center gap-1.5 uppercase font-bold text-[9px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reprint</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(selectedBooking)}
                    className="p-2 rounded-xl bg-[#0A0A0B] hover:bg-black text-white border border-white/10 flex items-center gap-1.5 uppercase font-bold text-[9px]"
                  >
                    <Download className="w-3.5 h-3.5 text-gold" />
                    <span>Download Ticket</span>
                  </button>
                  {selectedBooking.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 uppercase font-bold text-[9px]"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
