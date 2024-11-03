import React, { createContext, useContext, useState } from 'react';

// Create the context
const MapContext = createContext();

// Create a provider component to wrap your application and make the state available
export const MapProvider = ({ children }) => {
    const [selectedE, setSelectedE] = useState(null);

    return (
        <MapContext.Provider value={{ selectedE, setSelectedE }}>
            {children}
        </MapContext.Provider>
    );
};

// Custom hook to use the MapContext easily
export const useMap = () => useContext(MapContext);
