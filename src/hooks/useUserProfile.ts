// src/hooks/useUserProfile.ts
import { useEffect, useState, useCallback } from "react";
import { apiGet } from "../services/apiService";
import type { UserProfile } from "../types/user";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<UserProfile>("/me");

      if (!data) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    } catch (err) {
      console.log("Profile fetch error:", err);
      setError("Failed to load profile");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
  };
}
