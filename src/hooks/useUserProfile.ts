// src/hooks/useUserProfile.ts

import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../services/apiService';
import type { UserProfile } from '../types/user';

// ====================================================================
// # useUserProfile
// ====================================================================
//
// Fetches the authenticated user's profile from the backend (`/me`).
//
// Responsibilities:
//   • Load current profile on mount
//   • Track loading + error states
//   • Expose a refresh function (refreshProfile)
//
// Backend:
//   The `/me` endpoint returns the user's ProfileResponse from ProfilesService,
//   which includes:
//     - name, age, bio
//     - photos
//     - dating preference
//     - etc.
//
// Returned values:
//   profile        → UserProfile | null
//   loading        → boolean
//   error          → string | null
//   refreshProfile → manually re-fetch data
//

export function useUserProfile() {
  // --------------------------------------------------------------------
  // # LOCAL STATE
  // --------------------------------------------------------------------
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------
  // # FETCH USER PROFILE
  // --------------------------------------------------------------------
  //
  // Attempts to call GET /me.
  // Handles three states:
  //   • loading
  //   • successful profile load
  //   • error receiving or parsing data
  //
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<UserProfile>('/me');

      if (!data) {
        setError('Failed to load profile');
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    } catch (err) {
      console.log('Profile fetch error:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // # LOAD ON MOUNT
  // --------------------------------------------------------------------
  //
  // Automatically fetches the user's profile the first time this hook mounts.
  //
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --------------------------------------------------------------------
  // # PUBLIC API
  // --------------------------------------------------------------------
  return {
    /** Fetched user profile or null if not loaded */
    profile,

    /** Loading indicator while hitting /me */
    loading,

    /** Non-null if /me request failed */
    error,

    /** Allows any component to manually force refresh */
    refreshProfile: fetchProfile,
  };
}
