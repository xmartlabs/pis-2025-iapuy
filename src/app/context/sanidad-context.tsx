import React, { createContext, useState } from "react";

export const SanidadContext = createContext({
  refresh: () => {},
  lastUpdate: 0,
});

export function SanidadProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const refresh = () => {
    setLastUpdate(Date.now());
  };
  return (
    <SanidadContext.Provider value={{ refresh, lastUpdate }}>
      {children}
    </SanidadContext.Provider>
  );
}
