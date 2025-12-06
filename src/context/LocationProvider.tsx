// src/context/LocationProvider.tsx

// React ---------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

// Expo Location --------------------------------------------------------
import * as Location from 'expo-location';

// API ------------------------------------------------------------------
import { apiPost } from '../services/apiService';

// =====================================================================
// # TYPES
// =====================================================================

interface LocationData {
  latitude: number | null;
  longitude: number | null;
}

interface LocationContextType {
  /** Last known coordinates (null until permission + lookup succeed) */
  location: LocationData;

  /** Manually re-fetch location & sync to backend */
  getLocation: () => Promise<void>;
}

// =====================================================================
// # CONTEXT (DEFAULT FALLBACK)
// =====================================================================

const LocationContext = createContext<LocationContextType>({
  location: { latitude: null, longitude: null },
  getLocation: async () => {},
});

// =====================================================================
// # PROVIDER
// =====================================================================
//
// Behavior:
//   - Requests foreground location permission on mount
//   - If granted → fetch coordinates → send to backend
//   - Stores coordinates locally
//   - Exposes manual refresh via getLocation()
//
// Note:
//   Backend route: POST /profiles/update-location
//   profile.service.ts updates User.latitude/longitude
//

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
  });

  // -------------------------------------------------------------------
  // # FETCH + SYNC LOCATION
  // -------------------------------------------------------------------
  const getLocation = async (): Promise<void> => {
    try {
      // Request permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      // Fetch device coordinates
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setLocation(coords);

      // Sync to backend
      await apiPost('/profiles/update-location', coords);
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  // Fetch once on app boot
  useEffect(() => {
    void getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, getLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

// =====================================================================
// # HOOK
// =====================================================================

export const useLocationContext = () => useContext(LocationContext);
