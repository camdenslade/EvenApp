// src/context/LocationProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { apiPost } from "../services/apiService";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
}

interface LocationContextType {
  location: LocationData;
  getLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  location: { latitude: null, longitude: null },
  getLocation: async () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
  });

  const getLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        };

        setLocation(coords);

        await apiPost("/profiles/update-location", coords);
    } catch (err) {
        console.error("Location error:", err);
    }
    };


  useEffect(() => {
    getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, getLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
