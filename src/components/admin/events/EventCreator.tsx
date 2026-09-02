import React, { useState } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';

export default function EventCreator({ onCreated }: { onCreated: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Create New Event</h3>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onCreated(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Name</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" placeholder="e.g. Movie XYZ Audio Launch" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Type</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none">
                  <option>Pre-Release Event</option>
                  <option>Audio Launch</option>
                  <option>Press Meet</option>
                  <option>Celebrity Fan Meet</option>
                  <option>Concert</option>
                  <option>Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Access Level</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none">
                  <option>Public - Paid</option>
                  <option>Public - Free</option>
                  <option>Invitation Only</option>
                  <option>Admin Approval Required</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Date</label>
                <input type="date" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Time</label>
                <input type="time" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Venue Name</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">City</label>
                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Total Capacity</label>
                <input type="number" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" required />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Description</label>
              <textarea rows={5} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" placeholder="Describe the event..."></textarea>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Event Banner Image URL</label>
              <div className="flex gap-2">
                <input type="url" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-gold outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Pass Categories</h4>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input type="text" placeholder="Pass Name (e.g. VIP)" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue="VIP" />
                  <input type="number" placeholder="Price" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue={5000} />
                  <input type="number" placeholder="Qty" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue={200} />
                </div>
                <div className="flex gap-2 items-center">
                  <input type="text" placeholder="Pass Name (e.g. VIP)" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue="General" />
                  <input type="number" placeholder="Price" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue={500} />
                  <input type="number" placeholder="Qty" className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" defaultValue={1500} />
                </div>
                <button type="button" className="text-gold text-xs font-semibold hover:underline">+ Add Pass Category</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
          <button type="button" className="px-6 py-2 rounded-lg font-semibold text-sm text-white bg-white/10 hover:bg-white/20">Cancel</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold text-sm text-black bg-gold hover:bg-gold/90 flex items-center gap-2">
            <Save className="w-4 h-4" /> Publish Event
          </button>
        </div>
      </form>
    </div>
  );
}
