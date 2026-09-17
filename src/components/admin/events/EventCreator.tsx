import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { saveEvent } from '../../../services/eventBookingService';
import type { EventItem, EventType, EventCategoryType, EventTicketType } from '../../../types/eventBooking';

interface PassRow {
  name: string;
  tier: 'General' | 'Premium' | 'VIP' | 'VVIP';
  price: number;
  quantity: number;
  isFree?: boolean;
}

export default function EventCreator({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategoryType>('Concerts');
  const [eventType, setEventType] = useState<EventType>('PAID');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:30');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [totalCapacity, setTotalCapacity] = useState(1000);
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [seatingType, setSeatingType] = useState<'GeneralAdmission' | 'AssignedSeating'>('GeneralAdmission');

  const [passCategories, setPassCategories] = useState<PassRow[]>([
    { name: 'General Admission', tier: 'General', price: 499, quantity: 800, isFree: false },
    { name: 'VIP Front Tier', tier: 'VIP', price: 1499, quantity: 200, isFree: false }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When eventType changes to FREE, update all pass prices to 0
  const handleEventTypeChange = (type: EventType) => {
    setEventType(type);
    if (type === 'FREE') {
      setPassCategories(prev => prev.map(p => ({ ...p, price: 0, isFree: true })));
    } else if (type === 'PAID') {
      setPassCategories(prev => prev.map(p => ({ ...p, price: p.price === 0 ? 499 : p.price, isFree: false })));
    }
  };

  const handleAddPass = () => {
    setPassCategories([
      ...passCategories,
      {
        name: eventType === 'FREE' ? 'Community Pass' : 'New Tier',
        tier: 'General',
        price: eventType === 'FREE' ? 0 : 799,
        quantity: 100,
        isFree: eventType === 'FREE'
      }
    ]);
  };

  const handleRemovePass = (index: number) => {
    if (passCategories.length <= 1) {
      alert('Event must have at least one ticket pass category.');
      return;
    }
    setPassCategories(passCategories.filter((_, idx) => idx !== index));
  };

  const handlePassChange = (index: number, field: keyof PassRow, val: any) => {
    setPassCategories(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      if (field === 'price') {
        copy[index].isFree = Number(val) === 0;
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || !date || !venueName.trim() || !city.trim()) {
      setErrorMessage('Please fill in all mandatory fields (Title, Date, Venue, City).');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventId = `EVT-${Date.now().toString().slice(-4)}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const ticketTypes: EventTicketType[] = passCategories.map((p, idx) => ({
        id: `TKT-${eventId}-${idx + 1}`,
        eventId,
        name: p.name.trim() || `Tier ${idx + 1}`,
        tier: p.tier,
        description: p.isFree || p.price === 0 ? 'Complimentary RSVP admission ticket.' : `${p.tier} official access pass.`,
        price: p.isFree ? 0 : Number(p.price) || 0,
        availableQuantity: Number(p.quantity) || 100,
        soldQuantity: 0,
        maxPerUser: p.isFree ? 2 : 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: !p.isFree && p.price > 0,
        isFree: p.isFree || Number(p.price) === 0
      }));

      const newEvent: EventItem = {
        id: eventId,
        title: title.trim(),
        slug,
        description: description.trim() || `${title} live in ${city}. Hosted exclusively on CineVenue.`,
        category,
        eventType,
        bannerUrl: bannerUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
        organizer: {
          id: 'ORG-CINEVENUE',
          name: 'CineVenue Official Events',
          email: 'events@cinevenue.in',
          phone: '+91 99999 00000',
          companyName: 'CineVenue Entertainment Pvt Ltd',
          isVerified: true,
          rating: 5.0,
          eventsCount: 12
        },
        date,
        startTime: startTime.length === 5 ? `${startTime} hrs` : startTime,
        endTime: endTime.length === 5 ? `${endTime} hrs` : endTime,
        duration: '3 hours',
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim() || `${venueName}, ${city}`,
        city: city.trim(),
        language: 'Multilingual',
        ageRestriction: 'All Ages',
        termsAndConditions: [
          'Please present official digital pass with valid photo ID at venue gates.',
          'Entry passes are subject to venue rules and security checks.',
          'Outside food and prohibited substances are strictly disallowed.'
        ],
        cancellationPolicy: eventType === 'FREE' ? 'Free RSVP cancellations accepted anytime.' : 'Refundable up to 24 hours prior to event.',
        seatingType,
        totalCapacity: Number(totalCapacity) || 1000,
        soldCount: 0,
        status: 'Published',
        isFeatured: true,
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ticketTypes
      };

      saveEvent(newEvent);
      setSuccessMessage(`✅ Event "${title}" published successfully! Synchronized across Web, Android, and iOS.`);
      
      setTimeout(() => {
        onCreated();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setErrorMessage(err.message || 'Failed to create and save event. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Create & Publish Event
          </h3>
          <p className="text-xs text-white/50 mt-0.5">Configure live ticketed, free RSVP, or hybrid multi-tier access passes.</p>
        </div>
        <div className="flex gap-2">
          {(['PAID', 'FREE', 'HYBRID'] as EventType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleEventTypeChange(t)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                eventType === t
                  ? t === 'FREE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : t === 'HYBRID'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                    : 'bg-gold/20 text-gold border border-gold/40 shadow-sm'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              {t} Event
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                placeholder="e.g. Kalki 2898 AD Fan Gala & Screening"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategoryType)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                >
                  <option value="Concerts">Concerts</option>
                  <option value="Film Events">Film Events</option>
                  <option value="Cultural Events">Cultural Events</option>
                  <option value="Stand-up Comedy">Stand-up Comedy</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Sports Events">Sports Events</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Seating Mode</label>
                <select
                  value={seatingType}
                  onChange={(e) => setSeatingType(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                >
                  <option value="GeneralAdmission">General Admission</option>
                  <option value="AssignedSeating">Assigned Row Seating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Venue Name *</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                placeholder="e.g. Shilpakala Vedika Auditorium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                  placeholder="e.g. Hyderabad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Total Capacity</label>
                <input
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                  required
                  min={1}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none resize-none"
                placeholder="Describe the experience, performers, special attractions, dress code..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Banner Image URL</label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            {/* PASS CATEGORIES CONFIGURATION */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  Admission Passes ({eventType})
                </h4>
                <button
                  type="button"
                  onClick={handleAddPass}
                  className="text-gold text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tier
                </button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {passCategories.map((pass, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white/[0.03] p-2 rounded-lg border border-white/5">
                    <input
                      type="text"
                      placeholder="Pass Name"
                      value={pass.name}
                      onChange={(e) => handlePassChange(idx, 'name', e.target.value)}
                      className="w-2/5 bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                    <select
                      value={pass.tier}
                      onChange={(e) => handlePassChange(idx, 'tier', e.target.value)}
                      className="w-1/4 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="General">General</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                      <option value="VVIP">VVIP</option>
                    </select>
                    <div className="relative w-1/4">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40">₹</span>
                      <input
                        type="number"
                        placeholder="Price"
                        disabled={eventType === 'FREE'}
                        value={eventType === 'FREE' ? 0 : pass.price}
                        onChange={(e) => handlePassChange(idx, 'price', Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded pl-5 pr-2 py-1.5 text-xs text-white disabled:opacity-50"
                        min={0}
                        required
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={pass.quantity}
                      onChange={(e) => handlePassChange(idx, 'quantity', Number(e.target.value))}
                      className="w-1/5 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                      min={1}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePass(idx)}
                      className="p-1 text-white/30 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Remove tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold hover:bg-gold-light flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Publishing Event...' : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
