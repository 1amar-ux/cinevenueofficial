import React, { useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Info,
  Tag,
  Calendar,
  Clock,
  User,
  Shield,
  Ticket,
  Eye,
  Download,
  QrCode,
  ArrowLeft,
} from 'lucide-react';
import ImageUploader, { UploadedMedia } from './ImageUploader';
import apiClient from '../../../services/apiClient';
import { saveEvent } from '../../../services/eventBookingService';
import { formatEventDateAndDay, generateAndDownloadEventPassPdf } from '../../../utils/eventPassPdf';
import type { EventCategoryType } from '../../../types/eventBooking';

interface PaidPassRow {
  name: string;
  tier: 'General' | 'Premium' | 'VIP' | 'VVIP';
  price: number;
  totalQuantity: number;
  maxPerBooking: number;
  description: string;
}

interface FreePassRow {
  name: string;
  allocatedCapacity: number;
  maxPerPerson: number;
  maxPerOrganisation: number;
  approvalRequired: boolean;
}

export default function EventCreator({
  onCreated,
  editingEvent,
  onCancel,
}: {
  onCreated: (event?: any) => void;
  editingEvent?: any;
  onCancel?: () => void;
}) {
  const isEditing = Boolean(editingEvent);

  // 1. Basic Info
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [category, setCategory] = useState<string>(editingEvent?.category || 'Concerts');
  const [description, setDescription] = useState(editingEvent?.description || '');

  // 2. Media Uploads
  const [posterMedia, setPosterMedia] = useState<UploadedMedia>({
    url: editingEvent?.bannerUrl || editingEvent?.posterUrl || '',
    publicId: '',
    alt: editingEvent?.title || '',
  });
  const [bannerMedia, setBannerMedia] = useState<UploadedMedia>({
    url: editingEvent?.bannerUrl || '',
    publicId: '',
    alt: editingEvent?.title || '',
  });

  // 3. Event Type & Pass Mode
  const [eventType, setEventType] = useState<'PAID' | 'FREE'>(
    editingEvent?.eventType || (editingEvent?.ticketTypes?.some((t: any) => t.price > 0) ? 'PAID' : 'FREE')
  );
  const [passMode, setPassMode] = useState<'PAID' | 'FREE' | 'BOTH'>(
    editingEvent?.passMode || (editingEvent?.eventType === 'FREE' ? 'FREE' : 'PAID')
  );

  // 4. Lifecycles
  const [status, setStatus] = useState<'DRAFT' | 'UPCOMING' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'>(
    editingEvent?.status || 'PUBLISHED'
  );
  const [bookingStatus, setBookingStatus] = useState<'NOT_OPEN' | 'OPEN' | 'CLOSED' | 'SOLD_OUT'>(
    editingEvent?.bookingStatus || 'OPEN'
  );

  // 5. Date & Time
  const [date, setDate] = useState(editingEvent?.date || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '18:30');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '21:30');

  // 6. Venue & Location
  const [venueName, setVenueName] = useState(editingEvent?.venueName || '');
  const [venueAddress, setVenueAddress] = useState(editingEvent?.venueAddress || '');
  const [city, setCity] = useState(editingEvent?.city || 'Hyderabad');
  const [state, setState] = useState(editingEvent?.state || 'Telangana');
  const [locationUrl, setLocationUrl] = useState(editingEvent?.locationUrl || '');

  // 7. Organizer Contact Info
  const [organizerName, setOrganizerName] = useState(
    editingEvent?.organizer?.name || 'CineVenue Official Events'
  );
  const [organizerEmail, setOrganizerEmail] = useState(
    editingEvent?.organizer?.email || 'events@cinevenue.in'
  );
  const [organizerPhone, setOrganizerPhone] = useState(
    editingEvent?.organizer?.phone || ''
  );
  const [organizerCompany, setOrganizerCompany] = useState(
    editingEvent?.organizer?.companyName || 'CineVenue Entertainment Pvt Ltd'
  );

  // 8. Capacities & Limits
  const [totalCapacity, setTotalCapacity] = useState<number>(editingEvent?.totalCapacity || 1000);
  const [maxTicketsPerBooking, setMaxTicketsPerBooking] = useState<number>(
    editingEvent?.maxTicketsPerBooking || 10
  );
  const [minTicketsPerBooking, setMinTicketsPerBooking] = useState<number>(
    editingEvent?.minTicketsPerBooking || 1
  );
  const [allowOverbooking, setAllowOverbooking] = useState<boolean>(
    editingEvent?.allowOverbooking || false
  );
  const [bookingStartDate, setBookingStartDate] = useState(editingEvent?.bookingStartDate || '');
  const [bookingEndDate, setBookingEndDate] = useState(editingEvent?.bookingEndDate || '');

  // 9. Paid Pass Types
  const [paidPasses, setPaidPasses] = useState<PaidPassRow[]>(() => {
    if (editingEvent?.ticketTypes && editingEvent.ticketTypes.length > 0) {
      return editingEvent.ticketTypes.map((t: any) => ({
        name: t.name,
        tier: t.tier || 'General',
        price: t.price || 0,
        totalQuantity: t.availableQuantity || t.totalQuantity || 100,
        maxPerBooking: t.maxPerUser || 10,
        description: t.description || '',
      }));
    }
    return [
      { name: 'General Admission', tier: 'General', price: 499, totalQuantity: 800, maxPerBooking: 10, description: 'Standard admission to general arena.' },
      { name: 'VIP Front Tier', tier: 'VIP', price: 1499, totalQuantity: 200, maxPerBooking: 4, description: 'Priority entrance & VIP seating section.' },
    ];
  });

  // 10. Free / Complimentary Passes
  const [freePasses, setFreePasses] = useState<FreePassRow[]>(() => {
    if (editingEvent?.freePassCategories && editingEvent.freePassCategories.length > 0) {
      return editingEvent.freePassCategories.map((f: any) => ({
        name: f.name,
        allocatedCapacity: f.allocatedCapacity || 50,
        maxPerPerson: f.maxPerPerson || 2,
        maxPerOrganisation: f.maxPerOrganisation || 5,
        approvalRequired: Boolean(f.approvalRequired),
      }));
    }
    return [
      { name: 'Press / Media', allocatedCapacity: 50, maxPerPerson: 2, maxPerOrganisation: 5, approvalRequired: true },
      { name: 'VIP Guest & Sponsor', allocatedCapacity: 50, maxPerPerson: 2, maxPerOrganisation: 4, approvalRequired: false },
    ];
  });

  // 11. Terms & Conditions
  const [terms, setTerms] = useState<string>(
    editingEvent?.termsAndConditions?.join('\n') ||
      'Please present official digital pass with valid photo ID at venue gates.\nTickets once booked are non-refundable unless the event is cancelled.\nEntry will be granted only after physical QR code verification at the gate.'
  );

  // 12. EVENT PASS SETTINGS
  const [enableEventPass, setEnableEventPass] = useState<boolean>(
    editingEvent?.passSettings?.enabled !== false
  );
  const [passTypesList, setPassTypesList] = useState<string[]>(() => {
    if (editingEvent?.passSettings?.passTypes && editingEvent.passSettings.passTypes.length > 0) {
      return editingEvent.passSettings.passTypes;
    }
    return ['VIP', 'GENERAL', 'GUEST', 'MEDIA', 'STAFF'];
  });
  const [newPassTypeInput, setNewPassTypeInput] = useState('');
  const [previewPassType, setPreviewPassType] = useState<string>('VIP');

  // State & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic calculations for Pass Settings
  const { formattedDate: formattedPreviewDate, day: calculatedDay } = formatEventDateAndDay(date);
  const isFree = eventType === 'FREE';
  const effectiveFee = isFree ? 0 : (paidPasses[0]?.price || 999);
  const previewPosterUrl =
    posterMedia.url ||
    bannerMedia.url ||
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80';

  // Synchronize passMode when eventType changes
  const handleEventTypeSelect = (type: 'PAID' | 'FREE') => {
    setEventType(type);
    if (type === 'FREE') {
      setPassMode('FREE');
    } else {
      if (passMode === 'FREE') {
        setPassMode('PAID');
      }
    }
  };

  const handlePassModeSelect = (mode: 'PAID' | 'FREE' | 'BOTH') => {
    setPassMode(mode);
    if (mode === 'FREE' && eventType === 'PAID') {
      setEventType('FREE');
    } else if ((mode === 'PAID' || mode === 'BOTH') && eventType === 'FREE') {
      setEventType('PAID');
    }
  };

  // Paid passes handlers
  const handleAddPaidPass = () => {
    setPaidPasses([
      ...paidPasses,
      {
        name: `Pass Tier ${paidPasses.length + 1}`,
        tier: 'General',
        price: 799,
        totalQuantity: 100,
        maxPerBooking: 6,
        description: 'Standard event access ticket.',
      },
    ]);
  };

  const handleRemovePaidPass = (index: number) => {
    if (paidPasses.length <= 1 && passMode === 'PAID') {
      alert('Event must have at least one ticket pass.');
      return;
    }
    setPaidPasses(paidPasses.filter((_, idx) => idx !== index));
  };

  const handlePaidPassChange = (index: number, field: keyof PaidPassRow, val: any) => {
    setPaidPasses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Free passes handlers
  const handleAddFreePass = () => {
    setFreePasses([
      ...freePasses,
      {
        name: 'Cast & Crew Invitee',
        allocatedCapacity: 25,
        maxPerPerson: 2,
        maxPerOrganisation: 4,
        approvalRequired: false,
      },
    ]);
  };

  const handleRemoveFreePass = (index: number) => {
    setFreePasses(freePasses.filter((_, idx) => idx !== index));
  };

  const handleFreePassChange = (index: number, field: keyof FreePassRow, val: any) => {
    setFreePasses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Total allocated capacity checks
  const totalPaidAllocated = (passMode === 'PAID' || passMode === 'BOTH')
    ? paidPasses.reduce((acc, p) => acc + (Number(p.totalQuantity) || 0), 0)
    : 0;
  const totalFreeAllocated = (passMode === 'FREE' || passMode === 'BOTH')
    ? freePasses.reduce((acc, f) => acc + (Number(f.allocatedCapacity) || 0), 0)
    : 0;
  const totalAllocated = totalPaidAllocated + totalFreeAllocated;
  const isOverAllocated = totalAllocated > totalCapacity && !allowOverbooking;

  // Test Download Preview Action
  const handleDownloadSamplePreview = () => {
    const samplePass = {
      id: 'CV-EVT-2026-PREVIEW',
      passCode: 'CV-EVT-2026-PREVIEW',
      orderId: isFree ? 'CV-FREE-2026-PREVIEW' : 'CV-ORDER-2026-PREVIEW',
      eventId: editingEvent?.id || 'EVT-PREVIEW',
      bookingMode: isFree ? 'FREE' : 'PAID',
      eventTitle: title || 'CineVenue Grand Launch',
      eventDate: date || '2026-10-18',
      eventTime: startTime || '6:00 PM',
      venueName: venueName || 'Grand Convention Hall',
      venueAddress:
        venueAddress ||
        `${venueName || 'Grand Convention Hall'}, ${city || 'Hyderabad'}, ${state || 'Telangana'}`,
      city: city || 'Hyderabad',
      bannerUrl: previewPosterUrl,
      ticketTypeName: previewPassType,
      ticketCount: 1,
      primaryAttendee: {
        name: 'Sample Attendee',
        email: 'attendee@cinevenue.in',
        phone: '',
      },
      pricing: {
        ticketSubtotal: effectiveFee,
        platformBookingFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        cineCoinsRedeemed: 0,
        cineCoinsDiscount: 0,
        finalAmount: effectiveFee,
      },
      paymentMethod: isFree ? 'FREE_REGISTRATION' : 'Online Gateway',
      paymentStatus: isFree ? 'FREE' : 'PAID',
      bookingStatus: 'Confirmed',
      qrCodePayload: 'CV-EVT-2026-PREVIEW',
      bookedAt: new Date().toISOString(),
      checkedIn: false,
    };
    generateAndDownloadEventPassPdf(samplePass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || !date || !venueName.trim() || !city.trim()) {
      setErrorMessage('Please fill in all mandatory fields (Title, Date, Venue Name, City).');
      return;
    }

    const effectivePosterUrl =
      posterMedia.url ||
      bannerMedia.url ||
      'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800';
    const effectiveBannerUrl =
      bannerMedia.url ||
      posterMedia.url ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200';
    const effectiveCapacity = Math.max(Number(totalCapacity) || 1000, totalAllocated);

    setIsSubmitting(true);

    try {
      // Build ticket types payload for backend
      const formattedTicketTypes =
        passMode === 'PAID' || passMode === 'BOTH'
          ? paidPasses.map((p) => ({
              name: p.name.trim(),
              tier: p.tier,
              price: eventType === 'FREE' ? 0 : Number(p.price) || 0,
              totalQuantity: Number(p.totalQuantity) || 100,
              availableQuantity: Number(p.totalQuantity) || 100,
              maxPerBooking: Number(p.maxPerBooking) || maxTicketsPerBooking || 6,
              minPerBooking: minTicketsPerBooking || 1,
              description: p.description || '',
            }))
          : [];

      // Build free pass categories
      const formattedFreePassCategories =
        passMode === 'FREE' || passMode === 'BOTH'
          ? freePasses.map((f, idx) => ({
              categoryId: `FPC-${idx + 1}-${Date.now().toString().slice(-4)}`,
              name: f.name.trim(),
              allocatedCapacity: Number(f.allocatedCapacity) || 50,
              maxPerPerson: Number(f.maxPerPerson) || 2,
              maxPerOrganisation: Number(f.maxPerOrganisation) || 5,
              approvalRequired: Boolean(f.approvalRequired),
              emailDeliveryEnabled: true,
            }))
          : [];

      const targetEventId = editingEvent?.id || editingEvent?._id || `CV-EVT-2026-${Date.now().toString().slice(-4)}`;

      const payload = {
        id: targetEventId,
        title: title.trim(),
        description: description.trim() || `${title} live in ${city}. Hosted exclusively on CineVenue.`,
        category,
        eventType,
        passMode,
        poster: { url: effectivePosterUrl, publicId: posterMedia.publicId || 'poster_default', alt: title.trim() },
        banner: { url: effectiveBannerUrl, publicId: bannerMedia.publicId || 'banner_default', alt: title.trim() },
        date,
        startTime,
        endTime,
        status,
        bookingStatus,
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim() || `${venueName}, ${city}`,
          city: city.trim(),
          state: state.trim(),
          location: locationUrl.trim(),
        },
        organizerContact: {
          name: organizerName.trim(),
          email: organizerEmail.trim(),
          phone: organizerPhone.trim(),
          company: organizerCompany.trim(),
        },
        totalTicketCapacity: effectiveCapacity,
        maxTicketsPerBooking: Number(maxTicketsPerBooking) || 10,
        minTicketsPerBooking: Number(minTicketsPerBooking) || 1,
        allowOverbooking,
        bookingStartDate: bookingStartDate || null,
        bookingEndDate: bookingEndDate || null,
        ticketTypes: formattedTicketTypes,
        freePassCategories: formattedFreePassCategories,
        termsAndConditions: terms.split('\n').filter((t) => t.trim().length > 0),
        passSettings: {
          enabled: enableEventPass,
          passTypes: passTypesList,
          autoGenerateOnBooking: true,
        },
      };

      // Construct canonical EventItem for immediate single-source-of-truth storage
      const normalizedEventItem: any = {
        id: targetEventId,
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim() || `${title} live in ${city}. Hosted exclusively on CineVenue.`,
        category: category as any,
        bannerUrl: effectiveBannerUrl,
        posterUrl: effectivePosterUrl,
        organizer: {
          id: 'ORG-ADMIN',
          name: organizerName.trim(),
          email: organizerEmail.trim(),
          phone: organizerPhone.trim(),
          companyName: organizerCompany.trim(),
          logoUrl: '/logo.jpg',
          isVerified: true,
          rating: 5.0,
          eventsCount: 10,
        },
        date,
        startTime,
        endTime,
        duration: '3h 00m',
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim() || `${venueName}, ${city}`,
        city: city.trim(),
        language: 'English / Regional',
        ageRestriction: 'All Ages',
        termsAndConditions: terms.split('\n').filter((t) => t.trim().length > 0),
        cancellationPolicy: 'Refundable up to 24 hours prior to event start.',
        seatingType: 'GeneralAdmission',
        totalCapacity: effectiveCapacity,
        status: status as any,
        eventType,
        isFeatured: true,
        isActive: status !== 'DRAFT' && status !== 'CANCELLED',
        image: effectiveBannerUrl || effectivePosterUrl,
        ticketTypes: formattedTicketTypes.map((t, idx) => ({
          id: `TKT-${Date.now()}-${idx + 1}`,
          eventId: targetEventId,
          name: t.name,
          tier: t.tier,
          description: t.description,
          price: t.price,
          isFree: t.price === 0,
          availableQuantity: t.availableQuantity,
          soldQuantity: 0,
          maxPerUser: t.maxPerBooking,
          minPerUser: t.minPerBooking,
          status: 'Active',
          isRefundable: t.price > 0,
        })),
        passSettings: {
          enabled: enableEventPass,
          passTypes: passTypesList,
          autoGenerateOnBooking: true,
        },
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Immediately store into canonical event store
      saveEvent(normalizedEventItem);

      // 2. Authoritative API sync to CineVenue backend MongoDB
      try {
        const res = await apiClient.post('/admin/events', payload);
        const createdEvent = res.data?.event;
        if (createdEvent) {
          saveEvent(createdEvent);
        }
      } catch (apiErr) {
        console.warn('Backend API sync notice (saved to canonical store):', apiErr);
      }

      setSuccessMessage(
        isEditing
          ? `✅ Event "${title}" updated successfully! Changes applied to future pass generations safely.`
          : `✅ Event "${title}" created successfully as ${status}! Available immediately in Admin Panel and customer event discovery.`
      );

      setTimeout(() => {
        onCreated(normalizedEventItem);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save event:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save event to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            {isEditing && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Cancel editing"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              {isEditing ? `Edit Event: ${editingEvent.title}` : 'Create New Event'}
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Configure live ticketed or free events, integrate vertical A4 event passes, and publish to CineVenue.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
              status === 'PUBLISHED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : status === 'UPCOMING'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {status}
          </span>
          <span className="text-xs font-mono text-white/40">• Booking: {bookingStatus}</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* SECTION 1: EVENT TYPE & PASS MODE SELECTION */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold flex items-center gap-2">
            <Tag className="w-4 h-4" /> 1. Event Type & Ticket Pass Configuration
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase">
                Event Type <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleEventTypeSelect('PAID')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    eventType === 'PAID'
                      ? 'bg-gold/15 border-gold text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold uppercase font-mono">Paid Event</p>
                  <p className="text-[11px] text-white/50 mt-0.5">Tickets sold via payment gateway</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleEventTypeSelect('FREE')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    eventType === 'FREE'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold uppercase font-mono">Free Event</p>
                  <p className="text-[11px] text-white/50 mt-0.5">Direct ₹0 RSVP admission</p>
                </button>
              </div>
            </div>

            {/* Pass Type Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase">
                Ticket / Pass Type <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PAID', 'FREE', 'BOTH'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePassModeSelect(m)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      passMode === m
                        ? m === 'FREE'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : m === 'BOTH'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-gold/20 border-gold text-gold'
                        : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase font-mono">
                      {m === 'PAID' ? 'Paid Passes' : m === 'FREE' ? 'Free Passes' : 'Paid & Free'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BASIC DETAILS & FILE UPLOADS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Event Title <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                placeholder="e.g. CineVenue Grand Launch"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Event Category <span className="text-gold">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-gold outline-none"
                >
                  <option value="Concerts">Concerts</option>
                  <option value="Film Events">Film Events</option>
                  <option value="Pre-Release">Pre-Release / Audio Launch</option>
                  <option value="Cultural Events">Cultural Events</option>
                  <option value="Stand-up Comedy">Stand-up Comedy</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Sports Events">Sports Events</option>
                  <option value="Conferences">Conferences</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Total Capacity <span className="text-gold">*</span>
                </label>
                <input
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-gold outline-none"
                  min={1}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-gold outline-none resize-none"
                placeholder="Provide event details, highlights, guest info..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/10 p-3 rounded-xl">
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="PUBLISHED">PUBLISHED (Live)</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Booking Gate</label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="OPEN">OPEN (Accepting)</option>
                  <option value="NOT_OPEN">NOT OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="SOLD_OUT">SOLD OUT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader
              label="Event Poster"
              description="Portrait (3:4 ratio). Displayed on website, app, and vertical Event Passes."
              uploadType="poster"
              value={posterMedia}
              onChange={setPosterMedia}
              aspectRatio="portrait"
            />

            <ImageUploader
              label="Event Banner"
              description="Landscape (16:9 ratio). Displayed on details hero page."
              uploadType="banner"
              value={bannerMedia}
              onChange={setBannerMedia}
              aspectRatio="landscape"
            />
          </div>
        </div>

        {/* SECTION 3: DATE, VENUE & ORGANIZER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Date & Time */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Schedule
            </h4>

            <div>
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Event Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                required
              />
              {date && (
                <p className="text-[10px] text-gold font-semibold mt-1">
                  Computed Day: {calculatedDay}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Start Time *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Venue & Location
            </h4>

            <div>
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Venue Name *</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Grand Convention Hall"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Full Venue Address *</label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="HITEC City Main Boulevard, Madhapur, Hyderabad, 500081"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Organizer Contact */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold flex items-center gap-1.5">
              <User className="w-4 h-4" /> Organizer & Support
            </h4>

            <div>
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Organizer Name</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Email</label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Phone</label>
                <input
                  type="text"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Company / Production</label>
              <input
                type="text"
                value={organizerCompany}
                onChange={(e) => setOrganizerCompany(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PAID PASSES */}
        {(passMode === 'PAID' || passMode === 'BOTH') && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold flex items-center gap-1.5">
                  Paid Ticket Passes ({paidPasses.length} configured)
                </h4>
                <p className="text-[11px] text-white/40">
                  Total Allocated: {totalPaidAllocated.toLocaleString()} passes
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPaidPass}
                className="text-gold text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Paid Pass Tier
              </button>
            </div>

            <div className="space-y-3">
              {paidPasses.map((pass, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center bg-white/[0.03] p-3 rounded-xl border border-white/5"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-white/40 mb-1">Tier Name</label>
                    <input
                      type="text"
                      value={pass.name}
                      onChange={(e) => handlePaidPassChange(idx, 'name', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. VIP Pass"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Tier Category</label>
                    <select
                      value={pass.tier}
                      onChange={(e) => handlePaidPassChange(idx, 'tier', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="General">General</option>
                      <option value="VIP">VIP</option>
                      <option value="Premium">Premium</option>
                      <option value="VVIP">VVIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={pass.price}
                      onChange={(e) => handlePaidPassChange(idx, 'price', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      min={0}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={pass.totalQuantity}
                      onChange={(e) => handlePaidPassChange(idx, 'totalQuantity', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      min={1}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/40 mb-1">Max/Booking</label>
                      <input
                        type="number"
                        value={pass.maxPerBooking}
                        onChange={(e) => handlePaidPassChange(idx, 'maxPerBooking', Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                        min={1}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePaidPass(idx)}
                      className="p-1.5 text-white/30 hover:text-rose-400 cursor-pointer mt-4 transition-colors"
                      title="Remove pass tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: FREE PASSES */}
        {(passMode === 'FREE' || passMode === 'BOTH') && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Complimentary / Free Passes ({freePasses.length} categories)
                </h4>
                <p className="text-[11px] text-white/40">
                  Total Allocated: {totalFreeAllocated.toLocaleString()} passes (Bypasses payment gateway • ₹0 Total)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFreePass}
                className="text-emerald-400 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Free Pass Category
              </button>
            </div>

            <div className="space-y-3">
              {freePasses.map((fpass, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-white/[0.03] p-3 rounded-xl border border-white/5"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-white/40 mb-1">Pass Category Name</label>
                    <input
                      type="text"
                      value={fpass.name}
                      onChange={(e) => handleFreePassChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Press/Media, Sponsor, Cast & Crew"
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Allocated Capacity</label>
                    <input
                      type="number"
                      value={fpass.allocatedCapacity}
                      onChange={(e) => handleFreePassChange(idx, 'allocatedCapacity', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      min={1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Max Per Person</label>
                    <input
                      type="number"
                      value={fpass.maxPerPerson}
                      onChange={(e) => handleFreePassChange(idx, 'maxPerPerson', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      min={1}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fpass.approvalRequired}
                        onChange={(e) => handleFreePassChange(idx, 'approvalRequired', e.target.checked)}
                        className="rounded border-white/20 bg-black text-gold cursor-pointer"
                      />
                      <span>Approval Req.</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveFreePass(idx)}
                      className="p-1 text-white/30 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Remove free category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: CAPACITY CHECK & TERMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-gold">
              Capacity Allocation Summary
            </h4>
            <div className="text-xs space-y-1 text-white/60">
              <p>Total Event Capacity: <span className="font-bold text-white">{totalCapacity.toLocaleString()}</span></p>
              <p>Paid Passes Allocated: <span className="font-bold text-gold">{totalPaidAllocated.toLocaleString()}</span></p>
              <p>Free Passes Allocated: <span className="font-bold text-emerald-400">{totalFreeAllocated.toLocaleString()}</span></p>
              <p>
                Total Committed: <span className={`font-bold ${isOverAllocated ? 'text-rose-400' : 'text-white'}`}>{totalAllocated.toLocaleString()}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="overbookingCheck"
                checked={allowOverbooking}
                onChange={(e) => setAllowOverbooking(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-gold focus:ring-0 cursor-pointer"
              />
              <label htmlFor="overbookingCheck" className="text-xs text-white/70 cursor-pointer">
                Allow Overbooking (Permit allocated passes &gt; total event capacity)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Terms & Conditions (One per line)
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* SECTION 7: EVENT PASS SETTINGS & LIVE PASS PREVIEW */}
        <div className="bg-black/40 border-2 border-gold/40 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-gold" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  EVENT PASS SETTINGS
                </h3>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Configure how passes will be generated for this event and preview the vertical portrait CineVenue ticket pass.
              </p>
            </div>

            {/* 1. Enable Event Pass [ ON / OFF ] */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <span className="text-xs font-bold text-white uppercase">1. Enable Event Pass:</span>
              <button
                type="button"
                onClick={() => setEnableEventPass(!enableEventPass)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  enableEventPass
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {enableEventPass ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {enableEventPass ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Configuration & Auto-Inherited parameters (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 2. PASS TYPE CONFIGURATION */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-gold uppercase tracking-wider">
                    2. Configured Pass Types ({passTypesList.length})
                  </label>
                  <p className="text-[11px] text-white/50">
                    Add or edit pass types (e.g. VIP, GENERAL, GUEST, MEDIA, STAFF). Click any tag to select for live preview.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {passTypesList.map((pt) => (
                      <span
                        key={pt}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                          previewPassType === pt
                            ? 'bg-gold text-black shadow-md'
                            : 'bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        <span
                          className="cursor-pointer"
                          onClick={() => setPreviewPassType(pt)}
                          title="Click to preview this pass type"
                        >
                          {pt}
                        </span>
                        {passTypesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = passTypesList.filter((x) => x !== pt);
                              setPassTypesList(filtered);
                              if (previewPassType === pt && filtered.length > 0) {
                                setPreviewPassType(filtered[0]);
                              }
                            }}
                            className="text-white/40 hover:text-white cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Pass Type Input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newPassTypeInput}
                      onChange={(e) => setNewPassTypeInput(e.target.value)}
                      placeholder="Add Pass Type (e.g. MEDIA, STAFF, VVIP)"
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-gold outline-none uppercase font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPassTypeInput.trim()) {
                            const clean = newPassTypeInput.trim().toUpperCase();
                            if (!passTypesList.includes(clean)) {
                              setPassTypesList([...passTypesList, clean]);
                            }
                            setNewPassTypeInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPassTypeInput.trim()) {
                          const clean = newPassTypeInput.trim().toUpperCase();
                          if (!passTypesList.includes(clean)) {
                            setPassTypesList([...passTypesList, clean]);
                          }
                          setNewPassTypeInput('');
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Add Pass Type
                    </button>
                  </div>
                </div>

                {/* 3-9. AUTO-INHERITED FIELDS SUMMARY */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold" /> Auto-Inherited Event Parameters
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Synchronized Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {/* 3. Event Fee */}
                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">3. Event Fee</span>
                      <p className="font-bold text-white mt-0.5">
                        {isFree ? (
                          <span className="text-emerald-400 font-mono">FREE ENTRY (Free Order)</span>
                        ) : (
                          <span className="text-gold font-mono">₹{effectiveFee.toLocaleString('en-IN')} (Configured Price)</span>
                        )}
                      </p>
                    </div>

                    {/* 4. Event Poster */}
                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">4. Event Poster</span>
                      <p className="text-white/80 mt-0.5 truncate text-[11px]">
                        {posterMedia.url ? '✓ Uploaded Poster Inherited' : 'Default Event Artwork'}
                      </p>
                    </div>

                    {/* 5 & 6. Date & Day */}
                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">5 & 6. Date & Calculated Day</span>
                      <p className="font-bold text-white mt-0.5">
                        {date ? formattedPreviewDate : '18 October 2026'}{' '}
                        <span className="text-gold font-semibold">({date ? calculatedDay : 'Sunday'})</span>
                      </p>
                    </div>

                    {/* 7. Event Time */}
                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">7. Event Time</span>
                      <p className="font-bold text-white mt-0.5">{startTime} - {endTime}</p>
                    </div>

                    {/* 8 & 9. Venue & Full Address */}
                    <div className="col-span-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">8 & 9. Venue & Full Address</span>
                      <p className="font-bold text-gold mt-0.5">{venueName || 'Grand Convention Hall'}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">
                        {venueAddress || `${venueName || 'Grand Convention Hall'}, ${city || 'Hyderabad'}, ${state || 'Telangana'}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 11. PASS GENERATION RULE */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    11. Pass Generation Rule
                  </span>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1.5 text-[11px]">
                    {isFree ? (
                      <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Free Event: Free Registration Confirmed → Free Order Created → Vertical Pass Generated
                      </p>
                    ) : (
                      <p className="text-gold font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                        Paid Event: Payment Successful → Booking Confirmed → Vertical Pass Generated
                      </p>
                    )}
                    <p className="text-white/40 text-[10px]">
                      Passes are generated with unique IDs formatted as CV-EVT-2026-XXXXXX and scannable QR code.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Event Pass Preview Card (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> 10. Live Pass Design Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadSamplePreview}
                    className="text-[10px] font-bold text-black bg-gold hover:bg-gold-light px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3" /> Test Download PDF
                  </button>
                </div>

                {/* Scaled/Responsive Vertical Pass Card Preview */}
                <div className="bg-[#111116] border-2 border-gold rounded-2xl overflow-hidden shadow-2xl relative text-left">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#1C190D] via-[#2A2308] to-[#15130A] border-b border-gold/60 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/logo.jpg" alt="Logo" className="w-6 h-6 rounded object-cover border border-gold" />
                      <div>
                        <span className="font-serif font-black text-xs text-white uppercase">
                          CINE<span className="text-gold">VENUE</span>
                        </span>
                        <p className="text-[7px] text-white/50 uppercase font-bold tracking-wider">Event Admission Pass</p>
                      </div>
                    </div>
                    <span className="bg-gold text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      {isFree ? 'FREE PASS' : `${previewPassType} PASS`}
                    </span>
                  </div>

                  {/* Event Poster */}
                  <div className="p-2.5 bg-black">
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-gold/30 bg-black flex items-center justify-center">
                      <img
                        src={previewPosterUrl}
                        alt="Event Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Event Name & Info */}
                  <div className="p-3 bg-[#111116] space-y-2 text-white">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1 border-l-2 border-gold pl-1.5">
                      {title || 'CineVenue Grand Launch'}
                    </h4>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="bg-white/5 p-1.5 rounded border border-white/5">
                        <span className="text-[7.5px] uppercase font-bold text-white/40 block">Date & Day</span>
                        <span className="font-bold text-white">{date ? formattedPreviewDate : '18 October 2026'}</span>
                        <span className="text-gold block font-semibold text-[8px]">{date ? calculatedDay : 'Sunday'}</span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded border border-white/5">
                        <span className="text-[7.5px] uppercase font-bold text-white/40 block">Time & Venue</span>
                        <span className="font-bold text-gold">{startTime || '6:00 PM'}</span>
                        <span className="text-white/70 block truncate text-[9px]">{venueName || 'Grand Convention Hall'}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-1.5 rounded border border-white/5 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[7.5px] uppercase font-bold text-white/40">Fee & Order</span>
                        <span className="font-mono text-white/50 text-[9px]">CV-ORDER-2026-PREVIEW</span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className={isFree ? 'text-emerald-400 font-extrabold' : 'text-gold font-extrabold'}>
                          {isFree ? 'FREE ENTRY' : `₹${effectiveFee.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-white/60">Holder: Sample Attendee</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforation */}
                  <div className="relative h-4 bg-[#07070A] flex items-center">
                    <div className="w-4 h-4 bg-[#07070A] rounded-full -ml-2 border-r border-gold/40" />
                    <div className="flex-1 border-t border-dashed border-gold/40" />
                    <div className="w-4 h-4 bg-[#07070A] rounded-full -mr-2 border-l border-gold/40" />
                  </div>

                  {/* QR Code Section */}
                  <div className="p-3 bg-[#0B0B0F] flex items-center justify-between gap-3">
                    <div className="bg-white p-1 rounded-lg border border-gold shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent('CV-EVT-2026-PREVIEW')}`}
                        alt="QR"
                        className="w-16 h-16 block"
                      />
                    </div>
                    <div className="flex-1 text-[9px] space-y-0.5">
                      <p className="font-mono font-bold text-gold">CV-EVT-2026-PREVIEW</p>
                      <p className="text-emerald-400 font-bold uppercase tracking-wider text-[8px]">
                        ● SCAN AT ENTRY
                      </p>
                      <p className="text-white/40 text-[7.5px] leading-tight">
                        Vertical A4 format • Official digital admission
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-[#08080C] p-2 text-center border-t border-white/5">
                    <p className="text-[8px] font-mono text-gold font-bold uppercase tracking-widest">
                      CINEVENUE ENTERTAINMENTS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-white/40 bg-black/20 rounded-xl border border-white/5">
              <Ticket className="w-8 h-8 mx-auto text-white/20 mb-2" />
              <p className="text-xs font-semibold">Event Pass Generation is currently turned OFF for this event.</p>
              <p className="text-[11px] text-white/30 mt-1">
                Toggle to ON to allow attendees to receive and download official CineVenue vertical A4 passes.
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4 border-t border-white/10 gap-4 items-center">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold hover:bg-gold-light flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSubmitting
              ? 'Saving Event to Database...'
              : isEditing
              ? 'Update & Save Event'
              : 'Save & Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
