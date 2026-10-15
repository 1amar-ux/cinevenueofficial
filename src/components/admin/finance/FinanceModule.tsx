import React, { useState } from 'react';
import FeeManagement from './FeeManagement';
import CommissionManagement from './CommissionManagement';
import FinanceDashboard from './FinanceDashboard';
import FeeCalculator from './FeeCalculator';
import SettlementEngine from './SettlementEngine';
import MovieConvenienceFeeAdmin from '../MovieConvenienceFeeAdmin';

export default function FinanceModule() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'movie_fees' | 'fees' | 'commissions' | 'calculator' | 'settlements'>('movie_fees');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">Finance & Convenience Fee Engine</h2>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveSubTab('movie_fees')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'movie_fees' ? 'text-gold border-b-2 border-gold bg-gold/10' : 'text-text-secondary hover:text-white'}`}
        >
          Movie Convenience Fees
        </button>
        <button 
          onClick={() => setActiveSubTab('dashboard')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'dashboard' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Finance Dashboard
        </button>
        <button 
          onClick={() => setActiveSubTab('fees')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'fees' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Legacy Fee & Tax Config
        </button>
        <button 
          onClick={() => setActiveSubTab('commissions')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'commissions' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Theatre Commission
        </button>
        <button 
          onClick={() => setActiveSubTab('settlements')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'settlements' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Settlements
        </button>
        <button 
          onClick={() => setActiveSubTab('calculator')} 
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${activeSubTab === 'calculator' ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-text-secondary hover:text-white'}`}
        >
          Fee Calculator
        </button>
      </div>

      <div className="mt-6">
        {activeSubTab === 'movie_fees' && <MovieConvenienceFeeAdmin isSuperAdmin={true} />}
        {activeSubTab === 'dashboard' && <FinanceDashboard />}
        {activeSubTab === 'fees' && <FeeManagement />}
        {activeSubTab === 'commissions' && <CommissionManagement />}
        {activeSubTab === 'settlements' && <SettlementEngine />}
        {activeSubTab === 'calculator' && <FeeCalculator />}
      </div>
    </div>
  );
}
