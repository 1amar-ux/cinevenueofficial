import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Loader2,
  Compass,
  Sparkles,
  Building2,
  ChevronRight,
  Globe2,
  AlertCircle,
} from 'lucide-react';
import {
  POPULAR_CITIES,
  ALL_INDIAN_CITIES,
  ALIASES,
  CityInfo,
  findNearestCity,
  calculateDistance,
} from '../../lib/location';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities?: string[];
}

export default function LocationSelector({
  isOpen,
  onClose,
  selectedCity,
  setSelectedCity,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [detectedCityInfo, setDetectedCityInfo] = useState<string | null>(null);
  const [selectedLetterFilter, setSelectedLetterFilter] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setErrorMsg('');
      setSelectedLetterFilter(null);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (cityName: string) => {
    setSelectedCity(cityName);
    localStorage.setItem('cine_selected_city', cityName);
    onClose();
  };

  const handleDetectLocation = () => {
    setErrorMsg('');
    setDetectedCityInfo(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);
        const dist = Math.round(calculateDistance(latitude, longitude, nearest.lat, nearest.lng));

        setDetectedCityInfo(`Located near ${nearest.name} (~${dist} km away)`);
        setSelectedCity(nearest.name);
        localStorage.setItem('cine_selected_city', nearest.name);
        localStorage.setItem(
          'cinevenue_user_location',
          JSON.stringify({
            city: nearest.name,
            state: nearest.state,
            latitude,
            longitude,
            source: 'gps',
            updatedAt: new Date().toISOString(),
          })
        );

        setTimeout(() => {
          onClose();
        }, 600);
      },
      (error) => {
        setIsDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission was denied. Please select your city manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('GPS location information is currently unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location request timed out. Please try again or pick a city.');
            break;
          default:
            setErrorMsg('Unable to determine location. Please select manually.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filtered Cities Logic based on Search Query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    // Search in popular cities (name, state, localities)
    const matchedPopular = POPULAR_CITIES.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchState = c.state.toLowerCase().includes(q);
      const matchLocalities = c.localities.some((loc) => loc.toLowerCase().includes(q));
      const matchAlias = Object.entries(ALIASES).some(
        ([alias, real]) => real === c.name && alias.includes(q)
      );
      return matchName || matchState || matchLocalities || matchAlias;
    });

    // Search in extended alphabetical list
    const matchedAll = ALL_INDIAN_CITIES.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchState = c.state.toLowerCase().includes(q);
      return matchName || matchState;
    });

    // Merge uniquely by name
    const nameSet = new Set<string>();
    const combined: { name: string; state: string; isPopular?: boolean; localityHint?: string }[] = [];

    matchedPopular.forEach((p) => {
      nameSet.add(p.name);
      const matchedLoc = p.localities.find((loc) => loc.toLowerCase().includes(q));
      combined.push({
        name: p.name,
        state: p.state,
        isPopular: true,
        localityHint: matchedLoc ? `Area in ${matchedLoc}` : undefined,
      });
    });

    matchedAll.forEach((a) => {
      if (!nameSet.has(a.name)) {
        nameSet.add(a.name);
        combined.push({ name: a.name, state: a.state });
      }
    });

    return combined;
  }, [searchQuery]);

  // Alphabetical Grouping for "All Cities"
  const alphabetGroups = useMemo(() => {
    const groups: Record<string, typeof ALL_INDIAN_CITIES> = {};
    ALL_INDIAN_CITIES.forEach((city) => {
      const firstLetter = city.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(city);
    });
    return groups;
  }, []);

  const availableLetters = useMemo(() => Object.keys(alphabetGroups).sort(), [alphabetGroups]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      {/* Dimmed backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Location Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0D0E13] border border-white/10 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg shadow-gold/5">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Select Your City
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10 font-normal">
                  India
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                Personalize movies, showtimes, multiplexes, and exclusive events for your location
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & GPS Bar */}
        <div className="p-6 border-b border-white/5 bg-[#121319] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold/70" />
              <input
                type="text"
                autoFocus
                placeholder="Search city, area or locality (e.g. Hyderabad, Bandra, Koramangala)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-gold/70 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-white/35 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-0 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Use Current Location Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-gold/20 cursor-pointer shrink-0 border-0"
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Navigation className="w-4 h-4 text-black fill-black" />
              )}
              <span>{isDetecting ? 'Detecting GPS...' : 'Use Current Location'}</span>
            </button>
          </div>

          {/* Feedback & Error Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {detectedCityInfo && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span>{detectedCityInfo} — Selected!</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
          {/* SEARCH RESULTS VIEW */}
          {searchResults !== null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold">
                  Search Results ({searchResults.length})
                </h3>
                <span className="text-[11px] text-text-muted">
                  Matching "{searchQuery}"
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-text-muted space-y-2">
                  <MapPin className="w-8 h-8 text-white/20 mx-auto" />
                  <p className="text-sm font-semibold text-white">No Cities or Areas Found</p>
                  <p className="text-xs">
                    Try searching for the main district, state, or pick from our Popular Cities below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelect(city.name)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        selectedCity.toLowerCase() === city.name.toLowerCase()
                          ? 'bg-gold/15 border-gold text-gold shadow-lg shadow-gold/5'
                          : 'bg-white/[0.03] border-white/5 text-white hover:bg-white/[0.07] hover:border-white/20'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-sm block truncate text-white">
                          {city.name}
                        </span>
                        <span className="text-[11px] text-text-muted block truncate">
                          {city.localityHint ? city.localityHint : city.state}
                        </span>
                      </div>
                      {selectedCity.toLowerCase() === city.name.toLowerCase() ? (
                        <Check className="w-4 h-4 text-gold shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* POPULAR CITIES VISUAL GRID */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Popular Entertainment Hubs
                    </h3>
                  </div>
                  <button
                    onClick={() => handleSelect('All Cities')}
                    className={`text-xs px-3 py-1 rounded-xl transition-all border cursor-pointer ${
                      selectedCity === 'All Cities'
                        ? 'bg-gold/20 text-gold border-gold font-bold'
                        : 'bg-white/5 text-text-muted hover:text-white border-white/10'
                    }`}
                  >
                    View All Nationwide
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {POPULAR_CITIES.map((city) => {
                    const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

                    return (
                      <button
                        key={city.name}
                        onClick={() => handleSelect(city.name)}
                        className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border-gold text-gold shadow-xl shadow-gold/10 scale-[1.02]'
                            : 'bg-gradient-to-br from-white/[0.04] to-transparent border-white/10 text-white hover:border-gold/50 hover:bg-white/[0.07] hover:scale-[1.01]'
                        }`}
                      >
                        {/* City Icon & Active Status */}
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-gold text-black font-bold'
                                : 'bg-white/5 text-gold group-hover:bg-gold/20'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-gold text-black flex items-center justify-center shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* City Label & Landmark info */}
                        <div className="space-y-0.5 z-10">
                          <span
                            className={`font-bold text-sm block truncate tracking-wide ${
                              isSelected ? 'text-gold' : 'text-white group-hover:text-gold'
                            }`}
                          >
                            {city.name}
                          </span>
                          <span className="text-[10px] text-text-muted block truncate">
                            {city.state}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ALL CITIES ALPHABETICAL CATEGORIZED LIST */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-gold" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      All Cities A–Z ({ALL_INDIAN_CITIES.length})
                    </h3>
                  </div>

                  {/* Letter Jump Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
                    <button
                      onClick={() => setSelectedLetterFilter(null)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer border-0 ${
                        selectedLetterFilter === null
                          ? 'bg-gold text-black'
                          : 'bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {availableLetters.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetterFilter(letter)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold uppercase transition-all cursor-pointer border-0 shrink-0 ${
                          selectedLetterFilter === letter
                            ? 'bg-gold text-black'
                            : 'bg-white/5 text-text-muted hover:text-white'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorized Letters List */}
                <div className="space-y-6">
                  {availableLetters
                    .filter(
                      (letter) =>
                        selectedLetterFilter === null || selectedLetterFilter === letter
                    )
                    .map((letter) => (
                      <div key={letter} className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 text-gold font-bold text-xs flex items-center justify-center font-mono">
                            {letter}
                          </span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {alphabetGroups[letter].map((city) => {
                            const isSelected =
                              selectedCity.toLowerCase() === city.name.toLowerCase();

                            return (
                              <button
                                key={city.name}
                                onClick={() => handleSelect(city.name)}
                                className={`text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                                  isSelected
                                    ? 'bg-gold/15 text-gold border-gold/50 font-bold'
                                    : 'bg-white/[0.02] text-text-secondary hover:text-white hover:bg-white/[0.06] border-transparent'
                                }`}
                              >
                                <span className="truncate pr-1">{city.name}</span>
                                {isSelected && <Check className="w-3 h-3 text-gold shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span>Currently Viewing: <strong className="text-white font-medium">{selectedCity}</strong></span>
          </div>
          <span className="text-[11px] text-white/40">
            Clicking any city instantly syncs theatres, shows, and events.
          </span>
        </div>
      </div>
    </div>
  );
}
