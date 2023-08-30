import React, { createContext, useMemo, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    pageSize: 20,
  });

  const contextValue = useMemo(
    () => ({ settings, setSettings }),
    [settings, setSettings]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
