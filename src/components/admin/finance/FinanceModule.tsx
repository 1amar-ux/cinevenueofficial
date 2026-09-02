import React, { useState } from 'react';
import FeeManagement from './FeeManagement';
import CommissionManagement from './CommissionManagement';
import FinanceDashboard from './FinanceDashboard';
import FeeCalculator from './FeeCalculator';
import SettlementEngine from './SettlementEngine';

export default function FinanceModule() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'fees' | 'commissions' | 'calculator' | 'settlements'>('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">Finance & Settlements Engine</h2>
      </div>

      <div className="flex space-x-4 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveSubTab('dashboard')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeSubTab === 'dashboard' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Finance Dashboard
        </button>
        <button 
          onClick={() => setActiveSubTab('fees')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeSubTab === 'fees' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Fee & Tax Config
        </button>
        <button 
          onClick={() => setActiveSubTab('commissions')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeSubTab === 'commissions' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Theatre Commission
        </button>
        <button 
          onClick={() => setActiveSubTab('settlements')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeSubTab === 'settlements' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Settlements
        </button>
        <button 
          onClick={() => setActiveSubTab('calculator')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeSubTab === 'calculator' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Fee Calculator
        </button>
      </div>

      <div className="mt-6">
        {activeSubTab === 'dashboard' && <FinanceDashboard />}
        {activeSubTab === 'fees' && <FeeManagement />}
        {activeSubTab === 'commissions' && <CommissionManagement />}
        {activeSubTab === 'settlements' && <SettlementEngine />}
        {activeSubTab === 'calculator' && <FeeCalculator />}
      </div>
    </div>
  );
}
