import React, { useState } from 'react';
import { TheatreIntegration, IntegrationStatus, IntegrationType } from '../../../types/integration';
import { 
  Plus, Search, Filter, Activity, CheckCircle, AlertTriangle, 
  ShieldCheck, Zap, RefreshCw, Box, Lock, Unlock, Database
} from 'lucide-react';

interface IntegrationDashboardProps {
  integrations: TheatreIntegration[];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export default function IntegrationDashboard({ integrations, onSelect, onCreateNew }: IntegrationDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const stats = {
    total: integrations.length,
    pos: integrations.filter(i => i.integrationType === 'POS_INTEGRATION').length,
    live: integrations.filter(i => i.status === 'LIVE' || i.liveBookingEnabled).length,
    testing: integrations.filter(i => i.status === 'TESTING' || i.status === 'READY_FOR_APPROVAL').length,
    attention: integrations.filter(i => i.status === 'FAILED' || i.status === 'SUSPENDED' || i.status === 'DISCONNECTED').length,
  };

  const filtered = integrations.filter(i => {
    const matchesSearch = 
      i.theatreName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (i.provider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.venueId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || i.integrationType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'LIVE' && (i.status === 'LIVE' || i.liveBookingEnabled)) ||
      (statusFilter === 'TESTING' && (i.status === 'TESTING' || i.status === 'READY_FOR_APPROVAL')) ||
      (statusFilter === 'FAILED' && (i.status === 'FAILED' || i.status === 'SUSPENDED' || i.status === 'DISCONNECTED'));

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Total Theatres</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{stats.total}</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Box className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-[11px] text-text-muted mt-2">{stats.pos} Connected via POS Adapter</p>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Live POS Bookings</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1.5">{stats.live}</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-2 font-medium">Authoritative 2-Way Sync</p>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">In Testing / Sandbox</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1.5">{stats.testing}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-2 font-medium">Ready for Certification</p>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Attention Needed</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1.5">{stats.attention}</h3>
            </div>
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-[11px] text-red-400/80 mt-2 font-medium">Suspended or Disconnected</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121216] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text"
            placeholder="Search theatre, provider, venue ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Integration Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="POS_INTEGRATION">POS Integration</option>
            <option value="CINEVENUE_MANAGED">CineVenue Managed</option>
            <option value="EXTERNAL_API">External API</option>
            <option value="MANUAL">Manual</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="LIVE">Live Production</option>
            <option value="TESTING">Sandbox / Testing</option>
            <option value="FAILED">Attention Needed</option>
          </select>

          <button 
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-gold/10 ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>New POS Integration</span>
          </button>
        </div>
      </div>

      {/* Integrations Table */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Theatre & Venue</th>
                <th className="px-6 py-4">Integration Type</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Live Booking</th>
                <th className="px-6 py-4">Last Sync</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? filtered.map((integration) => (
                <tr key={integration.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-base group-hover:text-gold transition-colors">
                      {integration.theatreName}
                    </div>
                    <div className="text-xs text-text-muted font-mono mt-0.5">
                      {integration.venueId ? `Venue: ${integration.venueId}` : `ID: ${integration.id}`}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      integration.integrationType === 'POS_INTEGRATION' ? 'bg-gold/10 text-gold border border-gold/30' :
                      integration.integrationType === 'EXTERNAL_API' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                      integration.integrationType === 'CINEVENUE_MANAGED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {integration.integrationType.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">
                      {integration.provider || (integration.integrationType === 'POS_INTEGRATION' ? 'Generic POS' : 'Native')}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {integration.environment === 'PRODUCTION' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                        Production
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Sandbox
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {integration.liveBookingEnabled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Lock className="w-3 h-3" />
                        Disabled
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs text-text-muted">
                    {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onSelect(integration.id)}
                      className="px-4 py-2 bg-white/5 hover:bg-gold hover:text-black text-gold font-bold text-xs rounded-xl border border-white/10 hover:border-gold transition-all"
                    >
                      Manage &rarr;
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    No theatre integrations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
