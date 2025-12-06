// src/hooks/useLocation.ts

// Context --------------------------------------------------------------
import { useLocationContext } from '../context/LocationProvider';

// =====================================================================
// # useLocation
// =====================================================================
//
// Provides:
//   • Direct access to current location { latitude, longitude }
//   • A helper `requireLocation()` that ensures coordinates exist
//
// Important:
//   LocationProvider stores coordinates and updates them after fetching.
//   requireLocation() triggers a fetch if values are null, but will
//   still return the *current state* (which may remain null if denied).
//

export const useLocation = () => {
  const { location, getLocation } = useLocationContext();

  // -------------------------------------------------------------------
  // # REQUIRE LOCATION
  // -------------------------------------------------------------------
  //
  // Ensures the caller attempts to fetch location if missing.
  //
  // NOTE:
  //   Because React state updates async, returning `location` immediately
  //   may still be null right after getLocation() runs.
  //
  //   Caller should check for null values if accuracy is required.
  //
  const requireLocation = async () => {
    if (location.latitude && location.longitude) {
      return location;
    }

    await getLocation();
    return location;
  };

  // -------------------------------------------------------------------
  // # PUBLIC API
  // -------------------------------------------------------------------
  return {
    /** Last known coordinates (may be null until resolved) */
    location,

    /** Ensures location attempt happens; returns latest state snapshot */
    requireLocation,
  };
};
