import React, { useState, useEffect } from 'react';
import { TheatreIntegration, IntegrationStatus } from '../../../types/integration';
import IntegrationDashboard from './IntegrationDashboard';
import IntegrationDetail from './IntegrationDetail';
import IntegrationForm from './IntegrationForm';
import TheatreOnboardingWizard from '../../theatre-admin/TheatreOnboardingWizard';
import { Sparkles, Server, Zap } from 'lucide-react';

interface IntegrationTestingModuleProps {
  isSuperAdmin: boolean;
}

export default function IntegrationTestingModule({ isSuperAdmin }: IntegrationTestingModuleProps) {
  const [integrations, setIntegrations] = useState<TheatreIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'DASHBOARD' | 'DETAIL' | 'NEW' | 'ONBOARDING_WIZARD'>('DASHBOARD');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/integrations');
      const data = await res.json();
      if (data.success && data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (e) {
      console.error("Failed to fetch integrations", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchIntegrations();
        setView('DASHBOARD');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, status: IntegrationStatus) => {
    try {
      const res = await fetch('/api/admin/integrations/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedIntegration = integrations.find(i => i.id === selectedId);

  if (loading) return <div className="p-8 text-white flex items-center justify-center min-h-[400px]">Loading integrations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            External Theatre API & POS Integration Gateway
          </h2>
          <p className="text-xs text-white/50">
            Vista Cinema Connect • Veezi POS • PVR INOX Gateway • Generic REST POS
          </p>
        </div>

        <div className="flex items-center gap-2">
          {view === 'DASHBOARD' && (
            <button
              onClick={() => setView('ONBOARDING_WIZARD')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold via-amber-400 to-gold-light text-black font-bold text-xs rounded-xl shadow-lg shadow-gold/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              5-Step Theatre Onboarding Wizard
            </button>
          )}

          {view !== 'DASHBOARD' && (
            <button 
              onClick={() => setView('DASHBOARD')}
              className="text-xs text-text-secondary hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
            >
              ← Back to Integration Hub
            </button>
          )}
        </div>
      </div>

      {view === 'DASHBOARD' && (
        <IntegrationDashboard 
          integrations={integrations} 
          onSelect={(id) => { setSelectedId(id); setView('DETAIL'); }}
          onCreateNew={() => setView('ONBOARDING_WIZARD')}
        />
      )}

      {view === 'ONBOARDING_WIZARD' && (
        <TheatreOnboardingWizard
          onClose={() => setView('DASHBOARD')}
          onComplete={async (data) => {
            console.log("Theatre onboarding complete:", data);
            await fetchIntegrations();
            setView('DASHBOARD');
          }}
        />
      )}

      {view === 'DETAIL' && selectedIntegration && (
        <IntegrationDetail 
          integration={selectedIntegration}
          isSuperAdmin={isSuperAdmin}
          onUpdateStatus={handleUpdateStatus}
          onBack={() => setView('DASHBOARD')}
        />
      )}

      {view === 'NEW' && (
        <IntegrationForm 
          onSave={handleCreate}
          onBack={() => setView('DASHBOARD')}
        />
      )}
    </div>
  );
}
