import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  QrCode,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getBookings,
  getBookingPassId,
  getBookingOrderId,
  isFreeEventBooking,
  validateAndCheckInTicket,
  reverseCheckInTicket,
} from '../../../services/eventBookingService';
import {
  generateAndDownloadEventPassPdf,
  printEventPassPdf,
  sendEventPassToEmail,
  formatEventDateAndDay,
} from '../../../utils/eventPassPdf';
import type { EventBookingRecord } from '../../../types/eventBooking';

export default function EventPassesManager({
  initialEventId = null,
  onSwitchToScanner,
}: {
  initialEventId?: string | null;
  onSwitchToScanner?: () => void;
} = {}) {
  const [bookings, setBookings] = useState<EventBookingRecord[]>(() => getBookings());
  const [selectedPass, setSelectedPass] = useState<EventBookingRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>(initialEventId || 'ALL');
  const [passTypeFilter, setPassTypeFilter] = useState('ALL');
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL'); // ALL, FREE, PAID
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL'); // ALL, CHECKED_IN, NOT_CHECKED_IN

  React.useEffect(() => {
    if (initialEventId) {
      setEventFilter(initialEventId);
    }
  }, [initialEventId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshData = () => {
    const updated = getBookings();
    setBookings(updated);
    if (selectedPass) {
      const refreshedSelected = updated.find((b) => b.id === selectedPass.id);
      if (refreshedSelected) setSelectedPass(refreshedSelected);
    }
  };

  // Distinct event list for filter dropdown
  const distinctEvents = useMemo(() => {
    const map = new Map<string, string>();
    bookings.forEach((b) => {
      map.set(b.eventId, b.eventTitle);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [bookings]);

  // Distinct pass types
  const distinctPassTypes = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.ticketTypeName) set.add(b.ticketTypeName);
    });
    return Array.from(set);
  }, [bookings]);

  // Filtered passes
  const filteredPasses = useMemo(() => {
    return bookings.filter((pass) => {
      const passId = getBookingPassId(pass).toLowerCase();
      const orderId = getBookingOrderId(pass).toLowerCase();
      const attendeeName = (pass.primaryAttendee?.name || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Search matching Pass ID, Attendee Name, Order ID
      if (q && !passId.includes(q) && !attendeeName.includes(q) && !orderId.includes(q)) {
        return false;
      }

      // Event filter
      if (eventFilter !== 'ALL' && pass.eventId !== eventFilter) {
        return false;
      }

      // Pass Type filter
      if (passTypeFilter !== 'ALL' && pass.ticketTypeName !== passTypeFilter) {
        return false;
      }

      // Free / Paid filter
      const isFree = isFreeEventBooking(pass);
      if (feeTypeFilter === 'FREE' && !isFree) return false;
      if (feeTypeFilter === 'PAID' && isFree) return false;

      // Payment Status filter
      if (paymentStatusFilter !== 'ALL') {
        const status = (pass.paymentStatus || '').toUpperCase();
        if (status !== paymentStatusFilter.toUpperCase()) return false;
      }

      // Check-in filter
      if (checkInFilter === 'CHECKED_IN' && !pass.checkedIn) return false;
      if (checkInFilter === 'NOT_CHECKED_IN' && pass.checkedIn) return false;

      return true;
    });
  }, [bookings, searchQuery, eventFilter, passTypeFilter, feeTypeFilter, paymentStatusFilter, checkInFilter]);

  // Dashboard Metrics
  const stats = useMemo(() => {
    const targetBookings = eventFilter === 'ALL' ? bookings : bookings.filter((b) => b.eventId === eventFilter);
    let total = targetBookings.length;
    let paid = 0;
    let free = 0;
    let vip = 0;
    let general = 0;
    let checkedIn = 0;
    let notCheckedIn = 0;
    let cancelled = 0;

    targetBookings.forEach((b) => {
      const isFree = isFreeEventBooking(b);
      if (isFree) free++;
      else paid++;

      const typeUpper = (b.ticketTypeName || '').toUpperCase();
      if (typeUpper.includes('VIP')) vip++;
      else general++;

      if (b.bookingStatus === 'Cancelled' || b.paymentStatus === 'CANCELLED') {
        cancelled++;
      } else if (b.checkedIn) {
        checkedIn++;
      } else {
        notCheckedIn++;
      }
    });

    return {
      total,
      paid,
      free,
      vip,
      general,
      checkedIn,
      notCheckedIn,
      cancelled,
    };
  }, [bookings, eventFilter]);

  // Actions
  const handleCheckInToggle = (pass: EventBookingRecord) => {
    if (pass.checkedIn) {
      // Reverse check-in
      const res = reverseCheckInTicket(getBookingPassId(pass));
      if (res.success) {
        showToast(res.message);
        refreshData();
      }
    } else {
      // Check in
      const res = validateAndCheckInTicket(getBookingPassId(pass));
      if (res.success) {
        showToast(res.message);
        refreshData();
      } else {
        showToast(res.message);
      }
    }
  };

  const handleDownload = (pass: EventBookingRecord) => {
    generateAndDownloadEventPassPdf(pass);
    showToast(`Downloading Vertical Event Pass PDF: ${getBookingPassId(pass)}`);
  };

  const handlePrint = (pass: EventBookingRecord) => {
    printEventPassPdf(pass);
    showToast(`Print dialog triggered for Pass: ${getBookingPassId(pass)}`);
  };

  const handleResend = async (pass: EventBookingRecord) => {
    const res = await sendEventPassToEmail(pass);
    showToast(res.message);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16161E] border border-gold text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-gold shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>Event</span>
            <span className="text-gold">Passes</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage, verify, download, and check in official CineVenue vertical A4 event passes.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gold" /> Refresh Passes
        </button>
      </div>

      {/* 13. Event-Specific Pass Management Banner */}
      {eventFilter !== 'ALL' && (
        <div className="bg-gradient-to-r from-black/80 via-gold/10 to-black/80 border border-gold/40 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-mono uppercase text-gold font-bold tracking-wider">
                  ADMIN EVENT PASS MANAGEMENT
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {distinctEvents.find((e) => e.id === eventFilter)?.title || 'Selected Event'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Displaying passes issued exclusively for this event.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEventFilter('ALL')}
                className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                [View All Passes]
              </button>
              {onSwitchToScanner && (
                <button
                  onClick={onSwitchToScanner}
                  className="text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> [QR Scanner]
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. EVENT PASS ADMIN DASHBOARD METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Total Passes</p>
          <p className="text-lg font-black text-white mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-gold tracking-wider">Paid Passes</p>
          <p className="text-lg font-black text-gold mt-1">{stats.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Free Passes</p>
          <p className="text-lg font-black text-emerald-400 mt-1">{stats.free.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">VIP Passes</p>
          <p className="text-lg font-black text-amber-300 mt-1">{stats.vip.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">General</p>
          <p className="text-lg font-black text-blue-400 mt-1">{stats.general.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Checked-In</p>
          <p className="text-lg font-black text-emerald-400 mt-1">{stats.checkedIn.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-amber-500/20 bg-amber-500/5 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Not Checked-In</p>
          <p className="text-lg font-black text-amber-400 mt-1">{stats.notCheckedIn.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-red-500/20 bg-red-500/5 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Cancelled</p>
          <p className="text-lg font-black text-red-400 mt-1">{stats.cancelled.toLocaleString()}</p>
        </div>
      </div>

      {/* 21. FILTERS & SEARCH */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by Pass ID / Attendee Name / Order ID */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Pass ID, Attendee, Order ID..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Event Filter */}
          <div>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Events</option>
              {distinctEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Pass Type Filter */}
          <div>
            <select
              value={passTypeFilter}
              onChange={(e) => setPassTypeFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Pass Types</option>
              {distinctPassTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Free / Paid Filter */}
          <div>
            <select
              value={feeTypeFilter}
              onChange={(e) => setFeeTypeFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Fees (Free & Paid)</option>
              <option value="PAID">Paid Events Only</option>
              <option value="FREE">Free Events Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Check-In Status Filter */}
          <div>
            <select
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Check-In Statuses</option>
              <option value="CHECKED_IN">Checked-In Only</option>
              <option value="NOT_CHECKED_IN">Not Checked-In Only</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="FREE">FREE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span>
              Showing <strong className="text-white">{filteredPasses.length}</strong> of{' '}
              <strong className="text-white">{bookings.length}</strong> passes
            </span>
            {(searchQuery ||
              eventFilter !== 'ALL' ||
              passTypeFilter !== 'ALL' ||
              feeTypeFilter !== 'ALL' ||
              paymentStatusFilter !== 'ALL' ||
              checkInFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setEventFilter('ALL');
                  setPassTypeFilter('ALL');
                  setFeeTypeFilter('ALL');
                  setPaymentStatusFilter('ALL');
                  setCheckInFilter('ALL');
                }}
                className="text-gold hover:underline text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 12. PASS LIST TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-text-muted uppercase font-mono text-[9px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">PASS ID</th>
                <th className="px-4 py-3.5">ATTENDEE</th>
                <th className="px-4 py-3.5">EVENT</th>
                <th className="px-4 py-3.5">PASS TYPE</th>
                <th className="px-4 py-3.5">ORDER ID</th>
                <th className="px-4 py-3.5">FEE</th>
                <th className="px-4 py-3.5">PAYMENT</th>
                <th className="px-4 py-3.5">CHECK-IN</th>
                <th className="px-4 py-3.5">DATE</th>
                <th className="px-4 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPasses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-white/30">
                    No passes match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredPasses.map((pass) => {
                  const passId = getBookingPassId(pass);
                  const orderId = getBookingOrderId(pass);
                  const isFree = isFreeEventBooking(pass);
                  const feeAmount = pass.pricing?.finalAmount ?? pass.totalPrice ?? pass.ticketPrice ?? 0;
                  const createdDate = new Date(pass.bookedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* PASS ID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-gold whitespace-nowrap">
                        {passId}
                      </td>

                      {/* ATTENDEE */}
                      <td className="px-4 py-3.5 font-sans">
                        <p className="font-bold text-white text-xs">{pass.primaryAttendee?.name || 'Attendee'}</p>
                        <p className="text-[10px] text-text-muted font-mono">{pass.primaryAttendee?.phone || '—'}</p>
                      </td>

                      {/* EVENT */}
                      <td className="px-4 py-3.5 font-sans text-white max-w-[180px] truncate" title={pass.eventTitle}>
                        {pass.eventTitle}
                      </td>

                      {/* PASS TYPE */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (pass.ticketTypeName || '').toUpperCase().includes('VIP')
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-white/80'
                          }`}
                        >
                          {pass.ticketTypeName || (isFree ? 'General' : 'VIP')}
                        </span>
                      </td>

                      {/* ORDER ID */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-white/70 whitespace-nowrap">
                        {orderId}
                      </td>

                      {/* FEE (Free vs Paid amount) */}
                      <td className="px-4 py-3.5 font-mono font-bold whitespace-nowrap">
                        {isFree ? (
                          <span className="text-emerald-400 font-extrabold">FREE</span>
                        ) : (
                          <span className="text-white">₹{Number(feeAmount).toLocaleString('en-IN')}</span>
                        )}
                      </td>

                      {/* PAYMENT STATUS */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {pass.bookingStatus === 'Cancelled' || pass.paymentStatus === 'CANCELLED' ? (
                          <span className="text-red-400 font-bold text-[10px]">CANCELLED</span>
                        ) : isFree ? (
                          <span className="text-emerald-400 font-bold text-[10px]">FREE</span>
                        ) : (
                          <span className="text-gold font-bold text-[10px]">PAID</span>
                        )}
                      </td>

                      {/* CHECK-IN STATUS */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {pass.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> CHECKED-IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-2.5 h-2.5" /> NOT CHECKED-IN
                          </span>
                        )}
                      </td>

                      {/* CREATED DATE */}
                      <td className="px-4 py-3.5 text-text-muted whitespace-nowrap text-[11px]">
                        {createdDate}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW */}
                          <button
                            onClick={() => setSelectedPass(pass)}
                            title="View Pass Detail"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-white/80" />
                          </button>

                          {/* DOWNLOAD PDF */}
                          <button
                            onClick={() => handleDownload(pass)}
                            title="Download Vertical A4 PDF Pass"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gold transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* RESEND */}
                          <button
                            onClick={() => handleResend(pass)}
                            title="Resend Pass via Email"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-blue-400 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* CHECK-IN TOGGLE */}
                          <button
                            onClick={() => handleCheckInToggle(pass)}
                            title={pass.checkedIn ? 'Reverse Check-in' : 'Check-In Attendee'}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              pass.checkedIn
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {pass.checkedIn ? 'Undo' : 'Check-In'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 13. PASS DETAIL MODAL */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121217] border border-gold/40 rounded-2xl max-w-lg w-full p-6 text-white space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-lg text-white">Event Pass Details</h3>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster + Event Info */}
            <div className="space-y-4">
              {/* Event Poster */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-gold/30 bg-black flex items-center justify-center">
                <img
                  src={
                    selectedPass.bannerUrl ||
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80'
                  }
                  alt={selectedPass.eventTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Name */}
              <div>
                <h4 className="text-xl font-black text-white">{selectedPass.eventTitle}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-gold">
                    {getBookingPassId(selectedPass)}
                  </span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs font-bold text-amber-300">
                    {selectedPass.ticketTypeName || 'VIP'}
                  </span>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Attendee Name */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Pass Holder</p>
                  <p className="text-white font-bold mt-0.5">{selectedPass.primaryAttendee?.name}</p>
                  <p className="text-[10px] text-white/50 font-mono mt-0.5">
                    {selectedPass.primaryAttendee?.phone || selectedPass.primaryAttendee?.email}
                  </p>
                </div>

                {/* Pass Type */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Pass Type</p>
                  <p className="text-gold font-bold mt-0.5">
                    {selectedPass.ticketTypeName || (isFreeEventBooking(selectedPass) ? 'General' : 'VIP')}
                  </p>
                </div>

                {/* Date & Day */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Date & Day</p>
                  <p className="text-white font-bold mt-0.5">
                    {formatEventDateAndDay(selectedPass.eventDate).formattedDate}
                  </p>
                  <p className="text-[10px] text-gold font-semibold">
                    {formatEventDateAndDay(selectedPass.eventDate).day}
                  </p>
                </div>

                {/* Time */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Event Time</p>
                  <p className="text-white font-bold mt-0.5">{selectedPass.eventTime || '6:00 PM'}</p>
                </div>

                {/* Venue & Full Address */}
                <div className="col-span-2 bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Venue & Full Address</p>
                  <p className="text-gold font-bold mt-0.5">{selectedPass.venueName}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                    {selectedPass.venueAddress || `${selectedPass.venueName}, HITEC City, Hyderabad`}
                  </p>
                </div>

                {/* Event Fee */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Event Fee</p>
                  <p className="font-mono font-black mt-0.5 text-sm">
                    {isFreeEventBooking(selectedPass) ? (
                      <span className="text-emerald-400">FREE ENTRY</span>
                    ) : (
                      <span className="text-gold">
                        ₹
                        {(
                          selectedPass.pricing?.finalAmount ??
                          selectedPass.totalPrice ??
                          999
                        ).toLocaleString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>

                {/* Order ID & Payment */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Order ID</p>
                  <p className="text-white font-mono text-[11px] font-bold mt-0.5">
                    {getBookingOrderId(selectedPass)}
                  </p>
                  <p className="text-[10px] font-bold mt-1">
                    Status:{' '}
                    <span
                      className={
                        isFreeEventBooking(selectedPass) ? 'text-emerald-400' : 'text-gold'
                      }
                    >
                      {isFreeEventBooking(selectedPass) ? 'FREE' : 'PAID'}
                    </span>
                  </p>
                </div>

                {/* Check-In Status */}
                <div className="col-span-2 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Check-In Status</p>
                    <p
                      className={`text-sm font-bold mt-0.5 flex items-center gap-1.5 ${
                        selectedPass.checkedIn ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {selectedPass.checkedIn ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> CHECKED-IN
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" /> NOT CHECKED-IN
                        </>
                      )}
                    </p>
                    {selectedPass.checkedIn && selectedPass.checkedInAt && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Timestamp: {selectedPass.checkedInAt} ({selectedPass.checkedInBy || 'Gate Staff'})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCheckInToggle(selectedPass)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      selectedPass.checkedIn
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {selectedPass.checkedIn ? 'Reverse Check-In' : 'Perform Check-In'}
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-3 rounded-xl">
                <div className="bg-white p-2 rounded-lg border border-gold shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      getBookingPassId(selectedPass)
                    )}`}
                    alt="Pass QR"
                    className="w-20 h-20"
                  />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-mono font-bold text-gold">{getBookingPassId(selectedPass)}</p>
                  <p className="text-text-muted text-[11px]">
                    Authorized gate staff can scan this pass code directly with camera or barcode scanner.
                  </p>
                  <span className="inline-block text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                    SCAN AT ENTRY
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleDownload(selectedPass)}
                className="bg-gold hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => handlePrint(selectedPass)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-gold" /> Print Pass
              </button>
              <button
                onClick={() => handleResend(selectedPass)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Resend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
