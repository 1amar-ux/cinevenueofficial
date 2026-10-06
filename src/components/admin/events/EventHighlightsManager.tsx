import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sparkle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Save,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  TrendingExperienceItem,
  BrowseLiveCategoryItem,
  getTrendingExperiences,
  saveTrendingExperiences,
  getBrowseLiveCategories,
  saveBrowseLiveCategories,
  DEFAULT_TRENDING_EXPERIENCES,
  DEFAULT_BROWSE_CATEGORIES,
} from '../../../services/eventHighlightsService';

export default function EventHighlightsManager() {
  const [trendingList, setTrendingList] = useState<TrendingExperienceItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<BrowseLiveCategoryItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState('Live highlights updated! Changes are now actively broadcasting to the public website.');

  // New Trending Item Form State
  const [newTrendTitle, setNewTrendTitle] = useState('');
  const [newTrendLocation, setNewTrendLocation] = useState('');
  const [newTrendStat, setNewTrendStat] = useState('');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCount, setNewCatCount] = useState('');
  const [newCatTag, setNewCatTag] = useState('');

  // Editing Item Tracking
  const [editingTrendId, setEditingTrendId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  useEffect(() => {
    const syncState = () => {
      setTrendingList(getTrendingExperiences());
      setCategoriesList(getBrowseLiveCategories());
    };

    syncState();

    const handleTrendUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTrendingList(e.detail);
      } else {
        setTrendingList(getTrendingExperiences());
      }
    };

    const handleCatUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCategoriesList(e.detail);
      } else {
        setCategoriesList(getBrowseLiveCategories());
      }
    };

    window.addEventListener('cinevenue:trending_experiences_updated', handleTrendUpdate);
    window.addEventListener('cinevenue:browse_categories_updated', handleCatUpdate);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener('cinevenue:trending_experiences_updated', handleTrendUpdate);
      window.removeEventListener('cinevenue:browse_categories_updated', handleCatUpdate);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  const triggerFeedback = (msg: string) => {
    setSavedMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveAll = () => {
    saveTrendingExperiences(trendingList);
    saveBrowseLiveCategories(categoriesList);
    triggerFeedback('All Trending Experiences & Categories saved successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset Trending Experiences and Browse Categories back to default factory presets?')) {
      setTrendingList(DEFAULT_TRENDING_EXPERIENCES);
      setCategoriesList(DEFAULT_BROWSE_CATEGORIES);
      saveTrendingExperiences(DEFAULT_TRENDING_EXPERIENCES);
      saveBrowseLiveCategories(DEFAULT_BROWSE_CATEGORIES);
      triggerFeedback('Factory defaults restored and broadcasting to portal.');
    }
  };

  // Trending Experiences Handlers
  const handleAddTrending = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendTitle.trim()) return;

    const newItem: TrendingExperienceItem = {
      id: `trend-${Date.now()}`,
      title: newTrendTitle.trim(),
      location: newTrendLocation.trim() || 'Regional Venue Arena',
      dynamicStat: newTrendStat.trim() || '🔥 Fast Selling',
      active: true,
    };

    const updated = [...trendingList, newItem];
    setTrendingList(updated);
    saveTrendingExperiences(updated);
    triggerFeedback(`"${newItem.title}" added to trending experiences.`);

    setNewTrendTitle('');
    setNewTrendLocation('');
    setNewTrendStat('');
  };

  const handleDeleteTrending = (id: string) => {
    const itemToDelete = trendingList.find((item) => item.id === id);
    const updated = trendingList.filter((item) => item.id !== id);
    setTrendingList(updated);
    saveTrendingExperiences(updated);
    triggerFeedback(itemToDelete ? `"${itemToDelete.title}" removed from trending experiences.` : 'Trending experience removed successfully.');
  };

  const handleClearAllTrending = () => {
    if (window.confirm('Are you sure you want to delete all trending experiences? The section will be empty.')) {
      setTrendingList([]);
      saveTrendingExperiences([]);
      triggerFeedback('All trending experiences have been deleted.');
    }
  };

  const handleUpdateTrending = (id: string, updates: Partial<TrendingExperienceItem>) => {
    const updated = trendingList.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setTrendingList(updated);
    saveTrendingExperiences(updated);
  };

  // Browse Categories Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newItem: BrowseLiveCategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      count: newCatCount.trim() || '1 Show',
      filterTag: newCatTag.trim() || newCatName.trim(),
      active: true,
    };

    const updated = [...categoriesList, newItem];
    setCategoriesList(updated);
    saveBrowseLiveCategories(updated);
    triggerFeedback(`Category "${newItem.name}" added.`);

    setNewCatName('');
    setNewCatCount('');
    setNewCatTag('');
  };

  const handleDeleteCategory = (id: string) => {
    const catToDelete = categoriesList.find((item) => item.id === id);
    const updated = categoriesList.filter((item) => item.id !== id);
    setCategoriesList(updated);
    saveBrowseLiveCategories(updated);
    triggerFeedback(catToDelete ? `Category "${catToDelete.name}" removed.` : 'Browse category removed.');
  };

  const handleClearAllCategories = () => {
    if (window.confirm('Are you sure you want to delete all browse categories?')) {
      setCategoriesList([]);
      saveBrowseLiveCategories([]);
      triggerFeedback('All browse categories have been deleted.');
    }
  };

  const handleUpdateCategory = (id: string, updates: Partial<BrowseLiveCategoryItem>) => {
    const updated = categoriesList.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setCategoriesList(updated);
    saveBrowseLiveCategories(updated);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl">
        <div>
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest font-mono block">
            PORTAL CONTENT CONTROLS
          </span>
          <h2 className="text-xl font-bold text-white font-display mt-0.5">
            Trending Experiences & Browse Categories
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Customize the live booking feed items and category quick-filters displayed on the public Events portal (<code className="text-gold font-mono text-[11px]">/events</code>).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-gold/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Grid: 2 Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================================================= */}
        {/* SECTION 1: TRENDING LIVE EXPERIENCES MANAGER                             */}
        {/* ========================================================================= */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Trending Live Experiences
                </h3>
                <span className="text-[11px] text-text-secondary">
                  Live feed of trending ticket demand in the last 15 minutes
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {trendingList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllTrending}
                  className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase transition-all cursor-pointer"
                  title="Remove all trending experiences"
                >
                  Clear All
                </button>
              )}
              <span className="text-xs font-mono font-bold text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                {trendingList.length} Items
              </span>
            </div>
          </div>

          {/* Add New Trending Form */}
          <form onSubmit={handleAddTrending} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block font-mono">
              + Add Trending Experience
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Experience Title (e.g. Sufi Symphony Night)"
                value={newTrendTitle}
                onChange={(e) => setNewTrendTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Venue (e.g. Shilpakala Hall)"
                  value={newTrendLocation}
                  onChange={(e) => setNewTrendLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
                />
                <input
                  type="text"
                  placeholder="Stat Badge (e.g. 🔥 85 passes booked)"
                  value={newTrendStat}
                  onChange={(e) => setNewTrendStat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!newTrendTitle.trim()}
                className="px-4 py-2 bg-gold/20 hover:bg-gold text-gold hover:text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </form>

          {/* Existing Trending Items List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Active Feed Items
            </span>

            {trendingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted border border-dashed border-white/10 rounded-xl">
                No trending items added yet. Click &ldquo;Reset Defaults&rdquo; above to load presets.
              </div>
            ) : (
              trendingList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 transition-all space-y-2"
                >
                  {editingTrendId === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateTrending(item.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-black/60 border border-gold/40 rounded text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => handleUpdateTrending(item.id, { location: e.target.value })}
                          className="w-full px-2 py-1 text-[11px] bg-black/60 border border-white/10 rounded text-white"
                        />
                        <input
                          type="text"
                          value={item.dynamicStat}
                          onChange={(e) => handleUpdateTrending(item.id, { dynamicStat: e.target.value })}
                          className="w-full px-2 py-1 text-[11px] bg-black/60 border border-white/10 rounded text-gold font-mono"
                        />
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingTrendId(null)}
                          className="px-3 py-1 bg-gold text-black rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate block">{item.title}</span>
                          <span className="text-[10px] font-mono text-gold font-semibold shrink-0 ml-2">
                            {item.dynamicStat}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate">{item.location}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setEditingTrendId(item.id)}
                          className="p-1.5 text-white/50 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrending(item.id)}
                          className="p-1.5 text-red-400/60 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: BROWSE LIVE CATEGORIES MANAGER                                */}
        {/* ========================================================================= */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Sparkle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Browse Live Categories
                </h3>
                <span className="text-[11px] text-text-secondary">
                  Category tags and event count pills for regional filters
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {categoriesList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllCategories}
                  className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase transition-all cursor-pointer"
                  title="Remove all categories"
                >
                  Clear All
                </button>
              )}
              <span className="text-xs font-mono font-bold text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                {categoriesList.length} Categories
              </span>
            </div>
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block font-mono">
              + Add Browse Category
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Category Name (e.g. Comedy)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
              />
              <input
                type="text"
                placeholder="Show Count (e.g. 6 Shows)"
                value={newCatCount}
                onChange={(e) => setNewCatCount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-4 py-2 bg-gold/20 hover:bg-gold text-gold hover:text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Active Category Tags
            </span>

            {categoriesList.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted border border-dashed border-white/10 rounded-xl">
                No categories added yet. Click &ldquo;Reset Defaults&rdquo; above to load presets.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 transition-all space-y-2"
                  >
                    {editingCatId === cat.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleUpdateCategory(cat.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-black/60 border border-gold/40 rounded text-white"
                        />
                        <input
                          type="text"
                          value={cat.count}
                          onChange={(e) => handleUpdateCategory(cat.id, { count: e.target.value })}
                          className="w-full px-2 py-1 text-[11px] bg-black/60 border border-white/10 rounded text-gold font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2.5 py-1 bg-gold text-black rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono text-gold px-1.5 py-0.2 rounded bg-gold/10 border border-gold/20 inline-block">
                            {cat.count}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingCatId(cat.id)}
                            className="p-1 text-white/50 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 text-red-400/60 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Preview Panel Matching User View */}
      <div className="bg-[#0B0B0F] border border-gold/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Eye className="w-4 h-4 text-gold" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Live Preview on Events Portal (/events)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Trending Preview Card */}
          <div className="bg-[#121216] border border-white/10 p-5 rounded-xl space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#D4AF37]" /> Trending Live Experiences
            </h5>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              Ticket demand is currently surging across our regional portals. Here is a live feed of active pass bookings over the last 15 minutes.
            </p>
            <div className="space-y-3 pt-1">
              {trendingList.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-white/40">
                  No trending experiences currently active. Feed will be empty on portal.
                </div>
              ) : (
                trendingList.map((item, i) => (
                  <div key={item.id || i} className="p-3 rounded-lg bg-white/[0.04] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[9px] font-mono text-[#D4AF37] font-semibold">{item.dynamicStat}</span>
                    </div>
                    <p className="text-[10px] text-white/50">{item.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Browse Categories Preview Card */}
          <div className="bg-[#121216] border border-white/10 p-5 rounded-xl space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Sparkle className="w-4 h-4 text-[#D4AF37]" /> Browse Live Categories
            </h5>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              Filter and browse high-society event passes based on premium regional categories:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {categoriesList.length === 0 ? (
                <div className="col-span-2 p-4 rounded-lg bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-white/40">
                  No browse categories active.
                </div>
              ) : (
                categoriesList.map((cat, i) => (
                  <div key={cat.id || i} className="p-2.5 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/90">{cat.name}</span>
                    <span className="text-[9px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 font-bold">{cat.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
