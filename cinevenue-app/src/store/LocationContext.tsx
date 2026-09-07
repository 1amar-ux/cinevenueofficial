import React, { createContext, useContext, useState } from 'react';
import { Config } from '../constants/config';

interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>(Config.DEFAULT_CITY);

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        availableCities: Config.AVAILABLE_CITIES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
