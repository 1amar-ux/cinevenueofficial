import React, { useState } from 'react';
import EventsList from './EventsList';
import EventCreator from './EventCreator';
import EventManagementDashboard from './EventManagementDashboard';
import EventRegistrations from './EventRegistrations';
import EventPassesManager from './EventPassesManager';
import EventSettlements from './EventSettlements';
import EventAnalytics from './EventAnalytics';
import QRScanner from './QRScanner';
import FreePassManager from './FreePassManager';
import {
  Sparkles,
  Calendar,
  PlusCircle,
  Users,
  Receipt,
  BarChart3,
  QrCode,
  Award,
  Ticket,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';

export default function EventsAdminModule() {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'create' | 'freepasses' | 'registrations' | 'passes' | 'settlements' | 'analytics' | 'scanner'
  >('dashboard');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedEventIdForPasses, setSelectedEventIdForPasses] = useState<string | null>(null);
  const [selectedEventForManagement, setSelectedEventForManagement] = useState<any | null>(null);

  const handleEditEvent = (evt: any) => {
    setEditingEvent(evt);
    setSelectedEventForManagement(null);
    setActiveSubTab('create');
  };

  const handleManageEvent = (evt: any) => {
    setSelectedEventForManagement(evt);
  };

  const handleManagePasses = (evt: any) => {
    // Directs into that specific event's dedicated management dashboard
    setSelectedEventForManagement(evt);
  };

  const handleCreateNewClick = () => {
    setEditingEvent(null);
    setSelectedEventForManagement(null);
    setActiveSubTab('create');
  };

  const handleTabChange = (tab: any) => {
    setSelectedEventForManagement(null);
    setActiveSubTab(tab);
  };

  // If a specific event is selected for management, render its dedicated 7-tab dashboard
  if (selectedEventForManagement) {
    return (
      <div className="space-y-4">
        <EventManagementDashboard
          event={selectedEventForManagement}
          onBack={() => setSelectedEventForManagement(null)}
          onEventUpdated={(updated) => {
            setSelectedEventForManagement(updated);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
            <span>Event</span>
            <span className="text-gold">Admin & Passes</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage movie pre-releases, audio launches, fan meets, vertical A4 event passes, and digital gate check-in.
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> All Events
        </button>
        <button
          onClick={handleCreateNewClick}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'create'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> {editingEvent ? 'Edit Event' : 'Create Event'}
        </button>
        <button
          onClick={() => {
            setSelectedEventIdForPasses(null);
            handleTabChange('passes');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'passes'
              ? 'text-gold border-b-2 border-gold bg-gold/10'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4 text-gold" /> Global Passes
        </button>
        <button
          onClick={() => handleTabChange('scanner')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'scanner'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" /> Global QR Check-in
        </button>
        <button
          onClick={() => handleTabChange('freepasses')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'freepasses'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Free Passes & Capacity
        </button>
        <button
          onClick={() => handleTabChange('registrations')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'registrations'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Registrations
        </button>
        <button
          onClick={() => handleTabChange('settlements')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'settlements'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" /> Settlements
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'analytics'
              ? 'text-gold border-b-2 border-gold bg-gold/5'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
      </div>

      <div className="mt-6">
        {activeSubTab === 'dashboard' && (
          <EventsList
            onManageEvent={handleManageEvent}
            onEditEvent={handleEditEvent}
            onManagePasses={handleManagePasses}
          />
        )}
        {activeSubTab === 'create' && (
          <EventCreator
            editingEvent={editingEvent}
            onCancel={() => {
              setEditingEvent(null);
              setActiveSubTab('dashboard');
            }}
            onCreated={(createdEvt) => {
              setEditingEvent(null);
              if (createdEvt) {
                // Instantly open the newly created event's dedicated dashboard
                setSelectedEventForManagement(createdEvt);
              } else {
                setActiveSubTab('dashboard');
              }
            }}
          />
        )}
        {activeSubTab === 'passes' && (
          <EventPassesManager
            initialEventId={selectedEventIdForPasses}
            onSwitchToScanner={() => setActiveSubTab('scanner')}
          />
        )}
        {activeSubTab === 'scanner' && <QRScanner />}
        {activeSubTab === 'freepasses' && <FreePassManager />}
        {activeSubTab === 'registrations' && <EventRegistrations />}
        {activeSubTab === 'settlements' && <EventSettlements />}
        {activeSubTab === 'analytics' && <EventAnalytics />}
      </div>
    </div>
  );
}
