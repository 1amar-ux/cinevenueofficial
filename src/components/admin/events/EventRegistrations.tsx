import React, { useState, useMemo } from 'react';
import { Search, Download, Check } from 'lucide-react';
import { getBookings } from '../../../services/eventBookingService';

export default function EventRegistrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings] = useState(() => getBookings());

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.primaryAttendee.name.toLowerCase().includes(q) ||
        b.primaryAttendee.email.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.passCode.toLowerCase().includes(q) ||
        b.eventTitle.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Pass Code', 'Attendee', 'Email', 'Phone', 'Event', 'Tickets', 'Total Paid', 'Status', 'Checked In'];
    const rows = filteredRegistrations.map((b) => [
      b.id,
      b.passCode,
      `"${b.primaryAttendee.name.replace(/"/g, '""')}"`,
      b.primaryAttendee.email,
      b.primaryAttendee.phone,
      `"${b.eventTitle.replace(/"/g, '""')}"`,
      b.ticketCount,
      b.pricing.finalAmount,
      b.bookingStatus,
      b.checkedIn ? 'YES' : 'NO',
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `CineVenue_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Event Registrations & Passes</h3>
          <p className="text-xs text-white/50">Real-time attendee roster across all events.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendee, pass code..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-secondary">
          <thead className="bg-white/5 text-white uppercase font-mono text-[9px] border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Pass Tier / Seats</th>
              <th className="px-4 py-3">Pass Code</th>
              <th className="px-4 py-3 text-right">Amount Paid</th>
              <th className="px-4 py-3 text-right">Check-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/30">
                  No event bookings found.
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-sans">
                    <p className="font-bold text-white text-sm">{reg.primaryAttendee.name}</p>
                    <p className="text-[11px] text-white/40 font-mono">{reg.primaryAttendee.phone} • {reg.primaryAttendee.email}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-white max-w-xs truncate">{reg.eventTitle}</td>
                  <td className="px-4 py-3 text-white">
                    {reg.seatCodes && reg.seatCodes.length > 0 ? reg.seatCodes.join(', ') : reg.ticketTypeName} ({reg.ticketCount}x)
                  </td>
                  <td className="px-4 py-3 font-mono text-gold font-bold">{reg.passCode}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">
                    ₹{reg.pricing.finalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {reg.checkedIn ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" /> Checked In ({reg.checkedInAt})
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Pending Entry
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
  );
}
