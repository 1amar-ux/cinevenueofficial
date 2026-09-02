import React, { useState } from "react";
import { Sparkles, Plus, Edit2, Trash2, Check, DollarSign, HeartCrack } from "lucide-react";

export interface ConcessionItem {
  id: string;
  name: string;
  category: "Snacks" | "Beverages" | "Combos";
  price: number;
  available: boolean;
  img: string;
}

interface FoodProps {
  theatreId: number;
}

export default function Food({ theatreId }: FoodProps) {
  const [items, setItems] = useState<ConcessionItem[]>(() => {
    const cached = localStorage.getItem(`cine_food_${theatreId}`);
    if (cached) return JSON.parse(cached);
    return [
      { id: "fd-1", name: "Premium Salted Popcorn (Large)", category: "Snacks", price: 290, available: true, img: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=60" },
      { id: "fd-2", name: "Golden Cheese Nachos", category: "Snacks", price: 240, available: true, img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=60" },
      { id: "fd-3", name: "Ice Cold Pepsi (750ml)", category: "Beverages", price: 180, available: true, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=60" },
      { id: "fd-4", name: "Classic Popcorn & Soda Combo", category: "Combos", price: 420, available: true, img: "https://images.unsplash.com/photo-1601556129515-d4193057e491?w=400&auto=format&fit=crop&q=60" }
    ];
  });

  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"Snacks" | "Beverages" | "Combos">("Snacks");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImg, setNewItemImg] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleToggleAvailable = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setItems(updated);
    localStorage.setItem(`cine_food_${theatreId}`, JSON.stringify(updated));
  };

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const added: ConcessionItem = {
      id: "fd-" + Math.floor(100 + Math.random() * 900),
      name: newItemName,
      category: newItemCategory,
      price: Number(newItemPrice),
      available: true,
      img: newItemImg || "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=60"
    };

    const updated = [...items, added];
    setItems(updated);
    localStorage.setItem(`cine_food_${theatreId}`, JSON.stringify(updated));

    // Reset fields
    setNewItemName("");
    setNewItemPrice("");
    setNewItemImg("");
    setIsAdding(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Remove this item from concession counter menu?")) {
      const updated = items.filter((item) => item.id !== id);
      setItems(updated);
      localStorage.setItem(`cine_food_${theatreId}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Concessions & Candy Counter
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage cinema snacks, beverages, popcorn combos, and live digital inventory pricing
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Menu Item</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreateFood} className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 max-w-xl text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">
            Create New Concession Item
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Item Name</label>
              <input
                type="text"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                placeholder="e.g. Caramel Popcorn Tub"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Pricing (₹)</label>
              <input
                type="number"
                required
                min="30"
                max="1000"
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                placeholder="250"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="Snacks" className="bg-[#0A0A0B]">Snacks</option>
                <option value="Beverages" className="bg-[#0A0A0B]">Beverages</option>
                <option value="Combos" className="bg-[#0A0A0B]">Combos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Visual Image Link</label>
              <input
                type="url"
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                placeholder="Unsplash / custom url"
                value={newItemImg}
                onChange={(e) => setNewItemImg(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer border-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer border-0"
            >
              Publish Snack Pack
            </button>
          </div>
        </form>
      )}

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#121215] border border-white/5 hover:border-gold/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
          >
            {/* Cover photo */}
            <div className="relative h-40 w-full bg-[#1C1C22]">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#0A0A0B]/80 text-gold border border-gold/20 text-[9px] font-bold font-mono uppercase tracking-wider">
                {item.category}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary line-clamp-1">{item.name}</h4>
                <p className="font-mono text-xs font-bold text-gold">₹{item.price}</p>
              </div>

              {/* Toggle availability & Action options */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    item.available
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                  title="Toggle Live Stock"
                >
                  {item.available ? "● In Stock" : "● Out of Stock"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 cursor-pointer transition-colors"
                  title="Delete from menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
