// src/hooks/useSwipeQueue.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '../services/apiService';
import { UserProfile, SwipeAction } from '../types/user';
import shuffleArray from '../utils/shuffle';

import {
  IdleState,
  LoadingState,
  ErrorState,
  MatchFoundState,
  SwipeState,
} from '../types/state';

// ====================================================================
// # useSwipeQueue
// ====================================================================
//
// Centralized swipe engine for the app.
//
// Responsibilities:
//   • Maintain a queue of swipeable profiles
//   • Track swipe “state machine” (IDLE → LOADING → MATCH_FOUND → IDLE)
//   • Send swipes to backend
//   • Trigger match UI when backend reports one
//   • Refill queue as it empties
//   • Track swipe history (undo support)
//
// Key Concepts:
//
//   profiles[]:
//     The working swipe queue. The *first* item is always the active card.
//
//   state (SwipeState):
//     Controls what UI the SwipeScreen should display.
//
//   undo stack:
//     lastSwipes.current[] stores copies of recently removed profiles
//     for easy restoration.
//
// --------------------------------------------------------------------

export function useSwipeQueue() {
  // ==================================================================
  // # STATE: Swipe Queue + State Machine
  // ==================================================================
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  const [state, setState] = useState<SwipeState>({
    status: 'IDLE',
    currentProfile: null,
  });

  // Undo buffer: stack of { profile, action }
  const lastSwipes = useRef<{ profile: UserProfile; action: SwipeAction }[]>([]);

  // The top of the queue (null if empty)
  const currentProfile = profiles.length > 0 ? profiles[0] : null;

  // ==================================================================
  // # LOAD INITIAL QUEUE
  // ==================================================================
  //
  // Called on mount. Loads /profiles/queue and initializes:
  //   • profiles array
  //   • currentProfile
  //   • state.status = IDLE or IDLE/empty
  //
  // Filters: removes paused profiles before returning queue.
  //
  const loadInitialQueue = useCallback(async () => {
    setState({
      status: 'LOADING',
      targetProfileId: '',
    } as LoadingState);

    const data = await apiGet<UserProfile[]>('/profiles/queue');
    const filtered = data?.filter((p) => !p.paused) ?? [];

    if (filtered.length > 0) {
      setProfiles(filtered);
      setState({
        status: 'IDLE',
        currentProfile: filtered[0],
      } as IdleState);
    } else {
      setProfiles([]);
      setState({
        status: 'IDLE',
        currentProfile: null,
      } as IdleState);
    }
  }, []);

  // Load queue on component mount
  useEffect(() => {
    loadInitialQueue();
  }, [loadInitialQueue]);

  // ==================================================================
  // # REFILL QUEUE WHEN LOW
  // ==================================================================
  //
  // Fetches another batch from backend and appends them.
  // Avoids gaps when user swipes quickly.
  //
  const refillQueue = useCallback(async () => {
    const more = await apiGet<UserProfile[]>('/profiles/queue');
    const filtered = more?.filter((p) => !p.paused) ?? [];

    if (filtered.length > 0) {
      setProfiles((prev) => [...prev, ...filtered]);
    }
  }, []);

  // ==================================================================
  // # SHUFFLE QUEUE ORDER
  // ==================================================================
  //
  // Randomizes current queue while keeping correct state transitions.
  //
  const shuffle = useCallback(() => {
    setProfiles((prev) => {
      const shuffled = shuffleArray([...prev]);
      setState({
        status: 'IDLE',
        currentProfile: shuffled.length > 0 ? shuffled[0] : null,
      } as IdleState);
      return shuffled;
    });
  }, []);

  // ==================================================================
  // # RELOAD ENTIRE QUEUE
  // ==================================================================
  //
  // Clears queue → performs fresh /profiles/queue call.
  //
  const reload = useCallback(async () => {
    setProfiles([]);
    await loadInitialQueue();
  }, [loadInitialQueue]);

  // ==================================================================
  // # HANDLE SWIPE ACTION (LIKE / PASS)
  // ==================================================================
  //
  // Handles core swipe flow:
  //
  //   1. Store swipe in undo history
  //   2. Move to LOADING state
  //   3. Send swipe to backend (/swipe)
  //   4. If backend reports a match → state = MATCH_FOUND
  //   5. Otherwise → remove profile, move to next, maybe refill queue
  //
  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentProfile) return;

      const swipedProfile = currentProfile;

      // Store undo record
      lastSwipes.current.push({
        profile: swipedProfile,
        action,
      });

      setState({
        status: 'LOADING',
        targetProfileId: swipedProfile.id,
      } as LoadingState);

      try {
        // Backend uses { left / right } instead of LIKE / PASS
        const backendAction = action === 'LIKE' ? 'right' : 'left';

        const result = await apiPost<{ match: boolean; matchId?: string }>(
          '/swipe',
          {
            targetId: swipedProfile.id,
            action: backendAction,
          },
        );

        if (!result) {
          setState({
            status: 'ERROR',
            targetProfileId: swipedProfile.id,
            errorMessage: 'Swipe failed',
          } as ErrorState);
          return;
        }

        // --------------------------------------------------------------
        // MATCH FOUND
        // --------------------------------------------------------------
        if (result.match) {
          setState({
            status: 'MATCH_FOUND',
            matchId: result.matchId || swipedProfile.id,
            targetProfile: swipedProfile,
            mePhoto: null, // You can populate this later
            themPhoto: swipedProfile.profileImageUrl ?? null,
          } as MatchFoundState);

          // Keep queue full
          if (profiles.length <= 3) refillQueue();
          return;
        }

        // --------------------------------------------------------------
        // NO MATCH — ADVANCE QUEUE
        // --------------------------------------------------------------
        const nextQueue = profiles.slice(1);
        setProfiles(nextQueue);

        setState({
          status: 'IDLE',
          currentProfile: nextQueue[0] || null,
        } as IdleState);

        if (nextQueue.length <= 3) refillQueue();
      } catch {
        setState({
          status: 'ERROR',
          targetProfileId: swipedProfile.id,
          errorMessage: 'Something went wrong',
        } as ErrorState);
      }
    },
    [currentProfile, profiles, refillQueue],
  );

  // ==================================================================
  // # UNDO LAST SWIPE
  // ==================================================================
  //
  // Pops last swipe from history and restores that profile to front of queue.
  //
  // Notes:
  //   • Does NOT retry backend; undo is 100% client-side.
  //   • Paused profiles are NOT restored.
  //
  const undoLast = useCallback(() => {
    const last = lastSwipes.current.pop();
    if (!last) return;

    if (last.profile.paused) return;

    // Put profile back at front
    setProfiles((prev) => [last.profile, ...prev]);

    setState({
      status: 'IDLE',
      currentProfile: last.profile,
    } as IdleState);
  }, []);

  // ==================================================================
  // # PUBLIC API
  // ==================================================================
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
