import React, { useState, useMemo } from "react";
import { 
  X, SlidersHorizontal, ChevronDown, ChevronUp, Check, RotateCcw, 
  Calendar, MapPin, DollarSign, Building2, Languages, Ticket, 
  TrendingUp, ArrowUpDown, Sparkles, Star, Search
} from "lucide-react";

export interface EventFiltersState {
  categories: string[];
  genres: string[];
  cities: string[];
  datePreset: 'ALL' | 'TODAY' | 'TOMORROW' | 'WEEKEND' | 'NEXT_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';
  customDateStart: string;
  customDateEnd: string;
  pricePreset: 'ALL' | 'FREE' | 'UNDER_500' | '500_1500' | '1500_3000' | 'ABOVE_3000' | 'CUSTOM';
  customPriceMin: number | null;
  customPriceMax: number | null;
  venueTypes: string[];
  languages: string[];
  ticketAvailability: string[];
  popularity: string[];
  sortBy: 'DATE_ASC' | 'DATE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC' | 'POPULARITY_DESC';
}

export const INITIAL_EVENT_FILTERS: EventFiltersState = {
  categories: [],
  genres: [],
  cities: [],
  datePreset: 'ALL',
  customDateStart: '',
  customDateEnd: '',
  pricePreset: 'ALL',
  customPriceMin: null,
  customPriceMax: null,
  venueTypes: [],
  languages: [],
  ticketAvailability: [],
  popularity: [],
  sortBy: 'DATE_ASC',
};

// Fixed option constants matching exact CineVenue branding
export const FILTER_CATEGORIES = [
  { id: "Concerts", label: "Concerts", icon: "⚡" },
  { id: "Stand-up Comedy", label: "Stand-up Comedy", icon: "🎤" },
  { id: "Film Events", label: "Film Galas", icon: "🎬" },
  { id: "Workshops", label: "Workshops", icon: "📚" },
  { id: "Cultural Events", label: "Cultural", icon: "🎻" },
  { id: "Sports Events", label: "Sports", icon: "🏸" },
];

export const FILTER_GENRES = [
  "EDM Arenas",
  "Standup Comedy",
  "Symphony Tours",
  "Sufi Nights",
  "Celebrity Shows",
];

export const FILTER_VENUE_TYPES = [
  { id: "STADIUM", label: "Stadium & Outdoor Arenas" },
  { id: "CONVENTION", label: "Convention Centers & Auditoriums" },
  { id: "CINEMA", label: "Luxury Cinema Screens" },
  { id: "AMPHITHEATRE", label: "Open Air & Amphitheaters" },
  { id: "CLUB", label: "Clubs & Lounge Venues" },
];

export const FILTER_LANGUAGES = [
  "Telugu",
  "Hindi",
  "English",
  "Tamil",
  "Multilingual",
];

export const FILTER_AVAILABILITY = [
  { id: "FREE_PASSES", label: "Free Passes Available" },
  { id: "PAID_PASSES", label: "Paid Passes Available" },
  { id: "FAST_FILLING", label: "Fast Filling / Limited Seats" },
  { id: "VIP_PASSES", label: "VIP Passes Available" },
  { id: "GA_PASSES", label: "General Admission Passes" },
];

export const FILTER_POPULARITY = [
  { id: "FEATURED", label: "Featured & Editor's Pick", icon: "⭐" },
  { id: "TOP_RATED", label: "Top Rated (4.5★+)", icon: "✨" },
  { id: "TRENDING", label: "Trending / High Demand", icon: "🔥" },
];

export const SORT_OPTIONS = [
  { id: "DATE_ASC", label: "Date: Soonest First" },
  { id: "DATE_DESC", label: "Date: Latest First" },
  { id: "PRICE_ASC", label: "Price: Low to High" },
  { id: "PRICE_DESC", label: "Price: High to Low" },
  { id: "RATING_DESC", label: "Highest Customer Rating" },
  { id: "POPULARITY_DESC", label: "Most Popular / Fast Filling" },
];

export function countActiveFilters(filters: EventFiltersState): number {
  let count = 0;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.genres.length > 0) count += filters.genres.length;
  if (filters.cities.length > 0) count += filters.cities.length;
  if (filters.datePreset !== 'ALL') count += 1;
  if (filters.pricePreset !== 'ALL') count += 1;
  if (filters.venueTypes.length > 0) count += filters.venueTypes.length;
  if (filters.languages.length > 0) count += filters.languages.length;
  if (filters.ticketAvailability.length > 0) count += filters.ticketAvailability.length;
  if (filters.popularity.length > 0) count += filters.popularity.length;
  if (filters.sortBy !== 'DATE_ASC') count += 1;
  return count;
}

interface EventFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: EventFiltersState;
  onApplyFilters: (newFilters: EventFiltersState) => void;
  availableCities: string[];
  totalMatchesCount: number;
}

