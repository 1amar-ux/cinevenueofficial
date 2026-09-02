const fs = require('fs');
const path = 'src/components/admin/integration-testing/IntegrationTestingModule.tsx';
let content = fs.readFileSync(path, 'utf8');

const newCode = `import React, { useState, useEffect } from 'react';
import { TheatreIntegration, IntegrationStatus } from '../../../types/integration';
import IntegrationDashboard from './IntegrationDashboard';
import IntegrationDetail from './IntegrationDetail';
import IntegrationForm from './IntegrationForm';

interface IntegrationTestingModuleProps {
  isSuperAdmin: boolean;
}

export default function IntegrationTestingModule({ isSuperAdmin }: IntegrationTestingModuleProps) {
  const [integrations, setIntegrations] = useState<TheatreIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'DASHBOARD' | 'DETAIL' | 'NEW'>('DASHBOARD');
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

  if (loading) return <div className="p-8 text-white">Loading integrations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">
          External Theatre API & Integration Management
        </h2>
        {view !== 'DASHBOARD' && (
          <button 
            onClick={() => setView('DASHBOARD')}
            className="text-sm text-text-secondary hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {view === 'DASHBOARD' && (
        <IntegrationDashboard 
          integrations={integrations} 
          onSelect={(id) => { setSelectedId(id); setView('DETAIL'); }}
          onCreateNew={() => setView('NEW')}
        />
      )}

      {view === 'DETAIL' && selectedIntegration && (
        <IntegrationDetail 
          integration={selectedIntegration}
          isSuperAdmin={isSuperAdmin}
          onUpdateStatus={(status) => handleUpdateStatus(selectedIntegration.id, status)}
        />
      )}

      {view === 'NEW' && (
        <IntegrationForm 
          onSubmit={handleCreate}
          onCancel={() => setView('DASHBOARD')}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync(path, newCode);
console.log('Updated IntegrationTestingModule.tsx');
