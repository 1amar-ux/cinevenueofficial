import React, { useState } from 'react';
import { TheatreIntegration, IntegrationStatus } from '../../../types/integration';
import { Plus, Search, Filter, Activity, CheckCircle, AlertTriangle, ShieldCheck, Play, Pause } from 'lucide-react';

interface IntegrationDashboardProps {
  integrations: TheatreIntegration[];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export default function IntegrationDashboard({ integrations, onSelect, onCreateNew }: IntegrationDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => ['TESTING', 'READY_FOR_APPROVAL', 'LIVE'].includes(i.status)).length,
    testing: integrations.filter(i => i.status === 'TESTING').length,
    failed: integrations.filter(i => i.status === 'FAILED').length,
    ready: integrations.filter(i => i.status === 'READY_FOR_APPROVAL').length,
    live: integrations.filter(i => i.status === 'LIVE').length,
    suspended: integrations.filter(i => i.status === 'SUSPENDED').length,
  };

  const filtered = integrations.filter(i => 
    i.theatreName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.provider || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Total Integrations</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Live</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.live}</h3>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Ready / Testing</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.ready} / {stats.testing}</h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Failed / Suspended</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{stats.failed} / {stats.suspended}</h3>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text"
            placeholder="Search theatres, providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light text-black font-semibold rounded-lg text-sm transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Integration</span>
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-text-secondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Theatre & Provider</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Environment</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Sync</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? filtered.map((integration) => (
              <tr key={integration.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{integration.theatreName}</div>
                  <div className="text-xs text-text-muted">{integration.provider || 'CineVenue Native'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] uppercase font-bold tracking-wider">
                    {integration.integrationType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {integration.environment === 'PRODUCTION' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      Production
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                      Sandbox
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                    integration.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    integration.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    integration.status === 'READY_FOR_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-white/10 text-white/70 border border-white/20'
                  }`}>
                    {integration.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-text-muted">
                  {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onSelect(integration.id)}
                    className="text-xs font-semibold text-gold hover:text-white transition-colors"
                  >
                    Manage &rarr;
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                  No integrations found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
