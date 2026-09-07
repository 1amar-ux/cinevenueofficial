import React, { createContext, useContext, useState } from 'react';
import { PriceBreakdown } from '../types/booking';

interface BookingSession {
  movieId?: string;
  movieTitle?: string;
  posterUrl?: string;
  theatreId?: string;
  theatreName?: string;
  screenName?: string;
  showId?: string;
  showTime?: string;
  showDate?: string;
  pricePerSeat?: number;
  selectedSeats: string[];
  posHoldId?: string;
  couponCode?: string;
  cineCoinsToRedeem?: number;
  breakdown?: PriceBreakdown;
}

interface BookingContextType {
  session: BookingSession;
  updateSession: (data: Partial<BookingSession>) => void;
  resetSession: () => void;
  toggleSeat: (seatId: string) => void;
}

const initialSession: BookingSession = {
  selectedSeats: [],
  cineCoinsToRedeem: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<BookingSession>(initialSession);

  const updateSession = (data: Partial<BookingSession>) => {
    setSession((prev) => ({ ...prev, ...data }));
  };

  const resetSession = () => {
    setSession(initialSession);
  };

  const toggleSeat = (seatId: string) => {
    setSession((prev) => {
      const exists = prev.selectedSeats.includes(seatId);
      return {
        ...prev,
        selectedSeats: exists
          ? prev.selectedSeats.filter((s) => s !== seatId)
          : [...prev.selectedSeats, seatId],
      };
    });
  };

  return (
    <BookingContext.Provider
      value={{
        session,
        updateSession,
        resetSession,
        toggleSeat,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
