import React, { useState } from 'react';
import EventsList from './EventsList';
import EventCreator from './EventCreator';
import EventRegistrations from './EventRegistrations';
import EventSettlements from './EventSettlements';
import EventAnalytics from './EventAnalytics';
import QRScanner from './QRScanner';
import { Sparkles, Calendar, PlusCircle, Users, Receipt, BarChart3, QrCode } from 'lucide-react';

export default function EventsAdminModule() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'create' | 'registrations' | 'settlements' | 'analytics' | 'scanner'>('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
            <span>Exclusive</span>
            <span className="text-gold">Cinematic Events</span>
            <span>& Galas</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage movie pre-releases, audio launches, fan meets, and generate secure passes.
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveSubTab('dashboard')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'dashboard' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          <Calendar className="w-4 h-4" /> All Events
        </button>
        <button 
          onClick={() => setActiveSubTab('create')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'create' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          <PlusCircle className="w-4 h-4" /> Create Event
        </button>
        <button 
          onClick={() => setActiveSubTab('registrations')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'registrations' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Registrations
        </button>
        <button 
          onClick={() => setActiveSubTab('scanner')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'scanner' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-text-secondary hover:text-white'}`}
        >
          <QrCode className="w-4 h-4" /> QR Check-in
        </button>
        <button 
          onClick={() => setActiveSubTab('settlements')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'settlements' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          <Receipt className="w-4 h-4" /> Settlements
        </button>
        <button 
          onClick={() => setActiveSubTab('analytics')} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeSubTab === 'analytics' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
      </div>

      <div className="mt-6">
        {activeSubTab === 'dashboard' && <EventsList />}
        {activeSubTab === 'create' && <EventCreator onCreated={() => setActiveSubTab('dashboard')} />}
        {activeSubTab === 'registrations' && <EventRegistrations />}
        {activeSubTab === 'scanner' && <QRScanner />}
        {activeSubTab === 'settlements' && <EventSettlements />}
        {activeSubTab === 'analytics' && <EventAnalytics />}
      </div>
    </div>
  );
}
