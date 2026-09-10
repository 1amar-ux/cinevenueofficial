import React, { useState, useMemo } from 'react';
import {
  X, Plus, QrCode, Users, DollarSign, Calendar, MapPin,
  CheckCircle2, AlertCircle, Search, Download, ShieldCheck,
  RefreshCw, Check, Ticket, Eye, Ban, Edit3, Trash2, ArrowUpRight
} from 'lucide-react';
import type { EventItem, EventBookingRecord } from '../../types/eventBooking';
import {
  getEvents,
  saveEvent,
  getBookings,
  validateAndCheckInTicket,
  getOrganizerEventStats
} from '../../services/eventBookingService';

interface OrganizerEventHubProps {
  onClose: () => void;
  userEmail?: string | null;
}

export default function OrganizerEventHub({
  onClose,
  userEmail,
}: OrganizerEventHubProps) {
  const [events, setEvents] = useState<EventItem[]>(() => getEvents());
  const [bookings, setBookings] = useState<EventBookingRecord[]>(() => getBookings());
  const [activeTab, setActiveTab] = useState<'events' | 'scanner' | 'attendees' | 'financials'>('events');

  // Scanner state
  const [scanInputCode, setScanInputCode] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    booking?: EventBookingRecord;
    alreadyCheckedIn?: boolean;
  } | null>(null);

  // Attendee search & filter
  const [attendeeSearch, setAttendeeSearch] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');

  // Selected event for quick stats
  const activeEvent = events[0];
  const stats = useMemo(() => {
    if (!activeEvent) return null;
    return getOrganizerEventStats(activeEvent.id);
  }, [activeEvent, bookings]);

  // Handle Manual/Camera Scan
  const handleValidatePass = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInputCode.trim()) return;

    const result = validateAndCheckInTicket(scanInputCode.trim(), userEmail || 'Organizer Staff');
    setScanResult(result);
    setScanInputCode('');

    // Refresh bookings state
    setBookings(getBookings());
  };

  // Filtered Attendees
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchEvent = selectedEventFilter === 'ALL' || b.eventId === selectedEventFilter;
      const q = attendeeSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.passCode.toLowerCase().includes(q) ||
        b.primaryAttendee.name.toLowerCase().includes(q) ||
        b.primaryAttendee.email.toLowerCase().includes(q) ||
        b.primaryAttendee.phone.includes(q);
      return matchEvent && matchQuery;
    });
  }, [bookings, selectedEventFilter, attendeeSearch]);

  // Export Attendees to CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Pass Code', 'Event', 'Primary Attendee', 'Email', 'Phone', 'Pass Count', 'Total Paid (INR)', 'Checked In', 'Booking Date'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.passCode,
      `"${b.eventTitle.replace(/"/g, '""')}"`,
      `"${b.primaryAttendee.name.replace(/"/g, '""')}"`,
      b.primaryAttendee.email,
      b.primaryAttendee.phone,
      b.ticketCount,
      b.pricing.finalAmount,
      b.checkedIn ? `YES (${b.checkedInAt || ''})` : 'NO',
      b.bookedAt.split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CineVenue_Attendees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0E0E12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-left my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/15 via-transparent to-transparent px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold font-mono block">
                CINEVENUE EVENT ORGANIZER PORTAL
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Live Event Management & Gate Check-in
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.01] text-xs font-semibold text-center font-mono">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'events' ? 'text-gold border-b-2 border-gold bg-gold/5 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">My Events</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'scanner' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Gate Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('attendees')}
            className={`py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'attendees' ? 'text-gold border-b-2 border-gold bg-gold/5 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Attendee Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'financials' ? 'text-gold border-b-2 border-gold bg-gold/5 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Settlements</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: MY EVENTS                                          */}
          {/* ========================================================= */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Active Events</h3>
                  <p className="text-xs text-white/50">Manage ticket tiers, seating configurations, and event status.</p>
                </div>
                <button
                  onClick={() => alert('Event Creator is available in the CineVenue Admin Panel or submit an organizer registration.')}
                  className="px-4 py-2 bg-gold hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-gold/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-gold/30 transition-all space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="w-20 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase bg-gold/10 text-gold border border-gold/30 px-1.5 py-0.5 rounded">
                            {evt.category}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {evt.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{evt.title}</h4>
                        <p className="text-[11px] text-white/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gold" /> {evt.date} • {evt.startTime}
                        </p>
                        <p className="text-[11px] text-white/50 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-gold" /> {evt.venueName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl text-center font-mono text-[11px] border border-white/5">
                      <div>
                        <span className="text-[8px] text-white/40 uppercase block">Total Capacity</span>
                        <span className="font-bold text-white">{evt.totalCapacity}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-white/40 uppercase block">Tickets Sold</span>
                        <span className="font-bold text-gold">{evt.soldCount}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-white/40 uppercase block">Remaining</span>
                        <span className="font-bold text-emerald-400">{Math.max(evt.totalCapacity - evt.soldCount, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: GATE QR SCANNER & PASS CHECK-IN                    */}
          {/* ========================================================= */}
          {activeTab === 'scanner' && (
            <div className="space-y-6 max-w-xl mx-auto text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  LIVE GATE TERMINAL
                </span>
                <h3 className="text-xl font-bold text-white pt-2">Scan or Enter Attendee Pass</h3>
                <p className="text-xs text-white/50">
                  Scan barcode/QR code from user device or enter the 8-character security pass code printed on the ticket.
                </p>
              </div>

              {/* Code Entry / Scanner Input Box */}
              <form onSubmit={handleValidatePass} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={scanInputCode}
                    onChange={(e) => setScanInputCode(e.target.value)}
                    placeholder="Enter Pass Code (e.g. PASS-A9B2-482) or Booking ID"
                    className="w-full bg-white/5 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-2xl px-4 py-3.5 text-center font-mono text-sm sm:text-base text-white placeholder-white/30 uppercase tracking-wider focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Validate & Admit Guest
                </button>
              </form>

              {/* Scan Validation Result Display */}
              {scanResult && (
                <div
                  className={`p-5 rounded-2xl border text-left space-y-3 animate-fade-in ${
                    scanResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : scanResult.alreadyCheckedIn
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-sm">{scanResult.message}</span>
                  </div>

                  {scanResult.booking && (
                    <div className="bg-black/40 p-3.5 rounded-xl space-y-1.5 font-mono text-xs text-white/90 border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-white/40">Attendee:</span>
                        <span className="font-bold text-white">{scanResult.booking.primaryAttendee.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Pass Count:</span>
                        <span className="font-bold text-gold">{scanResult.booking.ticketCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Seats/Tier:</span>
                        <span className="text-emerald-400 font-bold">
                          {scanResult.booking.seatCodes?.join(', ') || scanResult.booking.ticketTypeName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Event:</span>
                        <span className="truncate max-w-xs">{scanResult.booking.eventTitle}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ATTENDEE ROSTER                                    */}
          {/* ========================================================= */}
          {activeTab === 'attendees' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      placeholder="Search attendee, pass code, email..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                    />
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <select
                    value={selectedEventFilter}
                    onChange={(e) => setSelectedEventFilter(e.target.value)}
                    className="bg-[#141419] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    <option value="ALL">All Events</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gold" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Attendees Table */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.01]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/70">
                    <thead className="bg-white/5 uppercase font-mono text-[9px] text-white/40 border-b border-white/10">
                      <tr>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Booking ID / Code</th>
                        <th className="p-3">Event</th>
                        <th className="p-3 text-center">Tickets</th>
                        <th className="p-3">Total Paid</th>
                        <th className="p-3">Check-in Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/30">
                            No attendees found matching search.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-sans font-bold text-white">
                              <div>{b.primaryAttendee.name}</div>
                              <span className="text-[10px] text-white/40 font-mono">{b.primaryAttendee.phone}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-white">{b.id}</span>
                              <span className="block text-[10px] text-gold">{b.passCode}</span>
                            </td>
                            <td className="p-3 font-sans truncate max-w-xs text-white/80">
                              {b.eventTitle}
                            </td>
                            <td className="p-3 text-center font-bold text-gold">
                              {b.ticketCount}
                            </td>
                            <td className="p-3 font-bold text-white">
                              ₹{b.pricing.finalAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              {b.checkedIn ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <Check className="w-2.5 h-2.5" /> Admitted ({b.checkedInAt})
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FINANCIALS & SETTLEMENTS                           */}
          {/* ========================================================= */}
          {activeTab === 'financials' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] text-white/40 uppercase block">Total Tickets Sold</span>
                  <span className="text-xl font-bold text-gold">{stats.ticketsSold}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] text-white/40 uppercase block">Gross Ticket Sales</span>
                  <span className="text-xl font-bold text-white">₹{stats.grossRevenueINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] text-white/40 uppercase block">CineVenue Fee (5%)</span>
                  <span className="text-xl font-bold text-rose-400">-₹{stats.platformFeeINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-[9px] text-emerald-400 uppercase block">Net Organizer Payout</span>
                  <span className="text-xl font-bold text-emerald-400">₹{stats.netPayoutINR.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white">Settlement Status</h4>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
                  <span>Direct Bank Payout Schedule:</span>
                  <span className="text-emerald-400 font-bold">Auto-settled T+2 Days Post Event</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  CineVenue deposits ticket revenue directly into your verified bank account minus applicable gateway fees and 5% platform commission.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
