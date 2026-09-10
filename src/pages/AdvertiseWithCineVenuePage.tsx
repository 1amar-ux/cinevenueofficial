import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Eye, MousePointer, Users, Globe, Star,
  CheckCircle, ArrowRight, ChevronDown, ChevronUp,
  Send, Phone, Mail, Building, Calendar, DollarSign,
  Layers, Zap, Shield, Film, Ticket, Music, Target,
} from 'lucide-react';
import CineVenueLogo from '../components/CineVenueLogo';
import { DEFAULT_PLACEMENTS, submitInquiry } from '../services/advertisingService';
import type { AdPlacementId } from '../types/advertising';
import LiveBannerBookingWizard from '../components/advertising/LiveBannerBookingWizard';
import { Sparkles } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────
const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Why CineVenue Data ──────────────────────────────────────
const WHY_CARDS = [
  { icon: Users, title: 'Premium Audience', desc: 'Reach 500,000+ active entertainment enthusiasts — moviegoers, event-goers, and film industry professionals.', color: 'text-blue-400' },
  { icon: Target, title: 'Intent-Driven Users', desc: 'Our audience is in the mood to spend. They are actively booking tickets and exploring events.', color: 'text-emerald-400' },
  { icon: Globe, title: 'Pan-India Reach', desc: 'CineVenue serves users across 50+ Indian cities with localized content and city-specific targeting.', color: 'text-purple-400' },
  { icon: Film, title: 'Entertainment Context', desc: 'Place your brand alongside blockbuster movies, sold-out concerts, and film production content.', color: 'text-rose-400' },
  { icon: BarChart2, title: 'Real-Time Analytics', desc: 'Monitor impressions, clicks, and CTR in real-time through our advertiser-facing dashboard.', color: 'text-gold' },
  { icon: Shield, title: 'Brand-Safe Environment', desc: 'All campaigns are reviewed by our team. We ensure brand safety and policy compliance.', color: 'text-cyan-400' },
];

// ─── FAQ Data ────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What types of advertising does CineVenue offer?',
    a: 'CineVenue offers two types: (1) Direct advertising — campaigns sold and managed by our team with dedicated placements, analytics, and account support; and (2) Third-party network advertising via Google AdSense and similar platforms in select placements.',
  },
  {
    q: 'What is the minimum budget for a direct campaign?',
    a: 'Our minimum direct campaign budget starts at ₹5,000. Campaigns are priced based on placement, duration, and audience targeting. Please fill the inquiry form and our team will prepare a customised proposal.',
  },
  {
    q: 'How does the campaign approval process work?',
    a: 'After submitting your inquiry, our advertising team will contact you within 2 business days. Once we agree on placements and pricing, you\'ll receive a formal proposal. Payment must be verified before the campaign goes live.',
  },
  {
    q: 'Can I target specific cities or audience segments?',
    a: 'Yes. We offer city-based targeting across 50+ Indian cities. Audience segment targeting (e.g. film production professionals, event-goers, movie ticket buyers) is available for select placements.',
  },
  {
    q: 'How are impressions and clicks counted?',
    a: 'Impressions are counted each time an ad unit is rendered visible to a user. Clicks are counted when a user clicks the ad. CineVenue does not artificially inflate these numbers — all analytics reflect genuine user interactions.',
  },
  {
    q: 'Do you accept advertising for any product or service?',
    a: 'We review all campaigns before approval. We do not accept ads for gambling, illegal products, adult content, or anything violating our Advertising Policy or applicable Indian law.',
  },
];

