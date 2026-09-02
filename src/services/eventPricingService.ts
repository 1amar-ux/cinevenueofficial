export interface EventServiceItem {
  id: string;
  name: string;
  category: string;
  iconName: string;
  shortDesc: string;
  details: string;
  customNotes?: string;
  availableInventory?: number;
  isCustomAdded?: boolean;
}

export const DEFAULT_EVENT_SERVICES: EventServiceItem[] = [
  {
    id: "generators",
    name: "Generators & Power Backup",
    category: "Power & Utilities",
    iconName: "Zap",
    shortDesc: "Silent DG Synchronized Backup Sets (125kVA - 500kVA)",
    details: "Zero-fail acoustic diesel generator sets with automatic changeover switches, dual synchronization panels, and dedicated fuel management for seamless non-stop event power.",
    availableInventory: 14
  },
  {
    id: "photography",
    name: "Photography",
    category: "Media & Production",
    iconName: "Camera",
    shortDesc: "Prime Lens Stage, VIP Red Carpet & Candid",
    details: "Sony Alpha/FX3 full-frame master photographers, real-time wireless cloud image sync, instant red-carpet photo printing booth, and high-res magazine editorial retouching.",
    availableInventory: 20
  },
  {
    id: "videography",
    name: "Videography & Live Streaming",
    category: "Media & Production",
    iconName: "FilmIcon",
    shortDesc: "4K Multi-Cam Switcher, Jimmy Jib & Cinema Drones",
    details: "8-camera 4K live broadcast OB truck, 40ft motorized Jimmy Jib, licensed DJI cinema drone pilots, live YouTube/TV broadcast switching, and same-day teaser edit delivery.",
    availableInventory: 12
  },
  {
    id: "security",
    name: "Security & Crowd Control",
    category: "Hospitality & Safety",
    iconName: "ShieldCheck",
    shortDesc: "VIP Bodyguards, Bouncers & Mojo Barricades",
    details: "Ex-military trained executive protection officers, 100+ vetted bouncers, walk-through metal detectors, hand-held scanners, mojo barricades, and VIP convoy management.",
    availableInventory: 35
  },
  {
    id: "anchors",
    name: "Anchors & Event Hosts",
    category: "Artist & Host Talent",
    iconName: "Mic",
    shortDesc: "Top TV Emcees & Bilingual Event Hosts",
    details: "Engaging TV anchors, celebrity film audio launch hosts, bilingual crowd mobilizers, and protocol managers with flawless script delivery in English, Hindi, Telugu, and Tamil.",
    availableInventory: 18
  },
  {
    id: "led_walls",
    name: "LED Walls & Screens",
    category: "Visuals & Stage",
    iconName: "Video",
    shortDesc: "P2.5 / P3 4K HDR curved & flat mega screens",
    details: "High-brightness indoor & outdoor LED video walls with NovaStar 4K video processors, multi-screen matrix, pixel mapping, and custom 3D motion graphics support.",
    availableInventory: 15
  },
  {
    id: "sound",
    name: "Sound Systems",
    category: "Audio & Acoustics",
    iconName: "Music",
    shortDesc: "d&b audiotechnik & JBL VTX Line Arrays",
    details: "Concert-grade line-array sound systems, digital mixing consoles (Digico / Yamaha CL5), wireless Shure Axient mics, and pristine in-ear monitor setups for live bands.",
    availableInventory: 10
  },
  {
    id: "lighting",
    name: "Stage Lighting & FX",
    category: "Visuals & Stage",
    iconName: "Lightbulb",
    shortDesc: "Sharpy Beams, Washes, Strobes & Lasers",
    details: "Intelligent moving head lights, LED wash bars, blinder matrix, 30W RGB full-color laser projectors, haze machines, and grandMA3 light programming.",
    availableInventory: 16
  },
  {
    id: "stage_truss",
    name: "Stage & Truss Setup",
    category: "Visuals & Stage",
    iconName: "Layers",
    shortDesc: "Heavy-Duty Aluminum Box Truss & Riser Decks",
    details: "Engineered box trusses, goal posts, custom curved roof trusses, hydraulic lift stages, and carpeted modular performance platforms certified for heavy loads.",
    availableInventory: 8
  },
  {
    id: "decoration",
    name: "Thematic Decoration & Sets",
    category: "Design & Decor",
    iconName: "Sparkles",
    shortDesc: "Themed Stage Backdrops & VIP Lounge Styling",
    details: "Custom fabricated 3D stage sets, floral arches, entrance tunnels, ambient fairy light ceiling canopies, and luxury red-carpet step-and-repeat media walls.",
    availableInventory: 12
  },
  {
    id: "catering",
    name: "VIP & Public Catering",
    category: "Hospitality & Safety",
    iconName: "Utensils",
    shortDesc: "Multi-Cuisine VIP Banquets & Live Counters",
    details: "Five-star multi-cuisine catering, celebrity green-room snack platters, mocktail bars, live gourmet counters, and certified hygiene staff with buffet counters.",
    availableInventory: 5000
  },
  {
    id: "djs",
    name: "DJs & Electronic Music",
    category: "Artist & Host Talent",
    iconName: "Disc",
    shortDesc: "Top Bollywood & EDM Festival DJs",
    details: "Club-topping headline DJs with Pioneer CDJ-3000 setups, exclusive Bollywood/Tollywood festival bootlegs, and live percussive sync.",
    availableInventory: 15
  },
  {
    id: "artists",
    name: "Artists & Live Bands",
    category: "Artist & Host Talent",
    iconName: "UserCheck",
    shortDesc: "Playback Singers, Live Bands & Celebrity Dancers",
    details: "Direct booking for renowned film playback singers, 6-piece instrumental fusion bands, celebrity dance troupes, and standup comics with full travel hospitality.",
    availableInventory: 25
  }
];

const STORAGE_KEY = "cinevenue_event_custom_services";

export const getEventServices = (): EventServiceItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse custom event services from localStorage:", err);
  }
  return DEFAULT_EVENT_SERVICES;
};

export const saveEventServices = (services: EventServiceItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent("cinevenue-event-services-updated", { detail: services }));
  } catch (err) {
    console.error("Failed to save event services:", err);
  }
};

export const updateEventServicePrice = (
  serviceId: string, 
  updatedData: Partial<EventServiceItem>
): EventServiceItem[] => {
  const current = getEventServices();
  const index = current.findIndex(s => s.id === serviceId);
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedData };
  } else {
    // If updating by name fallback
    const byNameIdx = current.findIndex(s => s.name.toLowerCase() === serviceId.toLowerCase());
    if (byNameIdx !== -1) {
      current[byNameIdx] = { ...current[byNameIdx], ...updatedData };
    }
  }
  saveEventServices(current);
  return current;
};

export const addNewEventService = (newService: Omit<EventServiceItem, "id"> & { id?: string }): EventServiceItem[] => {
  const current = getEventServices();
  const id = newService.id || `custom-${Date.now()}`;
  const completeService: EventServiceItem = {
    ...newService,
    id,
    isCustomAdded: true
  };
  const updated = [completeService, ...current];
  saveEventServices(updated);
  return updated;
};

export const deleteEventService = (serviceId: string): EventServiceItem[] => {
  const current = getEventServices();
  const filtered = current.filter(s => s.id !== serviceId);
  saveEventServices(filtered);
  return filtered;
};

export const resetEventServicesToDefault = (): EventServiceItem[] => {
  saveEventServices(DEFAULT_EVENT_SERVICES);
  return DEFAULT_EVENT_SERVICES;
};
