import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Ticket, ExternalLink, Edit, Trash2, Search, CheckCircle, Ban, Plus } from 'lucide-react';
import { getEvents, saveEvent, deleteEvent, getBookings } from '../../../services/eventBookingService';
import type { EventItem } from '../../../types/eventBooking';

export default function EventsList() {
  const [events, setEvents] = useState<EventItem[]>(() => getEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const bookings = useMemo(() => getBookings(), []);

  const totalSold = useMemo(() => {
    return bookings.reduce((sum, b) => sum + b.ticketCount, 0);
  }, [bookings]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + b.pricing.finalAmount, 0);
  }, [bookings]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const handleToggleStatus = (evt: EventItem) => {
    const nextStatus = evt.status === 'Published' ? 'Cancelled' : 'Published';
    const updated = saveEvent({ ...evt, status: nextStatus });
    setEvents(getEvents());
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    deleteEvent(id);
    setEvents(getEvents());
  };

  return (
    <div className="space-y-6 text-left">
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="event-stats-block">
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold font-mono">
            Active Published Events
          </span>
          <p className="text-2xl font-bold text-text-primary font-display">{events.length}</p>
        </div>
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold font-mono">
            Total Passes Booked
          </span>
          <p className="text-2xl font-bold text-gold font-display">
            {totalSold.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold font-mono">
            Gross Event Revenue
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Event Inventory & Scheduling</h3>
            <p className="text-xs text-white/50">Manage ticket capacities, pricing, and live booking gates.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, category, city..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="bg-white/5 text-white uppercase font-mono text-[9px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date & City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Tickets Sold</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((evt) => {
                const isPublished = evt.status === 'Published';
                return (
                  <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white text-sm">{evt.title}</p>
                      <p className="text-[10px] text-white/40 font-mono">{evt.id} • {evt.seatingType}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/80">{evt.date}</p>
                      <p className="text-[10px] text-white/40">{evt.city}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono uppercase ${
                          isPublished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="text-white font-bold">{evt.soldCount}</span> / {evt.totalCapacity}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(evt)}
                          title={isPublished ? 'Cancel Event' : 'Publish Event'}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-all ${
                            isPublished
                              ? 'bg-white/5 hover:bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {isPublished ? 'Cancel' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="Delete Event"
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
