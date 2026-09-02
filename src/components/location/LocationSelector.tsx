import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Check, Loader2 } from 'lucide-react';
import { UserLocation } from '../../types';
import { CITIES_DATA, ALIASES, findNearestCity } from '../../lib/location';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: string[];
}

export default function LocationSelector({
  isOpen,
  onClose,
  selectedCity,
  setSelectedCity,
  cities
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const popularCities = cities.filter(c => c !== "All Cities");
  const filteredCities = popularCities.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.entries(ALIASES).some(([alias, real]) => 
      real === c && alias.includes(searchQuery.toLowerCase())
    )
  );

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    onClose();
  };

  const handleDetectLocation = () => {
    setErrorMsg("");
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);
        setSelectedCity(nearest);
        onClose();
      },
      (error) => {
        setIsDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location permission was denied. Please select your city manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMsg("The request to get user location timed out.");
            break;
          default:
            setErrorMsg("An unknown error occurred.");
            break;
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0D0E13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Where are you?</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              placeholder="Search city, area or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1B23] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 outline-none focus:border-gold transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="text-sm text-rose-400 bg-rose-400/10 p-3 rounded-xl border border-rose-500/20 text-center">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-colors font-semibold"
          >
            {isDetecting ? (
              <Loader2 className="w-5 h-5 text-gold animate-spin" />
            ) : (
              <MapPin className="w-5 h-5 text-gold" />
            )}
            {isDetecting ? "Detecting Location..." : "Detect My Location"}
          </button>
          
          {!searchQuery && (
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10"></div>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em]">OR</div>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              {searchQuery ? "Search Results" : "Popular Cities"}
            </h3>
            
            {filteredCities.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                No cities found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredCities.map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selectedCity === city
                        ? "bg-gold/10 border-gold text-gold"
                        : "bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="font-medium truncate">{city}</span>
                    {selectedCity === city && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
