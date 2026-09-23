import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2, Sparkles, MapPin, Info, Tag, Calendar, Clock, User, Shield } from 'lucide-react';
import ImageUploader, { UploadedMedia } from './ImageUploader';
import apiClient from '../../../services/apiClient';
import { saveEvent } from '../../../services/eventBookingService';
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

export default function EventCreator({ onCreated }: { onCreated: () => void }) {
  // 1. Basic Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Concerts');
  const [description, setDescription] = useState('');

  // 2. Media Uploads (Files directly uploaded to CineVenue storage)
  const [posterMedia, setPosterMedia] = useState<UploadedMedia>({ url: '', publicId: '', alt: '' });
  const [bannerMedia, setBannerMedia] = useState<UploadedMedia>({ url: '', publicId: '', alt: '' });

  // 3. Event Type & Pass Mode
  const [eventType, setEventType] = useState<'PAID' | 'FREE'>('PAID');
  const [passMode, setPassMode] = useState<'PAID' | 'FREE' | 'BOTH'>('PAID');

  // 4. Lifecycles
  const [status, setStatus] = useState<'DRAFT' | 'UPCOMING' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'>('PUBLISHED');
  const [bookingStatus, setBookingStatus] = useState<'NOT_OPEN' | 'OPEN' | 'CLOSED' | 'SOLD_OUT'>('OPEN');

  // 5. Date & Time
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:30');

  // 6. Venue & Location
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [locationUrl, setLocationUrl] = useState('');

  // 7. Organizer Contact Info
  const [organizerName, setOrganizerName] = useState('CineVenue Official Events');
  const [organizerEmail, setOrganizerEmail] = useState('events@cinevenue.in');
  const [organizerPhone, setOrganizerPhone] = useState('+91 99999 00000');
  const [organizerCompany, setOrganizerCompany] = useState('CineVenue Entertainment Pvt Ltd');

  // 8. Capacities & Limits
  const [totalCapacity, setTotalCapacity] = useState<number>(1000);
  const [maxTicketsPerBooking, setMaxTicketsPerBooking] = useState<number>(10);
  const [minTicketsPerBooking, setMinTicketsPerBooking] = useState<number>(1);
  const [allowOverbooking, setAllowOverbooking] = useState<boolean>(false);
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');

  // 9. Paid Pass Types
  const [paidPasses, setPaidPasses] = useState<PaidPassRow[]>([
    { name: 'General Admission', tier: 'General', price: 499, totalQuantity: 800, maxPerBooking: 10, description: 'Standard admission to general arena.' },
    { name: 'VIP Front Tier', tier: 'VIP', price: 1499, totalQuantity: 200, maxPerBooking: 4, description: 'Priority entrance & VIP seating section.' },
  ]);

  // 10. Free / Complimentary Passes
  const [freePasses, setFreePasses] = useState<FreePassRow[]>([
    { name: 'Press / Media', allocatedCapacity: 50, maxPerPerson: 2, maxPerOrganisation: 5, approvalRequired: true },
    { name: 'VIP Guest & Sponsor', allocatedCapacity: 50, maxPerPerson: 2, maxPerOrganisation: 4, approvalRequired: false },
  ]);

  // 11. Terms & Conditions
  const [terms, setTerms] = useState<string>('Please present official digital pass with valid photo ID at venue gates.\nTickets once booked are non-refundable unless the event is cancelled.\nEntry will be granted only after physical QR code verification at the gate.');

  // State & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      // Free passes only means event is free
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

  // Allocations validation
  const totalPaidAllocated = (passMode === 'PAID' || passMode === 'BOTH')
    ? paidPasses.reduce((sum, p) => sum + (Number(p.totalQuantity) || 0), 0)
    : 0;

  const totalFreeAllocated = (passMode === 'FREE' || passMode === 'BOTH')
    ? freePasses.reduce((sum, f) => sum + (Number(f.allocatedCapacity) || 0), 0)
    : 0;

  const totalAllocated = totalPaidAllocated + totalFreeAllocated;
  const isOverAllocated = !allowOverbooking && totalAllocated > totalCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || !date || !venueName.trim() || !city.trim()) {
      setErrorMessage('Please fill in all mandatory fields (Title, Date, Venue Name, City).');
      return;
    }

    if (!posterMedia.url) {
      setErrorMessage('Please upload an Event Poster image directly using the file uploader.');
      return;
    }

    if (isOverAllocated) {
      setErrorMessage(
        `Total allocated capacity (${totalAllocated}) exceeds event total capacity (${totalCapacity}). Please adjust quantities or enable 'Allow Overbooking'.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Build ticket types payload for backend
      const formattedTicketTypes = (passMode === 'PAID' || passMode === 'BOTH')
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
      const formattedFreePassCategories = (passMode === 'FREE' || passMode === 'BOTH')
        ? freePasses.map((f, idx) => ({
            categoryId: `FPC-${idx + 1}-${Date.now().toString().slice(-4)}`,
            name: f.name.trim(),
            allocatedCapacity: Number(f.allocatedCapacity) || 50,
            maxPerPerson: Number(f.maxPerPerson) || 2,
            maxPerOrganisation: Number(f.maxPerOrganisation) || 5,
            approvalRequired: !!f.approvalRequired,
            emailDeliveryEnabled: true,
          }))
        : [];

      const payload = {
        title: title.trim(),
        description: description.trim() || `${title} live in ${city}. Hosted exclusively on CineVenue.`,
        category,
        eventType,
        passMode,
        poster: posterMedia,
        banner: bannerMedia.url ? bannerMedia : posterMedia,
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
        totalTicketCapacity: Number(totalCapacity) || 1000,
        maxTicketsPerBooking: Number(maxTicketsPerBooking) || 10,
        minTicketsPerBooking: Number(minTicketsPerBooking) || 1,
        allowOverbooking,
        bookingStartDate: bookingStartDate || null,
        bookingEndDate: bookingEndDate || null,
        ticketTypes: formattedTicketTypes,
        freePassCategories: formattedFreePassCategories,
        termsAndConditions: terms.split('\n').filter((t) => t.trim().length > 0),
      };

      // Authoritative API call to CineVenue backend MongoDB
      const res = await apiClient.post('/admin/events', payload);
      const createdEvent = res.data?.event;

      // Also sync to local cache for instant client consistency
      if (createdEvent) {
        saveEvent(createdEvent);
      }

      setSuccessMessage(
        `✅ Event "${title}" created successfully as ${status}! Synchronized with MongoDB and available across Website and Mobile App.`
      );

      setTimeout(() => {
        onCreated();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save event to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Create New Event
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Configure live ticketed, free RSVP, or hybrid multi-tier access passes. Stored directly in CineVenue MongoDB.
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
          {/* Left Column: Title, Category, Description */}
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
                placeholder="e.g. Kalki 2898 AD Pre-Release & Fan Gala"
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
                placeholder="Provide event details, star cast, highlights, rules, food info..."
              />
            </div>

            {/* Event Status & Booking Status Controls */}
            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/10 p-3 rounded-xl">
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Event Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="DRAFT">DRAFT (Hidden from Public)</option>
                  <option value="UPCOMING">UPCOMING (Appears in Upcoming)</option>
                  <option value="PUBLISHED">PUBLISHED (Live & Visible)</option>
                  <option value="ONGOING">ONGOING (Live Today)</option>
                  <option value="COMPLETED">COMPLETED (Past Event)</option>
                  <option value="CANCELLED">CANCELLED (Not Bookable)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Booking Gate Status</label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="OPEN">OPEN (Accepting Bookings)</option>
                  <option value="NOT_OPEN">NOT OPEN (Coming Soon)</option>
                  <option value="CLOSED">CLOSED (Booking Gate Halted)</option>
                  <option value="SOLD_OUT">SOLD OUT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Multipart File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader
              label="Event Poster"
              description="Portrait (3:4 ratio). Displayed on website cards & mobile app."
              uploadType="poster"
              value={posterMedia}
              onChange={setPosterMedia}
              aspectRatio="portrait"
            />

            <ImageUploader
              label="Event Banner"
              description="Landscape (16:9 ratio). Displayed on details page & hero."
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
                placeholder="e.g. Shilpakala Vedika"
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
              <label className="block text-[10px] text-white/50 uppercase font-mono mb-1">Venue Address</label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Full address, landmark, PIN"
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
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-gold"
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

        {/* SECTION 4: PASS CONFIGURATION (PAID PASSES) */}
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
                  className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-white/[0.03] p-3 rounded-xl border border-white/5"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-white/40 mb-1">Pass Name</label>
                    <input
                      type="text"
                      value={pass.name}
                      onChange={(e) => handlePaidPassChange(idx, 'name', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. VIP Front Circle"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Tier</label>
                    <select
                      value={pass.tier}
                      onChange={(e) => handlePaidPassChange(idx, 'tier', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="General">General</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                      <option value="VVIP">VVIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={pass.price}
                      onChange={(e) => handlePaidPassChange(idx, 'price', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                      min={0}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">Total Quantity</label>
                    <input
                      type="number"
                      value={pass.totalQuantity}
                      onChange={(e) => handlePaidPassChange(idx, 'totalQuantity', Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
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
                      title="Remove pass"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: FREE PASSES / COMPLIMENTARY PASS CONFIGURATION */}
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

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4 border-t border-white/10 gap-4 items-center">
          <p className="text-xs text-white/40">
            Authoritative creation: Saves directly into MongoDB and immediately reflects on website & mobile app.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold hover:bg-gold-light flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving Event to Database...' : 'Save & Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
