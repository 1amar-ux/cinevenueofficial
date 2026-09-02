import React, { useState } from "react";
import { 
  Megaphone, Sparkles, Send, Eye, Share2, TrendingUp, BarChart2, 
  Video, Camera, Film, Tv, Globe, Radio, Layers, CheckCircle2, 
  ArrowRight, FileText, Calendar, X, Star, MessageSquare
} from "lucide-react";

import { PromotionCampaign } from "../../types/productions";

interface MediaPromotionsSectionProps {
  userEmail?: string | null;
  campaigns: PromotionCampaign[];
  onSubmitCampaign: (campaign: PromotionCampaign) => void;
}

export default function MediaPromotionsSection({
  userEmail,
  campaigns,
  onSubmitCampaign
}: MediaPromotionsSectionProps) {

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [form, setForm] = useState({
    name: "",
    promotedType: "Film" as PromotionCampaign["promotedType"],
    objective: "Ticket Sales" as PromotionCampaign["objective"],
    startDate: "",
    endDate: "",
    targetAudience: "Movie Buffs, Youth, Families",
    targetLocations: "Hyderabad, Bengaluru, Chennai",
    languages: ["Telugu", "Hindi"],
    budget: "₹10 Lakhs - ₹25 Lakhs",
    fullName: userEmail ? userEmail.split("@")[0] : "",
    phone: "",
    email: userEmail || "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: PromotionCampaign = {
      id: `MPRO-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name || "Untitled Promotional Campaign",
      promotedType: form.promotedType,
      objective: form.objective,
      startDate: form.startDate || new Date().toISOString().split("T")[0],
      endDate: form.endDate || "2026-11-30",
      targetAudience: form.targetAudience,
      targetLocations: form.targetLocations,
      languages: form.languages,
      budget: form.budget,
      status: "Client Review",
      manager: "Media Promotions Desk",
      description: form.description,
      deliverables: [
        { title: "Social Media Teaser Drops", required: 10, completed: 0, status: "Pending" },
        { title: "Press Release Coverage", required: 5, completed: 0, status: "Pending" }
      ],
      reachImpressions: 0,
      totalViews: 0,
      clicks: 0
    };

    onSubmitCampaign(newCamp);
    setIsCampaignModalOpen(false);
    showToast("📢 Promotion Campaign submitted to CineVenue Media Desk!");
  };

  const PROMO_SERVICES = [
    { icon: Film, title: "🎬 360° FILM PROMOTIONS", desc: "Pan-India promotional blitz for Feature & Short Films across YouTube, Reels, Billboard, and Multiplex trailers." },
    { icon: Megaphone, title: "📢 DIGITAL & SOCIAL BLITZ", desc: "Viral Instagram trend campaigns, meme-marketing, YouTube shorts, and Spotify audio ads." },
    { icon: Tv, title: "📺 IN-THEATRE MULTIPLEX ADS", desc: "Screening promotional teasers across CineVenue partner multiplex screens." },
    { icon: Globe, title: "📰 PRESS & MEDIA RELATIONS", desc: "National press meets, TV channel interviews, print coverage, and portal reviews." },
    { icon: Sparkles, title: "⭐ INFLUENCER MARKETING", desc: "Leverage 200+ A-list entertainment influencers and movie reviewers." },
    { icon: BarChart2, title: "📊 SMART ANALYTICS & TRACKING", desc: "Real-time impression tracking, ticket conversion links, and audience sentiment heatmaps." }
  ];

  return (
    <div id="media-promotions-subsite" className="min-h-screen bg-[#070709] text-white font-sans antialiased">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black via-[#0B0C10] to-[#070709] border-b border-white/10 text-center space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-gold/40 text-gold text-xs font-extrabold uppercase tracking-widest">
            <Megaphone className="w-4 h-4" /> CINEVENUE PRODUCTIONS • MEDIA & PROMOTIONS
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-white uppercase tracking-tight leading-tight">
            AMPLIFY YOUR STORY. <span className="bg-gradient-to-r from-amber-400 via-gold to-yellow-300 bg-clip-text text-transparent">MAXIMIZE AUDIENCE REACH.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans leading-relaxed">
            Data-driven promotional campaigns for feature films, short films, live events, brand activations, and casting calls.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-2xl shadow-gold/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Megaphone className="w-4.5 h-4.5 fill-current" />
              <span>START A PROMOTION CAMPAIGN</span>
            </button>
          </div>
        </div>
      </section>

      {/* Promotional Services */}
      <section className="py-20 px-6 bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase">
              OUR PROMOTIONAL SOLUTIONS
            </h2>
            <p className="text-xs text-white/60">
              End-to-end promotional strategy tailored for entertainment & cinema audiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROMO_SERVICES.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div key={idx} className="bg-[#12131A] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-white">{srv.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Campaigns Showcase */}
      <section className="py-20 px-6 bg-[#070709] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white uppercase">
                FEATURED PROMOTIONAL CAMPAIGNS
              </h2>
              <p className="text-xs text-white/60">Live campaigns currently powered by CineVenue Media Desk</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-[#12131A] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gold font-bold">{camp.id}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold uppercase text-[10px]">
                    {camp.status}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-white">{camp.name}</h3>
                <p className="text-xs text-white/70">{camp.description}</p>

                <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-white/10 text-center text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">Impressions</span>
                    <strong className="text-gold font-mono">{(camp.reachImpressions || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Video Views</span>
                    <strong className="text-amber-400 font-mono">{(camp.totalViews || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Ticket Conversions</span>
                    <strong className="text-emerald-400 font-mono">{(camp.ticketConversions || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-black p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-gold uppercase flex items-center gap-2">
                <Megaphone className="w-5 h-5" /> START A PROMOTION CAMPAIGN
              </h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-white/80 font-bold">Campaign Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Movie Pre-Release Digital Blitz"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">What Are You Promoting?</label>
                  <select 
                    value={form.promotedType}
                    onChange={e => setForm({...form, promotedType: e.target.value as any})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Film">Feature Film</option>
                    <option value="Short Film">Short Film</option>
                    <option value="Event">Live Event / Concert</option>
                    <option value="Brand">Brand Promotion</option>
                    <option value="Casting Call">Casting Call</option>
                    <option value="Artist">Artist / Talent Profile</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Primary Objective</label>
                  <select 
                    value={form.objective}
                    onChange={e => setForm({...form, objective: e.target.value as any})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Ticket Sales">Ticket Sales</option>
                    <option value="Awareness">Audience Awareness</option>
                    <option value="Event Registrations">Event Registrations</option>
                    <option value="Casting Applications">Casting Applications</option>
                    <option value="Website Traffic">Website Traffic</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/80 font-bold">Campaign Description & Target Audience</label>
                <textarea 
                  rows={3} 
                  placeholder="Describe your film/event and target locations..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-[#1A1C28] border border-white/15 rounded-xl p-3 text-white focus:border-gold outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase cursor-pointer">
                  SUBMIT CAMPAIGN BRIEF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
