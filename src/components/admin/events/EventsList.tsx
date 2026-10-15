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
  LayoutDashboard,
  IndianRupee,
  Share2,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import {
  getEvents as getLocalEvents,
  getBookings,
  saveEvent,
  deleteEvent,
} from '../../../services/eventBookingService';
import EventShareModal from '../../events/EventShareModal';

interface AdminEventItem {
  id: string;
  _id?: string;
  title: string;
  description?: string;
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
  convenienceFeeEnabled?: boolean;
  convenienceFeeType?: 'FIXED' | 'PERCENTAGE';
  convenienceFeeAmount?: number;
  convenienceFeeApplication?: 'PER_TICKET' | 'PER_BOOKING';
  convenienceFeeStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  convenienceFeeApprovedBy?: string | null;
  convenienceFeeApprovedAt?: string | null;
}

export default function EventsList({
  onManageEvent,
  onEditEvent,
  onManagePasses,
  onManageFreePasses,
}: {
  onManageEvent?: (event: AdminEventItem) => void;
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
  const [shareModalEvent, setShareModalEvent] = useState<AdminEventItem | null>(null);

  // Convenience Fee Management Modal & State
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [selectedEventForFeeModal, setSelectedEventForFeeModal] = useState<AdminEventItem | null>(null);
  const [feeModalEnabled, setFeeModalEnabled] = useState(false);
  const [feeModalType, setFeeModalType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [feeModalAmount, setFeeModalAmount] = useState<number>(30);
  const [feeModalApplication, setFeeModalApplication] = useState<'PER_TICKET' | 'PER_BOOKING'>('PER_TICKET');
  const [feeModalStatus, setFeeModalStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [feeAuditLogs, setFeeAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  const fetchAdminEvents = async () => {
    setLoading(true);
    try {
      const local = getLocalEvents();
      const res = await apiClient.get('/admin/events');
      const apiEvents = res.data?.events || res.data?.data?.events;
      if (Array.isArray(apiEvents) && apiEvents.length > 0) {
        const apiIds = new Set(apiEvents.map((e: any) => e.id || e._id));
        const merged = [...apiEvents];
        for (const loc of local) {
          if (!apiIds.has(loc.id) && !apiIds.has((loc as any)._id)) {
            merged.push(loc as any);
          }
        }
        setEvents(merged);
      } else {
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
    { id: 'ALL', label: 'All Events' },
    { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { id: 'APPROVED_FEES', label: 'Approved' },
    { id: 'REJECTED_FEES', label: 'Rejected' },
    { id: 'FEE_ENABLED', label: 'Fee Enabled' },
    { id: 'FEE_DISABLED', label: 'Fee Disabled' },
    { id: 'PUBLISHED', label: 'Published' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'PAID', label: 'Paid Events' },
    { id: 'FREE', label: 'Free Events' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Fee status filters
      if (activeFilter === 'PENDING_APPROVAL') {
        return Boolean(e.convenienceFeeEnabled && e.convenienceFeeStatus === 'PENDING');
      }
      if (activeFilter === 'APPROVED_FEES') {
        return Boolean(e.convenienceFeeEnabled && e.convenienceFeeStatus === 'APPROVED');
      }
      if (activeFilter === 'REJECTED_FEES') {
        return Boolean(e.convenienceFeeEnabled && e.convenienceFeeStatus === 'REJECTED');
      }
      if (activeFilter === 'FEE_ENABLED') {
        return Boolean(e.convenienceFeeEnabled);
      }
      if (activeFilter === 'FEE_DISABLED') {
        return !e.convenienceFeeEnabled;
      }

      // 2. Tab filter
      if (activeFilter === 'PAID' && e.eventType !== 'PAID') return false;
      if (activeFilter === 'FREE' && e.eventType !== 'FREE') return false;
      if (['DRAFT', 'UPCOMING', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(activeFilter)) {
        if (e.status !== activeFilter) return false;
      }

      // 3. Search query
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

  const allBookings = useMemo(() => getBookings(), [events]);

  // Actions
  const handlePublish = async (event: AdminEventItem) => {
    try {
      setStatusActionLoading(event.id);
      // Immediately update local component state
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: 'PUBLISHED', bookingStatus: 'OPEN' } : e))
      );

      // Immediately update local canonical store
      saveEvent({
        ...event,
        status: 'PUBLISHED',
        bookingStatus: 'OPEN',
      } as any);

      try {
        await apiClient.post(`/admin/events/${event.id}/publish`);
      } catch (apiErr) {
        console.warn('Backend sync notice (published in local store):', apiErr);
      }
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
      // Immediately update local component state
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: 'DRAFT', bookingStatus: 'CLOSED' } : e))
      );

      // Immediately update local canonical store
      saveEvent({
        ...event,
        status: 'DRAFT',
        bookingStatus: 'CLOSED',
      } as any);

      try {
        await apiClient.post(`/admin/events/${event.id}/unpublish`);
      } catch (apiErr) {
        console.warn('Backend sync notice (unpublished in local store):', apiErr);
      }
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

      // Immediately update local component state
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: 'CANCELLED', bookingStatus: 'CLOSED' } : e))
      );

      // 1. Immediately update local canonical store
      const updatedEvent = {
        ...event,
        status: 'CANCELLED' as const,
        bookingStatus: 'CLOSED' as const,
      };
      saveEvent(updatedEvent as any);

      // 2. Authoritative sync to backend admin API
      try {
        await apiClient.post(`/admin/events/${event.id}/cancel`);
      } catch (apiErr) {
        try {
          await apiClient.patch(`/admin/events/${event.id}/status`, {
            status: 'CANCELLED',
            bookingStatus: 'CLOSED',
          });
        } catch (patchErr) {
          console.warn('Backend sync notice (event cancelled in local store):', patchErr);
        }
      }

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

      // 1. Delete from local canonical store
      deleteEvent(event.id);

      // 2. Sync to backend admin API
      try {
        await apiClient.delete(`/admin/events/${event.id}`);
      } catch (apiErr) {
        console.warn('Backend sync notice (event removed from local store):', apiErr);
      }

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

      // 1. Update local canonical store
      saveEvent({
        ...selectedEventForModal,
        status: newStatus as any,
        bookingStatus: newBookingStatus as any,
      } as any);

      // 2. Sync to backend
      try {
        await apiClient.patch(`/admin/events/${selectedEventForModal.id}/status`, {
          status: newStatus,
          bookingStatus: newBookingStatus,
        });
      } catch (apiErr) {
        console.warn('Backend sync notice (status updated in local store):', apiErr);
      }

      setStatusModalOpen(false);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  // ─── Convenience Fee Admin Approval Workflow ────────────────
  const handleApproveFee = async (event: AdminEventItem) => {
    try {
      setStatusActionLoading(event.id);
      const updated = {
        ...event,
        convenienceFeeStatus: 'APPROVED' as const,
        convenienceFeeApprovedBy: 'Admin',
        convenienceFeeApprovedAt: new Date().toISOString(),
      };
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      saveEvent(updated as any);

      try {
        await apiClient.post(`/admin/events/${event.id}/approve-fee`, {
          adminName: 'Admin',
          notes: 'Fee approved via Admin Events Table',
        });
      } catch (apiErr) {
        try {
          await apiClient.post(`/events/${event.id}/approve-fee`, {
            adminName: 'Admin',
            notes: 'Fee approved via Admin Events Table',
          });
        } catch (err2) {
          console.warn('Backend sync note:', err2);
        }
      }
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to approve fee: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleRejectFee = async (event: AdminEventItem) => {
    try {
      setStatusActionLoading(event.id);
      const updated = {
        ...event,
        convenienceFeeStatus: 'REJECTED' as const,
      };
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      saveEvent(updated as any);

      try {
        await apiClient.post(`/admin/events/${event.id}/reject-fee`, {
          adminName: 'Admin',
          notes: 'Fee rejected via Admin Events Table',
        });
      } catch (apiErr) {
        try {
          await apiClient.post(`/events/${event.id}/reject-fee`, {
            adminName: 'Admin',
            notes: 'Fee rejected via Admin Events Table',
          });
        } catch (err2) {
          console.warn('Backend sync note:', err2);
        }
      }
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to reject fee: ${err.message}`);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const openFeeModal = async (event: AdminEventItem) => {
    setSelectedEventForFeeModal(event);
    setFeeModalEnabled(event.convenienceFeeEnabled ?? false);
    setFeeModalType(event.convenienceFeeType || 'FIXED');
    setFeeModalAmount(event.convenienceFeeAmount ?? 30);
    setFeeModalApplication(event.convenienceFeeApplication || 'PER_TICKET');
    setFeeModalStatus(event.convenienceFeeStatus || 'PENDING');
    setFeeModalOpen(true);
    setFeeAuditLogs([]);

    // Fetch audit logs
    try {
      setLoadingAuditLogs(true);
      const res = await apiClient.get(`/events/${event.id}/fee-audit-logs`);
      const logs = res.data?.auditLogs || res.data?.data?.auditLogs;
      if (Array.isArray(logs)) {
        setFeeAuditLogs(logs);
      }
    } catch (e) {
      try {
        const res2 = await apiClient.get(`/admin/events/${event.id}/fee-audit-logs`);
        const logs2 = res2.data?.auditLogs || res2.data?.data?.auditLogs;
        if (Array.isArray(logs2)) {
          setFeeAuditLogs(logs2);
        }
      } catch (e2) {
        // Fallback or empty audit log
      }
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  const handleSaveFeeModal = async () => {
    if (!selectedEventForFeeModal) return;
    try {
      setStatusActionLoading(selectedEventForFeeModal.id);
      const updated: AdminEventItem = {
        ...selectedEventForFeeModal,
        convenienceFeeEnabled: feeModalEnabled,
        convenienceFeeType: feeModalType,
        convenienceFeeAmount: Number(feeModalAmount) || 0,
        convenienceFeeApplication: feeModalApplication,
        convenienceFeeStatus: feeModalStatus,
        convenienceFeeApprovedBy: feeModalStatus === 'APPROVED' ? (selectedEventForFeeModal.convenienceFeeApprovedBy || 'Admin') : null,
        convenienceFeeApprovedAt: feeModalStatus === 'APPROVED' ? (selectedEventForFeeModal.convenienceFeeApprovedAt || new Date().toISOString()) : null,
      };

      setEvents((prev) => prev.map((e) => (e.id === selectedEventForFeeModal.id ? updated : e)));
      saveEvent(updated as any);

      try {
        await apiClient.patch(`/admin/events/${selectedEventForFeeModal.id}/fee-settings`, {
          convenienceFeeEnabled: feeModalEnabled,
          convenienceFeeType: feeModalType,
          convenienceFeeAmount: Number(feeModalAmount) || 0,
          convenienceFeeApplication: feeModalApplication,
          convenienceFeeStatus: feeModalStatus,
          adminName: 'Admin',
          notes: 'Updated via Admin Fee Modal',
        });
      } catch (apiErr) {
        try {
          await apiClient.patch(`/events/${selectedEventForFeeModal.id}/fee-settings`, {
            convenienceFeeEnabled: feeModalEnabled,
            convenienceFeeType: feeModalType,
            convenienceFeeAmount: Number(feeModalAmount) || 0,
            convenienceFeeApplication: feeModalApplication,
            convenienceFeeStatus: feeModalStatus,
            adminName: 'Admin',
            notes: 'Updated via Admin Fee Modal',
          });
        } catch (err2) {
          console.warn('Backend sync note:', err2);
        }
      }

      setFeeModalOpen(false);
      await fetchAdminEvents();
    } catch (err: any) {
      alert(`Failed to save fee settings: ${err.message}`);
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
                <th className="px-4 py-3">Event & Category</th>
                <th className="px-3 py-3">Date & Venue</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center">Capacity / Registrations</th>
                <th className="px-3 py-3 text-center">Passes Issued</th>
                <th className="px-3 py-3 text-right">Revenue</th>
                <th className="px-3 py-3">Convenience Fee</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                    {loading ? 'Loading events from database...' : 'No events match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const capacityTotal = evt.totalTicketCapacity || evt.totalCapacity || 1000;
                  
                  // Compute dynamic per-event booking stats
                  const eventBookings = allBookings.filter(
                    (b) => b.eventId === evt.id || (evt._id && b.eventId === evt._id)
                  );
                  const totalRegistrations =
                    eventBookings.length > 0
                      ? eventBookings.reduce((sum, b) => sum + (b.ticketCount || 1), 0)
                      : (evt.soldTicketCount || evt.soldCount || 0) + (evt.freePassesIssuedCount || 0);

                  const passesIssued =
                    eventBookings.length > 0
                      ? eventBookings
                          .filter((b) => b.bookingStatus === 'Confirmed' || !b.bookingStatus)
                          .reduce((sum, b) => sum + (b.ticketCount || 1), 0)
                      : (evt.soldTicketCount || evt.soldCount || 0) + (evt.freePassesIssuedCount || 0);

                  const isFree = evt.eventType === 'FREE';
                  const revenue = isFree
                    ? 0
                    : eventBookings
                        .filter((b) => b.paymentStatus === 'PAID' || b.paymentStatus === 'COMPLETED' || b.bookingStatus === 'Confirmed')
                        .reduce((sum, b) => sum + (b.pricing?.finalAmount || 0), 0);

                  const available = Math.max(0, capacityTotal - totalRegistrations);
                  const isActionLoading = statusActionLoading === evt.id;
                  const posterUrl = evt.posterUrl || evt.bannerUrl || 'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=200';

                  const handleSelectEvent = () => {
                    if (onManageEvent) {
                      onManageEvent(evt);
                    } else if (onManagePasses) {
                      onManagePasses(evt);
                    }
                  };

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Event Poster, Name, Category & ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSelectEvent}
                            className="cursor-pointer shrink-0 transition-transform group-hover:scale-105"
                            title="Manage this event"
                          >
                            <img
                              src={posterUrl}
                              alt={evt.title}
                              className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                          </button>
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={handleSelectEvent}
                              className="font-semibold text-white block text-sm leading-tight text-left hover:text-gold transition-colors cursor-pointer"
                              title="Click to open Event Management Dashboard"
                            >
                              {evt.title}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gold font-mono font-medium">
                                {evt.category || 'Concerts'}
                              </span>
                              <span className="text-[9px] text-white/40 font-mono">
                                • ID: {evt.id}
                              </span>
                            </div>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                isFree
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-gold/15 text-gold border border-gold/25'
                              }`}
                            >
                              {isFree ? 'FREE EVENT' : 'PAID EVENT'}
                            </span>
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

                      {/* Total Capacity & Total Registrations */}
                      <td className="px-3 py-3 text-center">
                        <div className="space-y-1 max-w-[130px] mx-auto">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-white font-semibold">{totalRegistrations}</span>
                            <span className="text-white/40">/ {capacityTotal}</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gold h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.round((totalRegistrations / (capacityTotal || 1)) * 100))}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            {available} available
                          </p>
                        </div>
                      </td>

                      {/* Passes Issued */}
                      <td className="px-3 py-3 text-center">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30 font-mono font-bold text-xs">
                            <Ticket className="w-3 h-3" />
                            {passesIssued}
                          </span>
                          <span className="block text-[9px] text-white/40 font-mono">
                            confirmed passes
                          </span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-3 py-3 text-right">
                        {isFree ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              ₹0
                            </span>
                            <span className="block text-[9px] text-white/40 uppercase font-mono">
                              Free Event
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-gold">
                              ₹{revenue.toLocaleString('en-IN')}
                            </span>
                            <span className="block text-[9px] text-white/40 uppercase font-mono">
                              Gross Revenue
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Convenience Fee Column */}
                      <td className="px-3 py-3">
                        {evt.convenienceFeeEnabled ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                  evt.convenienceFeeStatus === 'APPROVED'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : evt.convenienceFeeStatus === 'PENDING'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {evt.convenienceFeeStatus || 'PENDING'}
                              </span>
                              <span className="text-[11px] text-white font-mono font-bold">
                                {evt.convenienceFeeType === 'PERCENTAGE'
                                  ? `${evt.convenienceFeeAmount || 0}%`
                                  : `₹${evt.convenienceFeeAmount || 0}`}
                              </span>
                            </div>
                            <div className="text-[9px] text-white/40 font-mono">
                              {evt.convenienceFeeApplication === 'PER_BOOKING' ? 'Per Booking' : 'Per Ticket'}
                              {evt.convenienceFeeApprovedBy && ` • ${evt.convenienceFeeApprovedBy}`}
                            </div>
                            {/* Quick Approve/Reject actions for PENDING */}
                            {evt.convenienceFeeStatus === 'PENDING' && (
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveFee(evt)}
                                  disabled={statusActionLoading === evt.id}
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-500/40 cursor-pointer transition-colors"
                                  title="Approve fee for live customer checkout"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectFee(evt)}
                                  disabled={statusActionLoading === evt.id}
                                  className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9px] font-bold border border-rose-500/40 cursor-pointer transition-colors"
                                  title="Reject fee"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-white/40 bg-white/5 border border-white/10 uppercase">
                              Disabled
                            </span>
                            <p className="text-[9px] text-white/30 font-mono">₹0 Fee</p>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY ACTION: Manage Event */}
                          <button
                            type="button"
                            onClick={handleSelectEvent}
                            className="px-3 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-gold/20"
                            title="Open dedicated Event Management Dashboard"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Manage Event</span>
                          </button>

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

                          {/* Share Public Link */}
                          <button
                            type="button"
                            onClick={() => setShareModalEvent(evt)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/70 hover:text-gold transition-colors cursor-pointer"
                            title="Share event via link & social media"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Manage Fee Modal Action */}
                          <button
                            type="button"
                            onClick={() => openFeeModal(evt)}
                            className="px-2 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                            title="Configure Convenience Fee & View Audit Log"
                          >
                            <IndianRupee className="w-3 h-3" /> Fee
                          </button>

                          {/* Edit Event */}
                          <button
                            type="button"
                            onClick={() => onEditEvent && onEditEvent(evt)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/70 hover:text-gold transition-colors"
                            title="Edit Event Configuration"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

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

                          {/* Delete */}
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

      {/* Convenience Fee Settings & Audit Log Modal */}
      {feeModalOpen && selectedEventForFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121217] border border-gold/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 text-left shadow-2xl my-8">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-gold" />
                  Convenience Fee Configuration: {selectedEventForFeeModal.title}
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  ID: {selectedEventForFeeModal.id} • Configure convenience fee and review approval audit history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeeModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Enable Fee Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/10 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-white uppercase font-mono">1. Enable Convenience Fee</p>
                  <p className="text-[11px] text-white/50">Fee is only collected from customers if Enabled and Approved.</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFeeModalEnabled(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      feeModalEnabled ? 'bg-emerald-500 text-black shadow' : 'bg-white/5 text-white/60'
                    }`}
                  >
                    Yes (Enabled)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeModalEnabled(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      !feeModalEnabled ? 'bg-rose-500/80 text-white shadow' : 'bg-white/5 text-white/60'
                    }`}
                  >
                    No (Disabled)
                  </button>
                </div>
              </div>

              {feeModalEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 2. Fee Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white/70">2. Fee Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeModalType('FIXED')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          feeModalType === 'FIXED'
                            ? 'bg-gold/20 border-gold text-gold shadow'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        Fixed Fee (₹)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeModalType('PERCENTAGE')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          feeModalType === 'PERCENTAGE'
                            ? 'bg-gold/20 border-gold text-gold shadow'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                  </div>

                  {/* 3. Fee Amount */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white/70">
                      3. Fee Amount {feeModalType === 'FIXED' ? '(₹)' : '(%)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={feeModalType === 'PERCENTAGE' ? '0.1' : '1'}
                      value={feeModalAmount}
                      onChange={(e) => setFeeModalAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-gold"
                      placeholder={feeModalType === 'FIXED' ? '30' : '5'}
                    />
                  </div>

                  {/* 4. Fee Application */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white/70">4. Fee Application</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeModalApplication('PER_TICKET')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          feeModalApplication === 'PER_TICKET'
                            ? 'bg-gold/20 border-gold text-gold shadow'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        Per Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeModalApplication('PER_BOOKING')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          feeModalApplication === 'PER_BOOKING'
                            ? 'bg-gold/20 border-gold text-gold shadow'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        Per Booking
                      </button>
                    </div>
                  </div>

                  {/* 5. Fee Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white/70">5. Approval Status</label>
                    <select
                      value={feeModalStatus}
                      onChange={(e) => setFeeModalStatus(e.target.value as any)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-gold"
                    >
                      <option value="PENDING">Pending Approval</option>
                      <option value="APPROVED">Approved (Active for Bookings)</option>
                      <option value="REJECTED">Rejected (Customer pays ₹0 fee)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Simulation Banner */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs space-y-1 text-white/70">
                <p>
                  <strong>Current Rule:</strong>{' '}
                  {feeModalEnabled
                    ? feeModalType === 'FIXED'
                      ? `₹${feeModalAmount} ${feeModalApplication === 'PER_TICKET' ? 'per ticket' : 'per booking'}`
                      : `${feeModalAmount}% of ticket subtotal ${feeModalApplication === 'PER_TICKET' ? 'per ticket' : 'per booking'}`
                    : 'Disabled (₹0)'}
                  {' • '}
                  Status:{' '}
                  <span
                    className={`font-bold ${
                      feeModalStatus === 'APPROVED' && feeModalEnabled
                        ? 'text-emerald-400'
                        : feeModalStatus === 'PENDING'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {feeModalEnabled
                      ? feeModalStatus === 'APPROVED'
                        ? 'Approved (Charged to customer on checkout)'
                        : feeModalStatus === 'PENDING'
                        ? 'Pending Approval (Customers will NOT be charged)'
                        : 'Rejected (Customers will NOT be charged)'
                      : 'Fee Disabled'}
                  </span>
                </p>
                <p className="text-[11px] text-gold font-mono">
                  Example calculation for 2 tickets @ ₹500 each: Subtotal ₹1,000 + Convenience Fee ₹
                  {feeModalEnabled && feeModalStatus === 'APPROVED'
                    ? (feeModalType === 'FIXED'
                        ? (feeModalApplication === 'PER_TICKET' ? feeModalAmount * 2 : feeModalAmount)
                        : Math.round((1000 * feeModalAmount) / 100))
                    : 0}{' '}
                  = Total Payable ₹
                  {feeModalEnabled && feeModalStatus === 'APPROVED'
                    ? (1000 + (feeModalType === 'FIXED'
                        ? (feeModalApplication === 'PER_TICKET' ? feeModalAmount * 2 : feeModalAmount)
                        : Math.round((1000 * feeModalAmount) / 100))
                      ).toLocaleString('en-IN')
                    : '1,000'}
                </p>
              </div>

              {/* Fee Approval & Change Audit Log Section */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    Fee Change & Approval Audit Log
                  </h4>
                  <span className="text-[10px] text-white/40 font-mono">
                    {loadingAuditLogs ? 'Loading...' : `${feeAuditLogs.length} audit records`}
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl bg-black/40 border border-white/5 divide-y divide-white/5 text-[11px]">
                  {loadingAuditLogs ? (
                    <p className="p-3 text-center text-white/40">Loading audit history...</p>
                  ) : feeAuditLogs.length === 0 ? (
                    <p className="p-3 text-center text-white/40">No previous fee changes recorded for this event.</p>
                  ) : (
                    feeAuditLogs.map((log: any, idx: number) => (
                      <div key={idx} className="p-2.5 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-gold uppercase">{log.action || 'FEE_UPDATE'}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'Recently'}
                          </span>
                        </div>
                        <p className="text-white/70">
                          By <strong className="text-white">{log.changedBy || 'Admin'}</strong>
                          {log.notes && ` — ${log.notes}`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-white/10">
              <div className="flex gap-2">
                {feeModalStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFeeModalStatus('APPROVED');
                      setFeeModalEnabled(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 cursor-pointer"
                  >
                    Quick Approve
                  </button>
                )}
                {feeModalStatus !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => setFeeModalStatus('REJECTED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer"
                  >
                    Quick Reject
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFeeModal}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-gold hover:bg-gold-light shadow-md cursor-pointer"
                >
                  Save Fee Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Event Modal */}
      {shareModalEvent && (
        <EventShareModal
          isOpen={!!shareModalEvent}
          onClose={() => setShareModalEvent(null)}
          event={{
            id: shareModalEvent.id,
            title: shareModalEvent.title,
            city: shareModalEvent.city,
            venueName: shareModalEvent.venueName,
            date: shareModalEvent.date,
            description: shareModalEvent.description,
          }}
        />
      )}
    </div>
  );
}
