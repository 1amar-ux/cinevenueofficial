import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { EventBookingRecord } from '../../types/eventBooking';
import LiveEventPassCard from './LiveEventPassCard';

interface DigitalTicketPassModalProps {
  booking: EventBookingRecord | any;
  onClose: () => void;
}

export default function DigitalTicketPassModal({
  booking,
  onClose,
}: DigitalTicketPassModalProps) {
  if (!booking) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm my-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 px-1 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Admission Pass Confirmed</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-gold hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Pass"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Pass Design Card */}
        <LiveEventPassCard 
          pass={booking} 
          showActions={true} 
          onClose={onClose} 
        />
      </div>
    </div>
  );
}
