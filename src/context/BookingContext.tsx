import React, { createContext, useState, ReactNode } from "react";

interface BookingType {
  movie: any;
  theatre: any;
  show: any;
  seats: any[];
  total: number;
}

interface BookingContextType {
  booking: BookingType;
  setBooking: React.Dispatch<React.SetStateAction<BookingType>>;
}

export const BookingContext = createContext<BookingContextType>({
  booking: {
    movie: null,
    theatre: null,
    show: null,
    seats: [],
    total: 0,
  },
  setBooking: () => {},
});

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const [booking, setBooking] = useState<BookingType>({
    movie: null,
    theatre: null,
    show: null,
    seats: [],
    total: 0,
  });

  return (
    <BookingContext.Provider value={{ booking, setBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
