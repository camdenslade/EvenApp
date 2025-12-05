// src/hooks/useLocation.ts
import { useLocationContext } from "../context/LocationProvider";

export const useLocation = () => {
  const { location, getLocation } = useLocationContext();

  const requireLocation = async () => {
    if (location.latitude && location.longitude) return location;

    await getLocation();
    return location;
  };

  return {
    location,
    requireLocation,
  };
};
