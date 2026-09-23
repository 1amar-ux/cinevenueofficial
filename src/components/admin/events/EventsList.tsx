import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Ticket,
  ExternalLink,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  Ban,
  Plus,
  RefreshCw,
  Eye,
  Filter,
  Users,
  Shield,
  Clock,
  MoreVertical,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { getEvents as getLocalEvents } from '../../../services/eventBookingService';

interface AdminEventItem {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  category?: string;
  eventType: 'PAID' | 'FREE';
  passMode: 'PAID' | 'FREE' | 'BOTH';
  status: 'DRAFT' | 'UPCOMING' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'SOLD_OUT';
  bookingStatus: 'NOT_OPEN' | 'OPEN' | 'CLOSED' | 'SOLD_OUT';
  posterUrl?: string;
  bannerUrl?: string;
  date: string;
  startTime?: string;
  venueName?: string;
  city?: string;
  state?: string;
  totalTicketCapacity?: number;
  totalCapacity?: number;
  soldTicketCount?: number;
  soldCount?: number;
  freePassesIssuedCount?: number;
  availableTicketCount?: number;
  createdAt?: string;
  ticketTypes?: any[];
  freePassCategories?: any[];
}

export default function EventsList({
  onEditEvent,
  onManagePasses,
  onManageFreePasses,
}: {
  onEditEvent?: (event: AdminEventItem) => void;
  onManagePasses?: (event: AdminEventItem) => void;
  onManageFreePasses?: (event: AdminEventItem) => void;
}) {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [statusActionLoading, setStatusActionLoading] = useState<string | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<AdminEventItem | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('PUBLISHED');
  const [newBookingStatus, setNewBookingStatus] = useState<string>('OPEN');

  const fetchAdminEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/events');
      if (res.data?.events && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
      } else {
        // Fallback to local storage if backend returns empty
        const local = getLocalEvents();
        setEvents(local as any);
      }
    } catch (err) {
      console.warn('Failed to load admin events from backend, falling back to local cache:', err);
      const local = getLocalEvents();
      setEvents(local as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  // Filter options
  const filterOptions = [
    { id: 'ALL', label: 'All' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'PUBLISHED', label: 'Published' },
    { id: 'ONGOING', label: 'Ongoing' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
    { id: 'PAID', label: 'Paid Events' },
    { id: 'FREE', label: 'Free Events' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Tab filter
      if (activeFilter === 'PAID' && e.eventType !== 'PAID') return false;
      if (activeFilter === 'FREE' && e.eventType !== 'FREE') return false;
      if (['DRAFT', 'UPCOMING', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(activeFilter)) {
        if (e.status !== activeFilter) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = e.title?.toLowerCase().includes(q);
        const cityMatch = e.city?.toLowerCase().includes(q);
        const venueMatch = e.venueName?.toLowerCase().includes(q);
        const catMatch = e.category?.toLowerCase().includes(q);
        return titleMatch || cityMatch || venueMatch || catMatch;
      }

      return true;
    });
  }, [events, activeFilter, searchQuery]);

  // Actions
  const handlePublish = async (event: AdminEventItem) => {
    try {
      setStatusActionLoading(event.id);
      await apiClient.post(`/admin/events/${event.id}/publish`);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to publish event: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleUnpublish = async (event: AdminEventItem) => {
    try {
      setStatusActionLoading(event.id);
      await apiClient.post(`/admin/events/${event.id}/unpublish`);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to unpublish event: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleCancelEvent = async (event: AdminEventItem) => {
    if (!window.confirm(`Are you sure you want to cancel event "${event.title}"? Booking gates will close immediately.`)) {
      return;
    }
    try {
      setStatusActionLoading(event.id);
      await apiClient.post(`/admin/events/${event.id}/cancel`);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to cancel event: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleDelete = async (event: AdminEventItem) => {
    if (!window.confirm(`Are you sure you want to delete event "${event.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      setStatusActionLoading(event.id);
      await apiClient.delete(`/admin/events/${event.id}`);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to delete event: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const openStatusModal = (event: AdminEventItem) => {
    setSelectedEventForModal(event);
    setNewStatus(event.status);
    setNewBookingStatus(event.bookingStatus);
    setStatusModalOpen(true);
  };

  const handleSaveStatusModal = async () => {
    if (!selectedEventForModal) return;
    try {
      setStatusActionLoading(selectedEventForModal.id);
      await apiClient.patch(`/admin/events/${selectedEventForModal.id}/status`, {
        status: newStatus,
        bookingStatus: newBookingStatus,
      });
      setStatusModalOpen(false);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  // Aggregated Stats
  const totalPublished = events.filter((e) => e.status === 'PUBLISHED').length;
  const totalUpcoming = events.filter((e) => e.status === 'UPCOMING').length;
  const totalSold = events.reduce((sum, e) => sum + (e.soldTicketCount || e.soldCount || 0), 0);
  const totalFreeIssued = events.reduce((sum, e) => sum + (e.freePassesIssuedCount || 0), 0);

  return (
    <div className="space-y-6 text-left">
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F0F11] border border-white/10 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-text-secondary uppercase font-semibold font-mono">
            Published Live Events
          </span>
          <p className="text-2xl font-bold text-white font-display">{totalPublished}</p>
        </div>

        <div className="bg-[#0F0F11] border border-white/10 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-text-secondary uppercase font-semibold font-mono">
            Upcoming Events
          </span>
          <p className="text-2xl font-bold text-blue-400 font-display">{totalUpcoming}</p>
        </div>

        <div className="bg-[#0F0F11] border border-white/10 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-text-secondary uppercase font-semibold font-mono">
            Paid Tickets Sold
          </span>
          <p className="text-2xl font-bold text-gold font-display">{totalSold.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#0F0F11] border border-white/10 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-text-secondary uppercase font-semibold font-mono">
            Free Passes Issued
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-display">{totalFreeIssued.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gold" />
              Event Inventory & Lifecycle Controls
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Live events directly backed by MongoDB. Changes synchronize instantly across Website and Mobile App.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, category, city..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
              />
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={fetchAdminEvents}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh events list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeFilter === opt.id
                  ? 'bg-gold text-black font-bold shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* EVENTS TABLE */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="bg-white/5 text-white uppercase font-mono text-[9px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Event & Poster</th>
                <th className="px-3 py-3">Date & Venue</th>
                <th className="px-3 py-3">Type & Passes</th>
                <th className="px-3 py-3">Lifecycle & Gate</th>
                <th className="px-3 py-3 text-center">Capacity / Sold</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    {loading ? 'Loading events from database...' : 'No events match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const capacityTotal = evt.totalTicketCapacity || evt.totalCapacity || 1000;
                  const sold = evt.soldTicketCount || evt.soldCount || 0;
                  const freeIssued = evt.freePassesIssuedCount || 0;
                  const available = Math.max(0, capacityTotal - (sold + freeIssued));
                  const isActionLoading = statusActionLoading === evt.id;
                  const posterUrl = evt.posterUrl || evt.bannerUrl || 'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=200';

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Event & Poster */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={posterUrl}
                            alt={evt.title}
                            className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white block text-sm leading-tight hover:text-gold transition-colors">
                              {evt.title}
                            </span>
                            <span className="text-[10px] text-white/50 font-mono block">
                              {evt.category || 'Concerts'} • ID: {evt.id}
                            </span>
                            {evt.createdAt && (
                              <span className="text-[9px] text-white/30 font-mono block">
                                Created: {new Date(evt.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="px-3 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-white/90">
                            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span>{evt.date ? new Date(evt.date).toLocaleDateString('en-IN') : 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{evt.startTime || '18:00'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                            <MapPin className="w-3 h-3 text-white/40 shrink-0" />
                            <span className="truncate max-w-[140px]">{evt.venueName || 'Arena'}, {evt.city}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event Type & Pass Mode */}
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              evt.eventType === 'FREE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gold/20 text-gold border border-gold/30'
                            }`}
                          >
                            {evt.eventType === 'FREE' ? 'FREE EVENT' : 'PAID EVENT'}
                          </span>
                          <span className="block text-[10px] text-white/50 font-mono">
                            Passes: {evt.passMode || 'PAID'}
                          </span>
                        </div>
                      </td>

                      {/* Status & Booking Gate */}
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              evt.status === 'PUBLISHED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : evt.status === 'UPCOMING'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : evt.status === 'CANCELLED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {evt.status}
                          </span>
                          <span className="block text-[10px] text-white/50 font-mono">
                            Gate: {evt.bookingStatus}
                          </span>
                        </div>
                      </td>

                      {/* Capacity / Sold */}
                      <td className="px-3 py-3 text-center">
                        <div className="space-y-0.5">
                          <p className="font-mono text-white text-xs font-semibold">
                            {sold + freeIssued} / {capacityTotal}
                          </p>
                          <div className="w-20 bg-white/10 h-1 rounded-full mx-auto overflow-hidden">
                            <div
                              className="bg-gold h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.round(((sold + freeIssued) / (capacityTotal || 1)) * 100))}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            {available} avail
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View public page */}
                          <a
                            href={`/events/${evt.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="View public event"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Quick Change Status */}
                          <button
                            type="button"
                            onClick={() => openStatusModal(evt)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/70 hover:text-white transition-colors"
                            title="Change status & booking gate"
                          >
                            Status
                          </button>

                          {/* Publish / Unpublish */}
                          {evt.status === 'PUBLISHED' ? (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleUnpublish(evt)}
                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                              title="Unpublish event (save as draft)"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handlePublish(evt)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                              title="Publish event live"
                            >
                              Publish
                            </button>
                          )}

                          {/* Cancel */}
                          {evt.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleCancelEvent(evt)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-300 transition-colors"
                              title="Cancel event"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete (only if safe) */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleDelete(evt)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* QUICK STATUS & BOOKING MODAL */}
      {statusModalOpen && selectedEventForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-white/15 rounded-2xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <h4 className="text-base font-bold text-white">
              Update Status: {selectedEventForModal.title}
            </h4>
            <p className="text-xs text-white/50">
              Control public visibility and whether booking gates accept purchases.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Event Lifecycle Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="DRAFT">DRAFT (Hidden from Public)</option>
                  <option value="UPCOMING">UPCOMING (Visible in Upcoming Events)</option>
                  <option value="PUBLISHED">PUBLISHED (Fully Active & Visible)</option>
                  <option value="ONGOING">ONGOING (Live Today)</option>
                  <option value="COMPLETED">COMPLETED (Past Event)</option>
                  <option value="CANCELLED">CANCELLED (Not Bookable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Booking Gate Status</label>
                <select
                  value={newBookingStatus}
                  onChange={(e) => setNewBookingStatus(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="OPEN">OPEN (Accepting Passes & Bookings)</option>
                  <option value="NOT_OPEN">NOT OPEN (Not Yet Open)</option>
                  <option value="CLOSED">CLOSED (Temporarily Closed)</option>
                  <option value="SOLD_OUT">SOLD OUT</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-gold hover:bg-gold-light"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
