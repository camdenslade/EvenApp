// src/hooks/useSwipeQueue.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, apiPost } from "../services/apiService";
import { UserProfile, SwipeAction } from "../types/user";
import shuffleArray from "../utils/shuffle";
import {
  IdleState,
  LoadingState,
  ErrorState,
  MatchFoundState,
  SwipeState,
} from "../types/state";

export function useSwipeQueue() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [state, setState] = useState<SwipeState>({
    status: "IDLE",
    currentProfile: null,
  });

  const lastSwipes = useRef<
    { profile: UserProfile; action: SwipeAction }[]
  >([]);

  const currentProfile = profiles.length > 0 ? profiles[0] : null;

  const loadInitialQueue = useCallback(async () => {
    setState({
      status: "LOADING",
      targetProfileId: "",
    } as LoadingState);

    const data = await apiGet<UserProfile[]>("/profiles/queue");

    if (data && data.length > 0) {
      setProfiles(data);
      setState({
        status: "IDLE",
        currentProfile: data[0],
      } as IdleState);
    } else {
      setProfiles([]);
      setState({
        status: "IDLE",
        currentProfile: null,
      } as IdleState);
    }
  }, []);

  useEffect(() => {
    loadInitialQueue();
  }, [loadInitialQueue]);

  const refillQueue = useCallback(async () => {
    const more = await apiGet<UserProfile[]>("/profiles/queue");
    if (more && more.length > 0) {
      setProfiles((prev) => [...prev, ...more]);
    }
  }, []);

  const shuffle = useCallback(() => {
    setProfiles((prev) => {
      const shuffled = shuffleArray([...prev]);
      setState({
        status: "IDLE",
        currentProfile: shuffled.length > 0 ? shuffled[0] : null,
      } as IdleState);
      return shuffled;
    });
  }, []);

  const reload = useCallback(async () => {
    setProfiles([]);
    await loadInitialQueue();
  }, [loadInitialQueue]);

  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentProfile) return;

      const swipedProfile = currentProfile;

      lastSwipes.current.push({
        profile: swipedProfile,
        action,
      });

      setState({
        status: "LOADING",
        targetProfileId: swipedProfile.id,
      } as LoadingState);

      try {
        const backendAction = action === "LIKE" ? "right" : "left";

        const result = await apiPost<{
          match: boolean;
          matchId?: string;
        }>("/swipe", {
          targetId: swipedProfile.id,
          action: backendAction,
        });

        if (!result) {
          setState({
            status: "ERROR",
            targetProfileId: swipedProfile.id,
            errorMessage: "Swipe failed",
          } as ErrorState);
          return;
        }

        if (result.match) {
          setState({
            status: "MATCH_FOUND",
            matchId: result.matchId || swipedProfile.id,
            targetProfile: swipedProfile,
            mePhoto: null,
            themPhoto: swipedProfile.profileImageUrl ?? null,
          } as MatchFoundState);

          if (profiles.length <= 3) refillQueue();
          return;
        }

        const nextQueue = profiles.slice(1);
        setProfiles(nextQueue);

        setState({
          status: "IDLE",
          currentProfile: nextQueue[0] || null,
        } as IdleState);

        if (nextQueue.length <= 3) refillQueue();
      } catch {
        setState({
          status: "ERROR",
          targetProfileId: swipedProfile.id,
          errorMessage: "Something went wrong",
        } as ErrorState);
      }
    },
    [currentProfile, profiles, refillQueue],
  );

  const undoLast = useCallback(() => {
    const last = lastSwipes.current.pop();
    if (!last) return;
    setProfiles((prev) => [last.profile, ...prev]);

    setState({
      status: "IDLE",
      currentProfile: last.profile,
    } as IdleState);
  }, []);

  return {
    state,
    currentProfile,
    profiles,
    handleSwipe,
    reload,
    shuffle,
    undoLast,
  };
}
