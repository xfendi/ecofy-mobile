import React, { createContext, useContext, useState } from "react";

const MapContext = createContext();

export const MapContextProvider = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <MapContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      {children}
    </MapContext.Provider>
  );
};

export const UseMap = () => useContext(MapContext);
