import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  BarChart3,
  QrCode,
  Settings,
  ArrowLeft,
  Search,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Save,
  Trash2,
  DollarSign,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  FileText,
  FileDown,
  Sparkles,
  Shield,
  Ban,
  Check,
  RefreshCw,
  X,
  AlertTriangle,
  Share2,
  ExternalLink,
} from 'lucide-react';
import {
  getBookings,
  getBookingPassId,
  getBookingOrderId,
  isFreeEventBooking,
  validatePass,
  validateAndCheckInTicket,
  reverseCheckInTicket,
  saveEvent,
} from '../../../services/eventBookingService';
import EventShareModal from '../../events/EventShareModal';
import {
  generateAndDownloadEventPassPdf,
  printEventPassPdf,
  sendEventPassToEmail,
  formatEventDateAndDay,
} from '../../../utils/eventPassPdf';
import type { EventBookingRecord, EventItem } from '../../../types/eventBooking';

interface EventManagementDashboardProps {
  event: any;
  onBack: () => void;
  onEventUpdated?: (updatedEvent: any) => void;
}

export default function EventManagementDashboard({
  event,
  onBack,
  onEventUpdated,
}: EventManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'details' | 'passes' | 'registrations' | 'analytics' | 'checkins' | 'settings'
  >('overview');

  const [currentEvent, setCurrentEvent] = useState<any>(event);
  const [bookings, setBookings] = useState<EventBookingRecord[]>(() => getBookings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Selected Pass for Modal
  const [selectedPass, setSelectedPass] = useState<EventBookingRecord | null>(null);

  // Filter & Search states
  const [passSearch, setPassSearch] = useState('');
  const [passTypeFilter, setPassTypeFilter] = useState('ALL');
  const [passFeeFilter, setPassFeeFilter] = useState('ALL');
  const [passStatusFilter, setPassStatusFilter] = useState('ALL');

  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');
  const [regSort, setRegSort] = useState<'newest' | 'oldest'>('newest');

  // Check-in Gate state
  const [checkInInput, setCheckInInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<any>(null);

  // Details Edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title || '');
  const [editCategory, setEditCategory] = useState(event.category || 'Concerts');
  const [editDescription, setEditDescription] = useState(event.description || '');
  const [editPoster, setEditPoster] = useState(event.posterUrl || event.bannerUrl || '');
  const [editVenue, setEditVenue] = useState(event.venueName || '');
  const [editAddress, setEditAddress] = useState(event.venueAddress || '');
  const [editCity, setEditCity] = useState(event.city || '');
  const [editState, setEditState] = useState(event.state || '');
  const [editDate, setEditDate] = useState(event.date || '');
  const [editStartTime, setEditStartTime] = useState(event.startTime || '18:00');
  const [editEndTime, setEditEndTime] = useState(event.endTime || '21:00');
  const [editCapacity, setEditCapacity] = useState(event.totalCapacity || event.totalTicketCapacity || 1000);
  const [editEventType, setEditEventType] = useState<'PAID' | 'FREE'>(event.eventType || 'PAID');
  const [editFee, setEditFee] = useState<number>(event.ticketTypes?.[0]?.price || 499);
  const [editTerms, setEditTerms] = useState<string>(
    Array.isArray(event.termsAndConditions) ? event.termsAndConditions.join('\n') : (event.termsAndConditions || '')
  );

  // Settings State
  const [settingsStatus, setSettingsStatus] = useState(event.status || 'PUBLISHED');
  const [settingsBookingStatus, setSettingsBookingStatus] = useState(event.bookingStatus || 'OPEN');
  const [settingsVisibility, setSettingsVisibility] = useState('PUBLIC');
  const [settingsPassEnabled, setSettingsPassEnabled] = useState(event.passSettings?.enabled !== false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setBookings(getBookings());
  };

  // Filter bookings strictly for THIS event
  const eventBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.eventId === currentEvent.id ||
        b.eventTitle?.toLowerCase() === currentEvent.title?.toLowerCase()
    );
  }, [bookings, currentEvent]);

  // Overall Event Metrics
  const metrics = useMemo(() => {
    const totalCapacity = currentEvent.totalCapacity || currentEvent.totalTicketCapacity || 1000;
    const totalRegistrations = eventBookings.length;
    let passesIssued = 0;
    let paidRegistrations = 0;
    let freeRegistrations = 0;
    let cancelledRegistrations = 0;
    let checkedInAttendees = 0;
    let grossRevenue = 0;

    eventBookings.forEach((b) => {
      const count = b.ticketCount || 1;
      const isFree = isFreeEventBooking(b) || currentEvent.eventType === 'FREE';

      if (b.bookingStatus === 'Cancelled' || b.paymentStatus === 'CANCELLED') {
        cancelledRegistrations++;
      } else {
        passesIssued += count;
        if (isFree) {
          freeRegistrations++;
        } else {
          paidRegistrations++;
          grossRevenue += (b.pricing?.finalAmount || b.pricing?.ticketSubtotal || 0);
        }
        if (b.checkedIn) {
          checkedInAttendees += count;
        }
      }
    });

    const availablePasses = Math.max(0, totalCapacity - passesIssued);
    const notCheckedIn = Math.max(0, passesIssued - checkedInAttendees);
    const checkInRate = passesIssued > 0 ? Math.round((checkedInAttendees / passesIssued) * 100) : 0;

    return {
      totalCapacity,
      totalRegistrations,
      passesIssued,
      availablePasses,
      paidRegistrations,
      freeRegistrations,
      cancelledRegistrations,
      checkedInAttendees,
      notCheckedIn,
      grossRevenue: currentEvent.eventType === 'FREE' ? 0 : grossRevenue,
      checkInRate,
    };
  }, [eventBookings, currentEvent]);

  // Filtered Passes
  const filteredPasses = useMemo(() => {
    return eventBookings.filter((pass) => {
      if (passSearch.trim()) {
        const q = passSearch.toLowerCase().trim();
        const name = pass.primaryAttendee?.name?.toLowerCase() || '';
        const email = pass.primaryAttendee?.email?.toLowerCase() || '';
        const phone = pass.primaryAttendee?.phone?.toLowerCase() || '';
        const passId = getBookingPassId(pass).toLowerCase();
        const orderId = getBookingOrderId(pass).toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !passId.includes(q) && !orderId.includes(q)) {
          return false;
        }
      }
      if (passTypeFilter !== 'ALL') {
        if ((pass.ticketTypeName || '').toUpperCase() !== passTypeFilter.toUpperCase()) return false;
      }
      if (passFeeFilter !== 'ALL') {
        const isFree = isFreeEventBooking(pass) || currentEvent.eventType === 'FREE';
        if (passFeeFilter === 'FREE' && !isFree) return false;
        if (passFeeFilter === 'PAID' && isFree) return false;
      }
      if (passStatusFilter === 'CHECKED_IN' && !pass.checkedIn) return false;
      if (passStatusFilter === 'NOT_CHECKED_IN' && pass.checkedIn) return false;
      if (passStatusFilter === 'CANCELLED' && pass.bookingStatus !== 'Cancelled') return false;
      return true;
    });
  }, [eventBookings, passSearch, passTypeFilter, passFeeFilter, passStatusFilter, currentEvent]);

  // Filtered Registrations
  const filteredRegistrations = useMemo(() => {
    let list = eventBookings.filter((b) => {
      if (regSearch.trim()) {
        const q = regSearch.toLowerCase().trim();
        const name = b.primaryAttendee?.name?.toLowerCase() || '';
        const email = b.primaryAttendee?.email?.toLowerCase() || '';
        const phone = b.primaryAttendee?.phone?.toLowerCase() || '';
        const id = b.id?.toLowerCase() || '';
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !id.includes(q)) {
          return false;
        }
      }
      if (regStatusFilter === 'CONFIRMED' && (b.bookingStatus === 'Cancelled' || b.paymentStatus === 'CANCELLED')) return false;
      if (regStatusFilter === 'CANCELLED' && b.bookingStatus !== 'Cancelled' && b.paymentStatus !== 'CANCELLED') return false;
      if (regStatusFilter === 'FREE' && (!isFreeEventBooking(b) && currentEvent.eventType !== 'FREE')) return false;
      if (regStatusFilter === 'PAID' && (isFreeEventBooking(b) || currentEvent.eventType === 'FREE')) return false;
      return true;
    });

    list.sort((a, b) => {
      const timeA = new Date(a.bookedAt || 0).getTime();
      const timeB = new Date(b.bookedAt || 0).getTime();
      return regSort === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [eventBookings, regSearch, regStatusFilter, regSort, currentEvent]);

  // Actions
  const handleCheckInToggle = (pass: EventBookingRecord) => {
    if (pass.checkedIn) {
      const res = reverseCheckInTicket(getBookingPassId(pass));
      if (res.success) {
        showToast(res.message);
        refreshData();
      }
    } else {
      const res = validateAndCheckInTicket(getBookingPassId(pass), 'Event Staff');
      if (res.success) {
        showToast(res.message);
        refreshData();
      } else {
        showToast(res.message);
      }
    }
  };

  const handleDownloadPass = (pass: EventBookingRecord) => {
    generateAndDownloadEventPassPdf(pass);
    showToast(`Downloading Vertical Event Pass PDF: ${getBookingPassId(pass)}`);
  };

  const handlePrintPass = (pass: EventBookingRecord) => {
    printEventPassPdf(pass);
  };

  const handleResendPass = async (pass: EventBookingRecord) => {
    const res = await sendEventPassToEmail(pass);
    showToast(res.message);
  };

  const handleCancelPass = (pass: EventBookingRecord) => {
    if (window.confirm(`Are you sure you want to cancel pass ${getBookingPassId(pass)}?`)) {
      pass.bookingStatus = 'Cancelled';
      pass.paymentStatus = 'CANCELLED';
      showToast(`Pass ${getBookingPassId(pass)} marked as Cancelled.`);
      refreshData();
    }
  };

  // Check-in Scanner input handler
  const handleCheckInScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInInput.trim()) return;

    const query = checkInInput.trim();
    // Validate pass
    const result = validatePass(query);

    if (result.booking) {
      // Ensure the pass belongs to THIS event
      if (
        result.booking.eventId !== currentEvent.id &&
        result.booking.eventTitle?.toLowerCase() !== currentEvent.title?.toLowerCase()
      ) {
        setCheckInResult({
          status: 'EVENT_MISMATCH',
          message: `This pass is registered for a different event: "${result.booking.eventTitle}". Access Denied.`,
          booking: result.booking,
        });
        return;
      }

      if (result.status === 'ALREADY_CHECKED_IN') {
        setCheckInResult({
          status: 'ALREADY_CHECKED_IN',
          message: `ALREADY CHECKED IN at ${result.checkedInAt || result.booking.checkedInAt || 'Earlier'} by ${result.booking.checkedInBy || 'Gate Staff'}. Duplicate entry prohibited!`,
          booking: result.booking,
        });
      } else if (result.status === 'CANCELLED') {
        setCheckInResult({
          status: 'CANCELLED',
          message: 'This pass has been cancelled or refunded. Entry Denied!',
          booking: result.booking,
        });
      } else {
        setCheckInResult({
          status: 'VALID',
          message: 'Pass Verified! Ready for attendee check-in.',
          booking: result.booking,
        });
      }
    } else {
      setCheckInResult({
        status: 'INVALID',
        message: 'No active pass found matching this Pass ID or QR code.',
      });
    }
  };

  const handleConfirmGateCheckIn = () => {
    if (!checkInResult?.booking) return;
    const passId = getBookingPassId(checkInResult.booking);
    const res = validateAndCheckInTicket(passId, 'Event Gate Admin');
    if (res.success && res.booking) {
      setCheckInResult({
        status: 'SUCCESS',
        message: `✅ Check-in Successful! Welcome ${res.booking.primaryAttendee?.name}.`,
        booking: res.booking,
      });
      showToast(`Checked in ${res.booking.primaryAttendee?.name}`);
      refreshData();
    } else {
      showToast(res.message);
    }
  };

  // Save Event Details
  const handleSaveDetails = () => {
    const updated = {
      ...currentEvent,
      title: editTitle,
      category: editCategory,
      description: editDescription,
      posterUrl: editPoster,
      bannerUrl: editPoster,
      venueName: editVenue,
      venueAddress: editAddress,
      city: editCity,
      state: editState,
      date: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      totalCapacity: Number(editCapacity),
      totalTicketCapacity: Number(editCapacity),
      eventType: editEventType,
      ticketTypes: [
        {
          id: currentEvent.ticketTypes?.[0]?.id || 'TIER-1',
          name: editEventType === 'FREE' ? 'Free General Admission' : 'Standard Entry',
          tier: 'General',
          price: editEventType === 'FREE' ? 0 : Number(editFee),
          availableQuantity: Number(editCapacity),
        },
      ],
      termsAndConditions: editTerms.split('\n').filter((t) => t.trim()),
      updatedAt: new Date().toISOString(),
    };

    saveEvent(updated);
    setCurrentEvent(updated);
    setIsEditingDetails(false);
    if (onEventUpdated) onEventUpdated(updated);
    showToast('Event details updated successfully.');
  };

  // Save Settings
  const handleSaveSettings = () => {
    const updated = {
      ...currentEvent,
      status: settingsStatus,
      bookingStatus: settingsBookingStatus,
      visibility: settingsVisibility,
      passSettings: {
        ...currentEvent.passSettings,
        enabled: settingsPassEnabled,
      },
      updatedAt: new Date().toISOString(),
    };

    saveEvent(updated);
    setCurrentEvent(updated);
    if (onEventUpdated) onEventUpdated(updated);
    showToast('Event settings saved successfully.');
  };

  // Export handlers
  const exportRegistrationsCSV = () => {
    const headers = ['Registration ID', 'Pass ID', 'Order ID', 'Attendee Name', 'Email', 'Phone', 'Pass Type', 'Fee', 'Payment Status', 'Registration Date', 'Checked In'];
    const rows = filteredRegistrations.map((b) => [
      b.id,
      getBookingPassId(b),
      getBookingOrderId(b),
      `"${(b.primaryAttendee?.name || '').replace(/"/g, '""')}"`,
      b.primaryAttendee?.email || '',
      b.primaryAttendee?.phone || '',
      b.ticketTypeName || 'General',
      isFreeEventBooking(b) ? 'FREE' : `₹${b.pricing?.finalAmount || 0}`,
      b.paymentStatus || 'CONFIRMED',
      b.bookedAt || '',
      b.checkedIn ? `YES (${b.checkedInAt || ''})` : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported registrations to CSV.');
  };

  const exportAnalyticsCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `Metric,Value`,
        `Event Title,"${currentEvent.title.replace(/"/g, '""')}"`,
        `Event ID,${currentEvent.id}`,
        `Date,${currentEvent.date}`,
        `Venue,"${currentEvent.venueName}, ${currentEvent.city}"`,
        `Total Capacity,${metrics.totalCapacity}`,
        `Total Registrations,${metrics.totalRegistrations}`,
        `Passes Issued,${metrics.passesIssued}`,
        `Available Passes,${metrics.availablePasses}`,
        `Paid Registrations,${metrics.paidRegistrations}`,
        `Free Registrations,${metrics.freeRegistrations}`,
        `Cancelled Registrations,${metrics.cancelledRegistrations}`,
        `Checked-in Attendees,${metrics.checkedInAttendees}`,
        `Not Checked-in,${metrics.notCheckedIn}`,
        `Check-in Percentage,${metrics.checkInRate}%`,
        `Total Revenue,${currentEvent.eventType === 'FREE' ? 'FREE (₹0)' : `₹${metrics.grossRevenue}`}`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported analytics to CSV.');
  };

  const dayInfo = formatEventDateAndDay(currentEvent.date || '');
  const posterUrl =
    currentEvent.posterUrl ||
    currentEvent.bannerUrl ||
    'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16161E] border border-gold text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-gold shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 4. EVENT DASHBOARD HEADER */}
      <div className="bg-gradient-to-r from-black/90 via-gold/10 to-black/90 border border-gold/40 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Return to Events List"
            >
              <ArrowLeft className="w-5 h-5 text-gold" />
            </button>
            <img
              src={posterUrl}
              alt={currentEvent.title}
              className="w-16 h-22 object-cover rounded-xl border border-white/20 shadow-md shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/30 uppercase">
                  Event ID: {currentEvent.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    currentEvent.status === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {currentEvent.status || 'PUBLISHED'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white/80">
                  {currentEvent.eventType === 'FREE' ? 'FREE EVENT' : 'PAID EVENT'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                {currentEvent.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  {dayInfo.formattedDate} ({dayInfo.day})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  {currentEvent.startTime || '18:00'} - {currentEvent.endTime || '21:00'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  {currentEvent.venueName || 'Venue'}, {currentEvent.city || ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <a
              href={`/events/${currentEvent.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open public event webpage"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public Page
            </a>
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-gold hover:text-black text-white border border-white/15 hover:border-gold rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Share event link, social media, and QR code"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Event
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> QR Gate Check-in
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className="px-3.5 py-2 bg-gold hover:bg-gold-light text-black rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <Ticket className="w-4 h-4" /> Passes ({metrics.passesIssued})
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex space-x-1 border-t border-white/10 mt-5 pt-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'details', label: 'Event Details', icon: Edit },
            { id: 'passes', label: 'Passes', icon: Ticket, badge: metrics.passesIssued },
            { id: 'registrations', label: 'Registrations', icon: Users, badge: metrics.totalRegistrations },
            { id: 'analytics', label: 'Data Analysis', icon: BarChart3 },
            { id: 'checkins', label: 'Check-ins', icon: QrCode, badge: `${metrics.checkedInAttendees}/${metrics.passesIssued}` },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gold/15 text-gold border-b-2 border-gold font-black'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-gold text-black font-extrabold' : 'bg-white/10 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Total Capacity</p>
              <p className="text-xl font-black text-white mt-1">{metrics.totalCapacity.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Total Registrations</p>
              <p className="text-xl font-black text-blue-400 mt-1">{metrics.totalRegistrations.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-gold tracking-wider">Passes Issued</p>
              <p className="text-xl font-black text-gold mt-1">{metrics.passesIssued.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Available Passes</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{metrics.availablePasses.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Paid Passes</p>
              <p className="text-xl font-black text-amber-300 mt-1">{metrics.paidRegistrations.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Free Passes</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{metrics.freeRegistrations.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Checked In</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{metrics.checkedInAttendees.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-gold/30 bg-gold/5 rounded-xl p-3.5 text-center">
              <p className="text-[10px] uppercase font-bold text-gold tracking-wider">Total Revenue</p>
              <p className="text-xl font-black text-gold mt-1">
                {currentEvent.eventType === 'FREE' ? 'FREE' : `₹${metrics.grossRevenue.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" /> Event Status & Details
                </h3>
                <button
                  onClick={() => setActiveTab('details')}
                  className="text-xs text-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block">Event Status</span>
                  <span className="font-bold text-white">{currentEvent.status || 'PUBLISHED'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Registration Gate</span>
                  <span className="font-bold text-emerald-400">{currentEvent.bookingStatus || 'OPEN'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Event Date & Time</span>
                  <span className="font-bold text-white">
                    {dayInfo.formattedDate} ({dayInfo.day}), {currentEvent.startTime} - {currentEvent.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Venue & Full Address</span>
                  <span className="font-bold text-white">
                    {currentEvent.venueName}, {currentEvent.venueAddress}, {currentEvent.city}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Pricing Model</span>
                  <span className="font-bold text-gold">
                    {currentEvent.eventType === 'FREE' ? 'FREE EVENT (Zero fee)' : `PAID EVENT (₹${currentEvent.ticketTypes?.[0]?.price || 499})`}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Check-in Completion</span>
                  <span className="font-bold text-emerald-400">
                    {metrics.checkInRate}% ({metrics.checkedInAttendees} / {metrics.passesIssued} Checked In)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-text-muted text-xs block mb-1">Description</span>
                <p className="text-xs text-text-secondary leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  {currentEvent.description || 'No description provided for this event.'}
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Gate & Pass Shortcuts</h3>
                <p className="text-xs text-text-secondary mb-4">
                  Direct operations for this specific event instance.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('passes')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-gold" /> Manage All Passes
                    </span>
                    <span className="text-gold font-mono">{metrics.passesIssued}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('checkins')}
                    className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" /> Scan QR at Gate
                    </span>
                    <span className="font-mono">{metrics.checkedInAttendees} In</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" /> View Analytics
                    </span>
                    <span className="text-xs text-text-muted">Breakdown</span>
                  </button>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[11px] text-text-muted">
                <span className="text-gold font-bold block mb-0.5">Authoritative Isolation:</span>
                All metrics, passes, and check-ins belong strictly to Event ID <strong className="text-white">{currentEvent.id}</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVENT DETAILS */}
      {activeTab === 'details' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">Event Details & Configuration</h3>
              <p className="text-xs text-text-secondary">
                View and edit event parameters. Updates modify the existing event safely without duplication.
              </p>
            </div>
            {!isEditingDetails ? (
              <button
                onClick={() => setIsEditingDetails(true)}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Event
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingDetails(false)}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetails}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-text-muted block mb-1 font-semibold">Event Name</label>
                {isEditingDetails ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                  />
                ) : (
                  <p className="font-bold text-white text-sm">{currentEvent.title}</p>
                )}
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-semibold">Category</label>
                {isEditingDetails ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                  >
                    <option value="Concerts">Concerts</option>
                    <option value="Film Events">Film Events</option>
                    <option value="College Events">College Events</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Stand-up Comedy">Stand-up Comedy</option>
                    <option value="Cultural Events">Cultural Events</option>
                    <option value="Sports Events">Sports Events</option>
                  </select>
                ) : (
                  <p className="font-bold text-white">{currentEvent.category || 'Concerts'}</p>
                )}
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-semibold">Event Poster URL</label>
                {isEditingDetails ? (
                  <input
                    type="text"
                    value={editPoster}
                    onChange={(e) => setEditPoster(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                  />
                ) : (
                  <p className="text-white/70 truncate">{posterUrl}</p>
                )}
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-semibold">Description</label>
                {isEditingDetails ? (
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white outline-none focus:border-gold"
                  />
                ) : (
                  <p className="text-text-secondary leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    {currentEvent.description}
                  </p>
                )}
              </div>
            </div>

            {/* Venue & Time */}
            <div className="space-y-4">
              <div>
                <label className="text-text-muted block mb-1 font-semibold">Venue Name</label>
                {isEditingDetails ? (
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                  />
                ) : (
                  <p className="font-bold text-white">{currentEvent.venueName}</p>
                )}
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-semibold">Full Address</label>
                {isEditingDetails ? (
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                  />
                ) : (
                  <p className="text-white">{currentEvent.venueAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">City</label>
                  {isEditingDetails ? (
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.city}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">State</label>
                  {isEditingDetails ? (
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.state || 'Telangana'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">Event Date</label>
                  {isEditingDetails ? (
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.date}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">Start Time</label>
                  {isEditingDetails ? (
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.startTime}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">End Time</label>
                  {isEditingDetails ? (
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.endTime || '21:00'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">Pricing Model</label>
                  {isEditingDetails ? (
                    <select
                      value={editEventType}
                      onChange={(e) => setEditEventType(e.target.value as any)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    >
                      <option value="PAID">PAID</option>
                      <option value="FREE">FREE</option>
                    </select>
                  ) : (
                    <span className="font-bold text-gold">{currentEvent.eventType}</span>
                  )}
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">Ticket Fee (₹)</label>
                  {isEditingDetails ? (
                    <input
                      type="number"
                      disabled={editEventType === 'FREE'}
                      value={editEventType === 'FREE' ? 0 : editFee}
                      onChange={(e) => setEditFee(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold disabled:opacity-50"
                    />
                  ) : (
                    <p className="text-white">
                      {currentEvent.eventType === 'FREE' ? 'FREE (₹0)' : `₹${currentEvent.ticketTypes?.[0]?.price || 499}`}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-semibold">Capacity</label>
                  {isEditingDetails ? (
                    <input
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-white">{currentEvent.totalCapacity || 1000}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSES (Pass Information) */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          {/* Pass Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-text-muted uppercase font-bold">Total Capacity</span>
              <p className="text-lg font-black text-white mt-0.5">{metrics.totalCapacity}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-gold uppercase font-bold">Passes Issued</span>
              <p className="text-lg font-black text-gold mt-0.5">{metrics.passesIssued}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Passes Available</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{metrics.availablePasses}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Checked In</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{metrics.checkedInAttendees}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-rose-400 uppercase font-bold">Cancelled Passes</span>
              <p className="text-lg font-black text-rose-400 mt-0.5">{metrics.cancelledRegistrations}</p>
            </div>
          </div>

          {/* Pass Table & Filters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Issued Passes Roster</h3>
                <p className="text-xs text-text-secondary">Official vertical CineVenue passes belonging to this event.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passSearch}
                    onChange={(e) => setPassSearch(e.target.value)}
                    placeholder="Search attendee, pass ID..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
                  />
                </div>

                <select
                  value={passFeeFilter}
                  onChange={(e) => setPassFeeFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="ALL">All Fees</option>
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>

                <select
                  value={passStatusFilter}
                  onChange={(e) => setPassStatusFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="NOT_CHECKED_IN">Not Checked In</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Passes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="bg-white/5 text-white uppercase font-mono text-[9px] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Pass ID & Order</th>
                    <th className="px-4 py-3">Attendee Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-3 py-3">Pass Type</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Check-in</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredPasses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/30">
                        No passes match the filters for this event.
                      </td>
                    </tr>
                  ) : (
                    filteredPasses.map((pass) => {
                      const passId = getBookingPassId(pass);
                      const isFree = isFreeEventBooking(pass) || currentEvent.eventType === 'FREE';
                      return (
                        <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-bold text-gold block">{passId}</span>
                            <span className="text-[10px] text-white/40 block">{getBookingOrderId(pass)}</span>
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <span className="font-bold text-white block">{pass.primaryAttendee?.name}</span>
                            <span className="text-[10px] text-white/40">{pass.bookedAt?.slice(0, 10)}</span>
                          </td>
                          <td className="px-4 py-3 text-[11px]">
                            <span className="block text-white/80">{pass.primaryAttendee?.phone}</span>
                            <span className="block text-white/40">{pass.primaryAttendee?.email}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                              {pass.ticketTypeName || 'General'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {isFree ? (
                              <span className="text-emerald-400 font-bold">FREE</span>
                            ) : (
                              <span className="text-white font-bold">₹{pass.pricing?.finalAmount || pass.pricing?.ticketSubtotal || 0}</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                pass.paymentStatus === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : pass.paymentStatus === 'CANCELLED'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {pass.paymentStatus || 'CONFIRMED'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {pass.checkedIn ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                CHECKED IN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 text-white/50 border border-white/10">
                                NOT IN
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedPass(pass)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                                title="View Pass Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadPass(pass)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/70 hover:text-gold"
                                title="Download Vertical PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePrintPass(pass)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                                title="Print Pass"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendPass(pass)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                                title="Resend Pass Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCheckInToggle(pass)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                  pass.checkedIn
                                    ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                                    : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                }`}
                                title={pass.checkedIn ? 'Reverse Check-In' : 'Mark Check-In'}
                              >
                                {pass.checkedIn ? 'Reset' : 'Check In'}
                              </button>
                              {pass.bookingStatus !== 'Cancelled' && (
                                <button
                                  onClick={() => handleCancelPass(pass)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400"
                                  title="Cancel Pass"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        </div>
      )}

      {/* TAB 4: REGISTRATIONS */}
      {activeTab === 'registrations' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Event Registrations</h3>
              <p className="text-xs text-text-secondary">
                Confirmed booking records and attendee reservations for this event.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  placeholder="Search registration..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FREE">Free</option>
                <option value="PAID">Paid</option>
              </select>

              <button
                onClick={exportRegistrationsCSV}
                className="px-3.5 py-1.5 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-white/5 text-white uppercase font-mono text-[9px] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Registration ID</th>
                  <th className="px-4 py-3">Attendee</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-3 py-3">Pass Type</th>
                  <th className="px-3 py-3">Reg. Date</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Pass ID</th>
                  <th className="px-3 py-3">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-white/30">
                      No registrations found for this event.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{reg.id}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="font-bold text-white block">{reg.primaryAttendee?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        <span className="block text-white/80">{reg.primaryAttendee?.phone}</span>
                        <span className="block text-white/40">{reg.primaryAttendee?.email}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                          {reg.ticketTypeName || 'General'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/60">
                        {reg.bookedAt ? new Date(reg.bookedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            reg.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : reg.paymentStatus === 'CANCELLED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {reg.paymentStatus || 'CONFIRMED'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-gold">{getBookingPassId(reg)}</td>
                      <td className="px-3 py-3">
                        {reg.checkedIn ? (
                          <span className="text-emerald-400 font-bold">Checked In</span>
                        ) : (
                          <span className="text-white/40">Not Checked In</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DATA ANALYSIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Event Data Analysis & Intelligence</h3>
              <p className="text-xs text-text-secondary">
                Calculated strictly from live bookings and check-in records for Event ID: {currentEvent.id}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportAnalyticsCSV}
                className="px-3.5 py-2 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* 4 Analytics Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Registration Analytics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Registration Analytics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Total Registrations</span>
                  <p className="text-xl font-black text-white mt-0.5">{metrics.totalRegistrations}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Free Registrations</span>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{metrics.freeRegistrations}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gold uppercase font-bold">Paid Registrations</span>
                  <p className="text-xl font-black text-gold mt-0.5">{metrics.paidRegistrations}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-rose-400 uppercase font-bold">Cancelled</span>
                  <p className="text-xl font-black text-rose-400 mt-0.5">{metrics.cancelledRegistrations}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Capacity Utilization</span>
                  <span className="font-bold text-white">
                    {Math.min(100, Math.round((metrics.passesIssued / (metrics.totalCapacity || 1)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((metrics.passesIssued / (metrics.totalCapacity || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Pass Analytics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gold" /> Pass Analytics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Total Capacity</span>
                  <p className="text-xl font-black text-white mt-0.5">{metrics.totalCapacity}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gold uppercase font-bold">Passes Issued</span>
                  <p className="text-xl font-black text-gold mt-0.5">{metrics.passesIssued}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Remaining Available</span>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{metrics.availablePasses}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-text-muted uppercase font-bold">No-Show / Pending In</span>
                  <p className="text-xl font-black text-white mt-0.5">{metrics.notCheckedIn}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Pass Issuance Ratio</span>
                  <span className="font-bold text-white">{metrics.passesIssued} of {metrics.totalCapacity}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((metrics.passesIssued / (metrics.totalCapacity || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Financial Analytics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Financial Analytics
              </h4>
              {currentEvent.eventType === 'FREE' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full uppercase">
                    Event Type: FREE
                  </span>
                  <p className="text-2xl font-black text-white">Revenue: ₹0</p>
                  <p className="text-xs text-emerald-400/80">
                    Complimentary event registration. Zero payment gateway fees applied.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Gross Revenue</span>
                      <p className="text-xl font-black text-gold mt-0.5">₹{metrics.grossRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">Net Collected</span>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">₹{metrics.grossRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Successful Orders</span>
                      <p className="text-xl font-black text-white mt-0.5">{metrics.paidRegistrations}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-rose-400 uppercase font-bold">Refunded / Cancelled</span>
                      <p className="text-xl font-black text-rose-400 mt-0.5">₹0</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Check-in Analytics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> Check-in Analytics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Total Attendees</span>
                  <p className="text-xl font-black text-white mt-0.5">{metrics.passesIssued}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Checked In</span>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{metrics.checkedInAttendees}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-amber-300 uppercase font-bold">Not Checked In</span>
                  <p className="text-xl font-black text-amber-300 mt-0.5">{metrics.notCheckedIn}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Check-in Rate</span>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{metrics.checkInRate}%</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Gate Progress</span>
                  <span className="font-bold text-emerald-400">{metrics.checkInRate}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.checkInRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHECK-INS */}
      {activeTab === 'checkins' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" /> Gate QR & Pass Check-in
              </h3>
              <p className="text-xs text-text-secondary">
                Scan attendee QR code or enter Pass ID. Validated strictly against event "{currentEvent.title}".
              </p>
            </div>

            <form onSubmit={handleCheckInScan} className="flex gap-2">
              <input
                type="text"
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                placeholder="Scan QR or enter Pass ID (e.g. CV-EVT-2026-000184)..."
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-gold font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Verify Pass
              </button>
            </form>

            {/* Check-in result panel */}
            {checkInResult && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
                  checkInResult.status === 'VALID' || checkInResult.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : checkInResult.status === 'ALREADY_CHECKED_IN'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {checkInResult.status === 'VALID' || checkInResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : checkInResult.status === 'ALREADY_CHECKED_IN' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{checkInResult.message}</span>
                </div>

                {checkInResult.booking && (
                  <div className="bg-black/50 p-4 rounded-xl space-y-2 border border-white/10 text-white font-sans">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[10px] text-text-muted block">ATTENDEE NAME</span>
                        <span className="font-bold text-sm">{checkInResult.booking.primaryAttendee?.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-gold/20 text-gold border border-gold/30">
                        {getBookingPassId(checkInResult.booking)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-muted block text-[10px]">PASS TYPE</span>
                        <span>{checkInResult.booking.ticketTypeName || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">TICKETS</span>
                        <span>{checkInResult.booking.ticketCount || 1} Person</span>
                      </div>
                    </div>

                    {checkInResult.status === 'VALID' && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleConfirmGateCheckIn}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg"
                        >
                          Confirm & Check In Attendee
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-white">Event Operational Settings</h3>
            <p className="text-xs text-text-secondary">
              Control booking gate, visibility, and pass generation rules for this event.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1 font-semibold">Event Status</label>
              <select
                value={settingsStatus}
                onChange={(e) => setSettingsStatus(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted block mb-1 font-semibold">Registration Gate Status</label>
              <select
                value={settingsBookingStatus}
                onChange={(e) => setSettingsBookingStatus(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
              >
                <option value="OPEN">OPEN (Accepting Bookings)</option>
                <option value="CLOSED">CLOSED (Registration Stopped)</option>
                <option value="SOLD_OUT">SOLD OUT (Capacity Filled)</option>
                <option value="NOT_OPEN">NOT OPEN YET</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted block mb-1 font-semibold">Event Visibility</label>
              <select
                value={settingsVisibility}
                onChange={(e) => setSettingsVisibility(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-gold"
              >
                <option value="PUBLIC">PUBLIC (Visible on CineVenue Events Portal)</option>
                <option value="UNLISTED">UNLISTED (Accessible only via direct pass link)</option>
                <option value="PRIVATE">PRIVATE (Admin & VIP testing only)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <div>
                <span className="font-bold text-white block">Event Pass Generation</span>
                <span className="text-[11px] text-text-muted">
                  Automatically generate vertical A4 event passes upon confirmed registration
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsPassEnabled(!settingsPassEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settingsPassEnabled ? 'bg-gold text-black font-extrabold' : 'bg-white/10 text-white/50'
                }`}
              >
                {settingsPassEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASS DETAIL MODAL */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121216] border border-gold/40 rounded-2xl max-w-lg w-full p-6 text-left space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-white text-base">Event Pass Details</h3>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-text-muted block text-[10px]">PASS ID</span>
                  <span className="font-mono font-bold text-gold text-sm">{getBookingPassId(selectedPass)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">ORDER ID</span>
                  <span className="font-mono text-white">{getBookingOrderId(selectedPass)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted block">Attendee Name</span>
                  <span className="font-bold text-white">{selectedPass.primaryAttendee?.name}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Pass Tier</span>
                  <span className="font-bold text-white">{selectedPass.ticketTypeName || 'General'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Phone</span>
                  <span className="text-white">{selectedPass.primaryAttendee?.phone}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Email</span>
                  <span className="text-white truncate block">{selectedPass.primaryAttendee?.email}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Fee Status</span>
                  <span className="font-bold text-emerald-400">
                    {isFreeEventBooking(selectedPass) ? 'FREE ENTRY' : `₹${selectedPass.pricing?.finalAmount || 0}`}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Check-in Status</span>
                  <span className="font-bold text-white">
                    {selectedPass.checkedIn ? `Checked In (${selectedPass.checkedInAt || ''})` : 'Not Checked In'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => handleDownloadPass(selectedPass)}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => handlePrintPass(selectedPass)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Event Modal */}
      {shareModalOpen && (
        <EventShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          event={{
            id: currentEvent.id,
            title: currentEvent.title,
            venueName: currentEvent.venueName,
            city: currentEvent.city,
            date: currentEvent.date,
            description: currentEvent.description,
          }}
        />
      )}
    </div>
  );
}
