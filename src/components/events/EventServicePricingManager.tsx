import React, { useState, useEffect } from "react";
import { 
  Zap, Camera, Film, ShieldCheck, Mic, Video, Music, Lightbulb, 
  Layers, Sparkles, Utensils, Disc, UserCheck, Plus, Edit2, Trash2, 
  RotateCcw, Check, X, Search, Info, AlertCircle, 
  Sliders, ArrowUpRight, ArrowDownRight, SlidersHorizontal
} from "lucide-react";
import { 
  EventServiceItem, 
  getEventServices, 
  updateEventServicePrice, 
  addNewEventService, 
  deleteEventService, 
  resetEventServicesToDefault 
} from "../../services/eventPricingService";

interface EventServicePricingManagerProps {
  onServicePriceChanged?: (services: EventServiceItem[]) => void;
  isAdmin?: boolean;
}

export const ICON_OPTIONS: { [key: string]: any } = {
  Zap, Camera, FilmIcon: Film, Film, ShieldCheck, Mic, Video, 
  Music, Lightbulb, Layers, Sparkles, Utensils, Disc, UserCheck
};

export default function EventServicePricingManager({
  onServicePriceChanged,
  isAdmin = true
}: EventServicePricingManagerProps) {
  const [services, setServices] = useState<EventServiceItem[]>(() => getEventServices());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit State
  const [editingService, setEditingService] = useState<EventServiceItem | null>(null);

  // New Service State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Power & Utilities");
  const [newServiceIcon, setNewServiceIcon] = useState("Zap");
  const [newServiceShortDesc, setNewServiceShortDesc] = useState("");
  const [newServiceDetails, setNewServiceDetails] = useState("");

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setServices(e.detail);
      if (onServicePriceChanged) {
        onServicePriceChanged(e.detail);
      }
    };
    window.addEventListener("cinevenue-event-services-updated", handleUpdate as EventListener);
    return () => {
      window.removeEventListener("cinevenue-event-services-updated", handleUpdate as EventListener);
    };
  }, [onServicePriceChanged]);

  const handleSaveEdit = () => {
    if (!editingService) return;
    const updatedServices = updateEventServicePrice(editingService.id, {
      name: editingService.name,
      shortDesc: editingService.shortDesc,
      details: editingService.details,
    });
    setServices(updatedServices);
    setEditingService(null);
  };

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    
    const updatedServices = addNewEventService({
      name: newServiceName,
      category: newServiceCategory,
      iconName: newServiceIcon,
      shortDesc: newServiceShortDesc,
      details: newServiceDetails,
      availableInventory: 10
    });
    setServices(updatedServices);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewServiceName("");
    setNewServiceShortDesc("");
    setNewServiceDetails("");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will remove it from the booking flow.`)) {
      const updated = deleteEventService(id);
      setServices(updated);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Reset all 13 Master Services (Generators, Photography, Videography, Security, Anchors, etc.) back to factory defaults?")) {
      const reset = resetEventServicesToDefault();
      setServices(reset);
    }
  };

  const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = services.filter(svc => {
    const matchesCat = selectedCategory === "All" || svc.category === selectedCategory;
    const matchesSearch = (svc.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (svc.shortDesc?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    const IconComponent = ICON_OPTIONS[iconName] || Zap;
    return <IconComponent className={className} />;
  };

  return (
    <div className="bg-[#0A0A0F] text-white rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 border-b border-white/10 bg-gradient-to-br from-[#101017] to-transparent">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                Event Services Configurator
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
              Dynamically manage available production services. Add new hardware, 
              toggle availability, or update descriptions.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleResetToDefault}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-extrabold uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-amber-500/10"
                    : "bg-[#161622] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#161622] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredServices.map(svc => {
            const isEditing = editingService?.id === svc.id;

            return (
              <div 
                key={svc.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  isEditing 
                    ? "bg-[#181926] border-[#D4AF37]" 
                    : "bg-[#101017] border-white/10 hover:border-white/20"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                        Editing Service
                      </div>
                      <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Service Name</label>
                      <input 
                        type="text" 
                        value={editingService.name} 
                        onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                        className="w-full bg-[#12121A] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Short Description</label>
                      <input 
                        type="text" 
                        value={editingService.shortDesc} 
                        onChange={(e) => setEditingService({...editingService, shortDesc: e.target.value})}
                        className="w-full bg-[#12121A] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Detailed Spec</label>
                      <textarea 
                        rows={2}
                        value={editingService.details} 
                        onChange={(e) => setEditingService({...editingService, details: e.target.value})}
                        className="w-full bg-[#12121A] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <button 
                      onClick={handleSaveEdit}
                      className="w-full py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                            {renderIcon(svc.iconName, "w-5 h-5")}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {svc.category}
                            </div>
                            <h3 className="text-base font-black text-white">{svc.name}</h3>
                          </div>
                        </div>
                        {svc.isCustomAdded && (
                          <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                            Custom
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 font-medium leading-relaxed mb-2">
                        {svc.shortDesc}
                      </p>
                      
                      <div className="text-[10px] text-gray-500 bg-[#161622] p-3 rounded-xl border border-white/5 line-clamp-3 mb-4">
                        {svc.details}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setEditingService(svc)}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Data
                      </button>
                      <button
                        onClick={() => handleDelete(svc.id, svc.name)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <form onSubmit={handleAddNewService} className="relative w-full max-w-2xl bg-[#0A0A0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Add Custom Service</h3>
                <p className="text-xs text-gray-400 mt-1">Add specialized equipment or talent to the booking engine</p>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Drone Light Show"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full bg-[#181926] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full bg-[#181926] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Power & Utilities">Power & Utilities (Generators)</option>
                    <option value="Media & Production">Media & Production (Photo / Video)</option>
                    <option value="Hospitality & Safety">Hospitality & Safety (Security / Catering)</option>
                    <option value="Artist & Host Talent">Artist & Host Talent (Anchors / DJs)</option>
                    <option value="Visuals & Stage">Visuals & Stage (LED / Stage / Lighting)</option>
                    <option value="Design & Decor">Design & Decor (Thematic Sets)</option>
                    <option value="Audio & Acoustics">Audio & Acoustics (Line Arrays)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Select Visual Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(ICON_OPTIONS).map(icName => (
                    <button
                      key={icName}
                      type="button"
                      onClick={() => setNewServiceIcon(icName)}
                      className={`p-2.5 rounded-xl border flex items-center gap-1 text-xs cursor-pointer ${
                        newServiceIcon === icName 
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] font-bold" 
                          : "bg-[#181926] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {renderIcon(icName, "w-4 h-4")}
                      <span>{icName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Short Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Drones Synchronized 3D Formation Show"
                  value={newServiceShortDesc}
                  onChange={(e) => setNewServiceShortDesc(e.target.value)}
                  className="w-full bg-[#181926] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Full scope of equipment, operators, permissions, and delivery schedule..."
                  value={newServiceDetails}
                  onChange={(e) => setNewServiceDetails(e.target.value)}
                  className="w-full bg-[#181926] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#0A0A0F]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
