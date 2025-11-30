import { useState, useEffect, useCallback } from "react";
import { UserProfile, SwipeAction } from "../types/user";
import {
  SwipeState,
  IdleState,
  LoadingState,
  ErrorState,
  MatchFoundState,
} from "../types/state";
import { apiGet, apiPost } from "../services/apiService";

export default function useSwipeQueue() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [state, setState] = useState<SwipeState>({
    status: "IDLE",
    currentProfile: null,
  } as IdleState);

  const currentProfile = profiles.length > 0 ? profiles[0] : null;

  const refillQueue = useCallback(async () => {
    const data = await apiGet<UserProfile[]>("/profiles/queue");
    if (data && data.length > 0) {
      setProfiles(data);
      setState({
        status: "IDLE",
        currentProfile: data[0],
      } as IdleState);
    }
  }, []);

  useEffect(() => {
    (async () => {
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
        setState({
          status: "ERROR",
          errorMessage: "No profiles found",
          targetProfileId: "",
        } as ErrorState);
      }
    })();
  }, []);

  const handleSwipe = async (action: SwipeAction) => {
    if (state.status !== "IDLE" || !currentProfile) return;

    const swipedId = currentProfile.id;

    setState({
      status: "LOADING",
      targetProfileId: swipedId,
    } as LoadingState);

    try {
      const result = await apiPost<SwipeState>("/swipe", {
        targetId: swipedId,
        action,
      });

      if (!result) {
        setState({
          status: "ERROR",
          errorMessage: "Network error",
          targetProfileId: swipedId,
        } as ErrorState);
        return;
      }

      if (result.status === "ERROR") {
        setState(result as ErrorState);
        return;
      }

      if (result.status === "MATCH_FOUND") {
        setState(result as MatchFoundState);
        setProfiles((prev) => prev.slice(1));
        if (profiles.length <= 3) refillQueue();
        return;
      }

      if (result.status === "IDLE") {
        const nextQueue = profiles.slice(1);
        setProfiles(nextQueue);

        setState({
          status: "IDLE",
          currentProfile: nextQueue[0] || null,
        } as IdleState);

        if (nextQueue.length <= 3) refillQueue();
      }
    } catch {
      setState({
        status: "ERROR",
        errorMessage: "Something went wrong",
        targetProfileId: swipedId,
      } as ErrorState);
    }
  };

  return { state, currentProfile, handleSwipe };
}