export default function EventFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableCities = [],
  totalMatchesCount,
}: EventFilterDrawerProps) {
  // Local draft state allows canceling or resetting before applying
  const [draft, setDraft] = useState<EventFiltersState>(filters);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  // Expandable sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    genres: true,
    cities: false,
    date: false,
    price: false,
    venue: false,
    language: false,
    availability: false,
    popularity: false,
    sort: false,
  });

  // Keep draft in sync whenever the drawer opens with active filters
  React.useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleResetAll = () => {
    setDraft(INITIAL_EVENT_FILTERS);
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  // Helper toggle functions
  const toggleCategory = (catId: string) => {
    setDraft(prev => {
      const exists = prev.categories.includes(catId);
      return {
        ...prev,
        categories: exists ? prev.categories.filter(c => c !== catId) : [...prev.categories, catId]
      };
    });
  };

  const toggleGenre = (genre: string) => {
    setDraft(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const toggleCity = (city: string) => {
    setDraft(prev => {
      const exists = prev.cities.includes(city);
      return {
        ...prev,
        cities: exists ? prev.cities.filter(c => c !== city) : [...prev.cities, city]
      };
    });
  };

  const toggleVenueType = (vt: string) => {
    setDraft(prev => {
      const exists = prev.venueTypes.includes(vt);
      return {
        ...prev,
        venueTypes: exists ? prev.venueTypes.filter(v => v !== vt) : [...prev.venueTypes, vt]
      };
    });
  };

  const toggleLanguage = (lang: string) => {
    setDraft(prev => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang]
      };
    });
  };

  const toggleAvailability = (availId: string) => {
    setDraft(prev => {
      const exists = prev.ticketAvailability.includes(availId);
      return {
        ...prev,
        ticketAvailability: exists ? prev.ticketAvailability.filter(a => a !== availId) : [...prev.ticketAvailability, availId]
      };
    });
  };

  const togglePopularity = (popId: string) => {
    setDraft(prev => {
      const exists = prev.popularity.includes(popId);
      return {
        ...prev,
        popularity: exists ? prev.popularity.filter(p => p !== popId) : [...prev.popularity, popId]
      };
    });
  };

  // Filter available cities list based on search query
  const filteredCitiesList = useMemo(() => {
    const list = availableCities.length > 0 ? availableCities : [
      "Hyderabad", "Vijayawada", "Guntur", "Bengaluru", "Mumbai", "Delhi-NCR", "Chennai", "Visakhapatnam", "Tirupati"
    ];
    if (!citySearchQuery.trim()) return list;
    return list.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase().trim()));
  }, [availableCities, citySearchQuery]);

  const activeCount = countActiveFilters(draft);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl md:max-w-2xl bg-[#0C0D12] border-l border-white/10 text-white h-full flex flex-col shadow-2xl relative animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAWER HEADER */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#12131A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">Event Filters</h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-black font-mono">
                    {activeCount} ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50">Refine live concerts, galas, and VIP passes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              aria-label="Close filters drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DRAWER BODY: 10 EXPANDABLE SECTIONS */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 divide-y divide-white/5 custom-scrollbar">

          {/* 1. EVENT CATEGORIES */}
          <div className="pt-2 first:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>1. Event Categories</span>
                {draft.categories.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.categories.length} selected
                  </span>
                )}
              </div>
              {openSections.categories ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.categories && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, categories: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                      draft.categories.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>🎟️</span>
                    <span>All Events</span>
                  </button>
                  {FILTER_CATEGORIES.map(cat => {
                    const isSelected = draft.categories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. CURATED GENRES */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('genres')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>2. Curated Genres</span>
                {draft.genres.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.genres.length} selected
                  </span>
                )}
              </div>
              {openSections.genres ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.genres && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, genres: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.genres.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Genres
                  </button>
                  {FILTER_GENRES.map(genre => {
                    const isSelected = draft.genres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{genre}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. CITY AND LOCATION */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('cities')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>3. City & Location</span>
                {draft.cities.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.cities.length} selected
                  </span>
                )}
              </div>
              {openSections.cities ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.cities && (
              <div className="pt-3 pb-2 space-y-3 animate-fadeIn">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search city or location..."
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, cities: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.cities.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Cities
                  </button>
                  {filteredCitiesList.map(city => {
                    const isSelected = draft.cities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{city}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. EVENT DATE AND DATE RANGE */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('date')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>4. Event Date & Range</span>
                {draft.datePreset !== 'ALL' && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    Active
                  </span>
                )}
              </div>
              {openSections.date ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.date && (
              <div className="pt-3 pb-2 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'All Dates' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'TOMORROW', label: 'Tomorrow' },
                    { id: 'WEEKEND', label: 'This Weekend' },
                    { id: 'NEXT_7_DAYS', label: 'Next 7 Days' },
                    { id: 'THIS_MONTH', label: 'This Month' },
                  ].map(dp => (
                    <button
                      key={dp.id}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, datePreset: dp.id as any }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        draft.datePreset === dp.id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {dp.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Custom Date Range</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">From</label>
                      <input
                        type="date"
                        value={draft.customDateStart}
                        onChange={(e) => setDraft(prev => ({ ...prev, datePreset: 'CUSTOM', customDateStart: e.target.value }))}
                        className="w-full bg-[#161720] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">To</label>
                      <input
                        type="date"
                        value={draft.customDateEnd}
                        onChange={(e) => setDraft(prev => ({ ...prev, datePreset: 'CUSTOM', customDateEnd: e.target.value }))}
                        className="w-full bg-[#161720] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. TICKET PRICE AND PRICE RANGE */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                <span>5. Ticket Price & Range</span>
                {draft.pricePreset !== 'ALL' && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    Active
                  </span>
                )}
              </div>
              {openSections.price ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.price && (
              <div className="pt-3 pb-2 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'Any Price' },
                    { id: 'FREE', label: 'Free Passes Only' },
                    { id: 'UNDER_500', label: 'Under ₹500' },
                    { id: '500_1500', label: '₹500 - ₹1,500' },
                    { id: '1500_3000', label: '₹1,500 - ₹3,000' },
                    { id: 'ABOVE_3000', label: 'Above ₹3,000' },
                  ].map(pp => (
                    <button
                      key={pp.id}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, pricePreset: pp.id as any }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        draft.pricePreset === pp.id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {pp.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    Custom Price Range (₹)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Min Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        min={0}
                        value={draft.customPriceMin ?? ""}
                        onChange={(e) => setDraft(prev => ({
                          ...prev,
                          pricePreset: 'CUSTOM',
                          customPriceMin: e.target.value ? Number(e.target.value) : null
                        }))}
                        className="w-full bg-[#161720] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Max Price (₹)</label>
                      <input
                        type="number"
                        placeholder="10000+"
                        min={0}
                        value={draft.customPriceMax ?? ""}
                        onChange={(e) => setDraft(prev => ({
                          ...prev,
                          pricePreset: 'CUSTOM',
                          customPriceMax: e.target.value ? Number(e.target.value) : null
                        }))}
                        className="w-full bg-[#161720] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. VENUE TYPE */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('venue')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>6. Venue Type</span>
                {draft.venueTypes.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.venueTypes.length} selected
                  </span>
                )}
              </div>
              {openSections.venue ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.venue && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, venueTypes: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.venueTypes.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Venue Types
                  </button>
                  {FILTER_VENUE_TYPES.map(vt => {
                    const isSelected = draft.venueTypes.includes(vt.id);
                    return (
                      <button
                        key={vt.id}
                        type="button"
                        onClick={() => toggleVenueType(vt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{vt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 7. LANGUAGE */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('language')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 text-[#D4AF37]" />
                <span>7. Language</span>
                {draft.languages.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.languages.length} selected
                  </span>
                )}
              </div>
              {openSections.language ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.language && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, languages: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.languages.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Languages
                  </button>
                  {FILTER_LANGUAGES.map(lang => {
                    const isSelected = draft.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{lang}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 8. TICKET AVAILABILITY */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('availability')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>8. Ticket Availability</span>
                {draft.ticketAvailability.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.ticketAvailability.length} selected
                  </span>
                )}
              </div>
              {openSections.availability ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.availability && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, ticketAvailability: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.ticketAvailability.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Passes
                  </button>
                  {FILTER_AVAILABILITY.map(av => {
                    const isSelected = draft.ticketAvailability.includes(av.id);
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => toggleAvailability(av.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{av.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 9. EVENT POPULARITY */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection('popularity')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span>9. Event Popularity</span>
                {draft.popularity.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    {draft.popularity.length} selected
                  </span>
                )}
              </div>
              {openSections.popularity ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.popularity && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, popularity: [] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      draft.popularity.length === 0
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Events
                  </button>
                  {FILTER_POPULARITY.map(pop => {
                    const isSelected = draft.popularity.includes(pop.id);
                    return (
                      <button
                        key={pop.id}
                        type="button"
                        onClick={() => togglePopularity(pop.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{pop.icon}</span>
                        <span>{pop.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 10. SORT BY */}
          <div className="pt-4 pb-6">
            <button
              type="button"
              onClick={() => toggleSection('sort')}
              className="w-full py-3 flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ArrowUpDown className="w-4 h-4 text-[#D4AF37]" />
                <span>10. Sort By</span>
                {draft.sortBy !== 'DATE_ASC' && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    Customized
                  </span>
                )}
              </div>
              {openSections.sort ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {openSections.sort && (
              <div className="pt-3 pb-2 space-y-2 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, sortBy: opt.id as any }))}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between border ${
                        draft.sortBy === opt.id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {draft.sortBy === opt.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* DRAWER STICKY FOOTER */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#12131A] flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Filters ({totalMatchesCount} {totalMatchesCount === 1 ? 'Event' : 'Events'})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