// ─── Inquiry Form ────────────────────────────────────────────
function InquiryForm() {
  const [form, setForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    companyWebsite: '',
    campaignObjective: '',
    targetAudience: '',
    budgetRangeINR: '',
    preferredDuration: '',
    preferredStartDate: '',
    additionalMessage: '',
    preferredPlacements: [] as AdPlacementId[],
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const togglePlacement = (id: AdPlacementId) => {
    setForm(f => ({
      ...f,
      preferredPlacements: f.preferredPlacements.includes(id)
        ? f.preferredPlacements.filter(p => p !== id)
        : [...f.preferredPlacements, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.contactName || !form.contactEmail || !form.companyName || !form.campaignObjective) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.preferredPlacements.length === 0) {
      setError('Please select at least one preferred ad placement.'); return;
    }
    setSubmitting(true);
    try {
      submitInquiry(form);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-text-primary">Inquiry Submitted!</h3>
        <p className="text-text-secondary max-w-md mx-auto text-sm">
          Thank you, <strong className="text-text-primary">{form.contactName}</strong>. Our advertising team will review your inquiry and get back to you at <strong className="text-text-primary">{form.contactEmail}</strong> within 2 business days.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ contactName: '', contactEmail: '', contactPhone: '', companyName: '', companyWebsite: '', campaignObjective: '', targetAudience: '', budgetRangeINR: '', preferredDuration: '', preferredStartDate: '', additionalMessage: '', preferredPlacements: [] }); }}
          className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-text-primary text-sm font-semibold rounded-xl cursor-pointer transition-all border border-white/10"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Contact Info */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-black flex items-center justify-center">1</span>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Your Name *', key: 'contactName', placeholder: 'Full name', type: 'text' },
            { label: 'Email Address *', key: 'contactEmail', placeholder: 'email@company.com', type: 'email' },
            { label: 'Phone Number', key: 'contactPhone', placeholder: '+91 9900000000', type: 'tel' },
            { label: 'Company / Brand Name *', key: 'companyName', placeholder: 'Your company or brand', type: 'text' },
            { label: 'Company Website', key: 'companyWebsite', placeholder: 'https://www.yourwebsite.com', type: 'url' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required={label.endsWith('*')}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Placements */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-black flex items-center justify-center">2</span>
          Preferred Ad Placements *
        </h3>
        <p className="text-xs text-text-muted mb-3">Select all placements you are interested in.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_PLACEMENTS.filter(p => p.isActive).map(placement => {
            const selected = form.preferredPlacements.includes(placement.id);
            return (
              <button
                key={placement.id}
                type="button"
                onClick={() => togglePlacement(placement.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selected
                    ? 'bg-gold/10 border-gold/40 text-gold'
                    : 'bg-white/[0.02] border-white/[0.07] text-text-secondary hover:bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{placement.name}</span>
                  {selected && <CheckCircle className="w-3.5 h-3.5 text-gold" />}
                </div>
                <div className="text-[10px] opacity-70">{placement.location} · from {formatINR(placement.pricePerDay)}/day</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign Details */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-black flex items-center justify-center">3</span>
          Campaign Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase">Campaign Objective *</label>
            <select
              value={form.campaignObjective}
              onChange={e => setForm(f => ({ ...f, campaignObjective: e.target.value }))}
              required
              className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Select objective</option>
              <option value="Brand Awareness">Brand Awareness</option>
              <option value="Drive Ticket Sales">Drive Ticket Sales</option>
              <option value="Event Promotion">Event Promotion</option>
              <option value="Film / OTT Promotion">Film / OTT Promotion</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Lead Generation">Lead Generation</option>
              <option value="App Installs">App Installs</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase">Target Audience</label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
              placeholder="e.g. Young adults 18-35, movie fans in Mumbai"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase">Budget Range (INR)</label>
            <select
              value={form.budgetRangeINR}
              onChange={e => setForm(f => ({ ...f, budgetRangeINR: e.target.value }))}
              className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Select budget range</option>
              <option value="₹5,000 – ₹15,000">₹5,000 – ₹15,000</option>
              <option value="₹15,000 – ₹50,000">₹15,000 – ₹50,000</option>
              <option value="₹50,000 – ₹1,50,000">₹50,000 – ₹1,50,000</option>
              <option value="₹1,50,000 – ₹5,00,000">₹1,50,000 – ₹5,00,000</option>
              <option value="₹5,00,000+">₹5,00,000+</option>
              <option value="Open to Discussion">Open to Discussion</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase">Preferred Duration</label>
            <select
              value={form.preferredDuration}
              onChange={e => setForm(f => ({ ...f, preferredDuration: e.target.value }))}
              className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Select duration</option>
              <option value="1 Week">1 Week</option>
              <option value="2 Weeks">2 Weeks</option>
              <option value="1 Month">1 Month</option>
              <option value="2 Months">2 Months</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="Custom">Custom / Discuss</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase">Preferred Start Date</label>
            <input
              type="date"
              value={form.preferredStartDate}
              onChange={e => setForm(f => ({ ...f, preferredStartDate: e.target.value }))}
              className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold font-mono transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <label className="text-[11px] font-bold text-text-muted uppercase">Additional Information</label>
          <textarea
            value={form.additionalMessage}
            onChange={e => setForm(f => ({ ...f, additionalMessage: e.target.value }))}
            placeholder="Tell us more about your campaign, creative assets, specific requirements, or any questions you have..."
            rows={4}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted transition-colors resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-gold to-amber-400 hover:from-amber-400 hover:to-gold text-black font-bold text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-xl shadow-gold/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Advertising Inquiry
            </>
          )}
        </button>
        <p className="text-[11px] text-text-muted text-center">
          By submitting this form, you agree to CineVenue's{' '}
          <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          We never sell your contact information.
        </p>
      </div>
    </form>
  );
}

// ─── FAQ Item ────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-text-primary">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-white/[0.05] pt-3 animate-in fade-in duration-200">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function AdvertiseWithCineVenuePage() {
  const [activeTab, setActiveTab] = useState<'24h-banner' | 'inquiry'>('24h-banner');

  return (
    <div className="min-h-screen bg-[#070709] text-text-primary font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#070709]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 py-3.5 flex items-center justify-between">
        <CineVenueLogo size="md" onClick={() => window.location.href = '/'} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/advertising/my-campaigns'}
            className="px-3.5 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-semibold rounded-lg border border-gold/30 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>My Campaigns</span>
          </button>
          <a href="mailto:advertise@cinevenue.in" className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">advertise@cinevenue.in</span>
          </a>
          <button
            onClick={() => window.location.href = '/'}
            className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-text-secondary text-xs font-semibold rounded-lg border border-white/10 cursor-pointer transition-all"
          >
            ← Back to CineVenue
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 md:px-8 py-20 md:py-28 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            Advertising & Partnerships
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-5">
            Reach India's Most
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
              Passionate Audience
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Advertise on CineVenue — India's premier entertainment platform. Connect your brand with millions of moviegoers, event enthusiasts, and film industry professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#inquiry-form"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-gold to-amber-400 hover:from-amber-400 hover:to-gold text-black font-bold text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-xl shadow-gold/30"
            >
              <Send className="w-4 h-4" />
              Start Your Campaign
            </a>
            <a
              href="mailto:advertise@cinevenue.in"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] text-text-primary font-bold text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-white/10"
            >
              <Mail className="w-4 h-4" />
              Email Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Monthly Active Users', value: '500K+', color: 'text-blue-400' },
            { icon: Ticket, label: 'Tickets Booked', value: '1.2M+', color: 'text-emerald-400' },
            { icon: Globe, label: 'Cities Covered', value: '50+', color: 'text-purple-400' },
            { icon: Star, label: 'Average Session', value: '8 Min', color: 'text-gold' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <div className={`text-2xl font-black ${color} font-mono`}>{value}</div>
              <div className="text-[11px] text-text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Advertise */}
      <section className="px-4 md:px-8 py-16 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Why Advertise on CineVenue?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">We don't just sell ad space — we connect your brand with people who love entertainment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_CARDS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/20 transition-colors">
                <Icon className={`w-5 h-5 ${color} mb-3`} />
                <h3 className="text-sm font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Placements / Rate Card */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Available Ad Placements</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Choose from premium placements across the CineVenue platform. All prices are indicative — contact us for custom rates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_PLACEMENTS.filter(p => p.isActive).map(placement => (
              <div key={placement.id} className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-gold/20 transition-colors group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-gold transition-colors">{placement.name}</h3>
                    <p className="text-[11px] text-text-muted mt-1">{placement.location} · {placement.dimensions}</p>
                  </div>
                  {placement.supportsThirdParty && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded shrink-0">3rd Party</span>
                  )}
                </div>
                <p className="text-[12px] text-text-muted mb-4 leading-relaxed">{placement.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {[
                    { label: 'Per Day', val: formatINR(placement.pricePerDay) },
                    { label: 'Per Week', val: formatINR(placement.pricePerWeek) },
                    { label: 'Per Month', val: formatINR(placement.pricePerMonth) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
                      <div className="text-text-muted font-bold uppercase text-[8px] mb-0.5">{label}</div>
                      <div className="text-gold font-mono font-bold text-xs">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-text-muted mt-6">
            Prices are indicative base rates (INR, incl. GST). Final pricing depends on placement, campaign duration, and targeting options.
            <br />Contact us for volume discounts and custom packages.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="px-4 md:px-8 py-16 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit Inquiry', desc: 'Fill out the form below with your campaign requirements and budget.', icon: Send },
              { step: '02', title: 'Team Review', desc: 'Our advertising team reviews your inquiry within 2 business days.', icon: Eye },
              { step: '03', title: 'Proposal & Payment', desc: 'We send a formal proposal. On payment verification, your campaign is approved.', icon: DollarSign },
              { step: '04', title: 'Campaign Goes Live', desc: 'Your ad appears on CineVenue. Monitor real-time analytics.', icon: Zap },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-3/4 w-1/2 h-px bg-gradient-to-r from-gold/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">Step {step}</div>
                <h3 className="text-sm font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advertising Action Module */}
      <section id="inquiry-form" className="px-4 md:px-8 py-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-white">Start Your Advertising Campaign</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">
              Choose between instant 24-Hour Live Banners or request a bespoke multi-week campaign proposal.
            </p>

            <div className="inline-flex p-1.5 bg-[#0F0F14] border border-white/10 rounded-2xl gap-2 shadow-2xl mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('24h-banner')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === '24h-banner'
                    ? 'bg-gold text-black shadow-lg shadow-gold/20 font-black'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-inherit" />
                <span>24-Hour Live Banner (Instant Booking)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'inquiry'
                    ? 'bg-gold text-black shadow-lg shadow-gold/20 font-black'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Send className="w-4 h-4 text-inherit" />
                <span>Bespoke Proposal Inquiry</span>
              </button>
            </div>
          </div>

          {activeTab === '24h-banner' ? (
            <LiveBannerBookingWizard />
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0F0F11] border border-white/[0.08] rounded-2xl p-6 md:p-8">
                <InquiryForm />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-8 py-16 bg-white/[0.01] border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-gold/10 to-amber-500/5 border border-gold/20 rounded-2xl p-10">
          <Zap className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">Ready to Get Started?</h2>
          <p className="text-text-secondary mb-6 text-sm">
            Have questions? Our advertising team is happy to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:advertise@cinevenue.in"
              className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-amber-400 text-black font-bold text-sm rounded-xl cursor-pointer transition-all">
              <Mail className="w-4 h-4" />
              advertise@cinevenue.in
            </a>
            <a href="#inquiry-form"
              className="flex items-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.09] text-text-primary font-bold text-sm rounded-xl cursor-pointer transition-all border border-white/10">
              <ArrowRight className="w-4 h-4" />
              Fill Out Inquiry Form
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
        <CineVenueLogo size="sm" onClick={() => window.location.href = '/'} />
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
          <a href="mailto:advertise@cinevenue.in" className="hover:text-text-primary transition-colors">advertise@cinevenue.in</a>
        </div>
        <span>© {new Date().getFullYear()} CineVenue Entertainment Pvt Ltd</span>
      </footer>
    </div>
  );
}
