import React, { createContext, useContext, ReactNode } from 'react';

// Replace with your actual server URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your server's IP address

interface ApiContextType {
  baseUrl: string;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  return (
    <ApiContext.Provider value={{ baseUrl: API_BASE_URL }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}