// src/screens/SwipeScreen.tsx
// ============================================================================
// SwipeScreen
// ============================================================================
//
// Purpose:
//   Main swipe interface for Even Dating. Handles:
//     • Fetching swipe queue from backend via useSwipeQueue()
//     • Enforcing location requirements before swiping
//     • Rendering the swipe deck, empty states, and match modal
//     • Handling swipes (LIKE / SKIP)
//     • Undo functionality
//     • Match detection → opening MatchModal
//
// Core Hooks:
//   useSwipeQueue():
//     - profiles[]: stacked swipe list
//     - state: { status, currentProfile, ... }
//       • IDLE
//       • LOADING
//       • MATCH_FOUND
//     - handleSwipe(action)
//     - undoLast()
//     - shuffle()
//
//   useLocation():
//     - requireLocation(): prompts permissions + returns coordinates
//
// Match Flow:
//   When state.status === "MATCH_FOUND":
//     - MatchModal opens
//     - Displays both users' photos
//     - User may navigate to Messages screen
//
// Empty States:
//   - Missing location → asks user to enable
//   - No profiles returned → “Nobody nearby” with Shuffle button
//
// ============================================================================

import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

import { useSwipeQueue } from "../hooks/useSwipeQueue";
import SwipeDeck from "../components/SwipeDeck";
import { BottomButtons } from "../components/BottomButtons";
import { BottomNavBar } from "../components/BottomNavBar";
import { MatchModal } from "../components/MatchModal";
import { useLocation } from "../hooks/useLocation";

export default function SwipeScreen({ navigation }: any) {
  // ---------------------------------------------------------------------------
  // SWIPE QUEUE HOOK
  // ---------------------------------------------------------------------------
  //
  // Provides:
  //   profiles[]        → stacked deck
  //   state             → determines UI mode (idle, loading, match found)
  //   currentProfile    → top card
  //   handleSwipe()     → LIKE / SKIP
  //   undoLast()        → undo feature (premium or limited)
  //   shuffle()         → reshuffle profiles when empty
  //
  const {
    profiles,
    state,
    currentProfile,
    handleSwipe,
    undoLast,
    shuffle,
  } = useSwipeQueue();

  // ---------------------------------------------------------------------------
  // LOCATION PERMISSIONS
  // ---------------------------------------------------------------------------
  //
  // requireLocation():
  //   - Requests foreground location permission
  //   - Retrieves coordinates
  //   - Backend relies on location to compute swipe queue proximity
  //
  const { requireLocation } = useLocation();

  // Whether UI inputs should be disabled during non-IDLE state
  const interactionDisabled = state.status !== "IDLE";

  // Track whether match modal is open
  const [matchOpen, setMatchOpen] = useState(false);

  // Photos to show inside MatchModal
  const [matchPhotos, setMatchPhotos] = useState({ me: "", them: "" });

  // Track location readiness
  const [locationReady, setLocationReady] = useState(false);

  // ---------------------------------------------------------------------------
  // ON MOUNT: Ensure location is available
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      const loc = await requireLocation();

      if (!loc.latitude || !loc.longitude) {
        console.warn("Location unavailable — swipe queue disabled.");
        setLocationReady(false);
        return;
      }

      setLocationReady(true);
    })();
  }, [requireLocation]);

  // ---------------------------------------------------------------------------
  // MATCH DETECTED HANDLER
  // ---------------------------------------------------------------------------
  //
  // When useSwipeQueue() sets state.status = "MATCH_FOUND":
  //   - Extract user photos
  //   - Open MatchModal
  //
  useEffect(() => {
    if (state.status === "MATCH_FOUND") {
      setMatchPhotos({
        me: state.mePhoto ?? "",
        them: state.themPhoto ?? "",
      });
      setMatchOpen(true);
    }
  }, [state]);

  // ---------------------------------------------------------------------------
  // SWIPE ACTION CALLBACKS
  // ---------------------------------------------------------------------------
  //
  // onSwipeLeft / onSwipeRight both SKIP by default.
  // LIKE is handled by BottomButtons only.
  //
  const onSwipeLeft = useCallback(() => handleSwipe("SKIP"), [handleSwipe]);
  const onSwipeRight = useCallback(() => handleSwipe("SKIP"), [handleSwipe]);

  // Placeholder for future monetization: message on swipe
  const onMessagePress = useCallback(() => {
    console.log("TODO: Paid message flow");
  }, []);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.deckWrapper}>
        {/* --------------------------------------------------------------
            LOCATION NOT READY → User must enable permissions
           -------------------------------------------------------------- */}
        {!locationReady ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>Enable Location</Text>
            <Text style={styles.emptySubtitle}>
              Location is required to find nearby people.
            </Text>

            <TouchableOpacity style={styles.actionBtn} onPress={requireLocation}>
              <Text style={styles.actionText}>Retry</Text>
            </TouchableOpacity>
          </View>

        /* --------------------------------------------------------------
           HAS PROFILES → Show swipe deck
           -------------------------------------------------------------- */
        ) : currentProfile ? (
          <SwipeDeck
            profiles={profiles}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
          />

        /* --------------------------------------------------------------
           EMPTY QUEUE
           -------------------------------------------------------------- */
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>Sorry!</Text>
            <Text style={styles.emptySubtitle}>
              Nobody nearby. Try again later.
            </Text>

            <TouchableOpacity style={styles.actionBtn} onPress={shuffle}>
              <Text style={styles.actionText}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* BOTTOM ACTION BUTTONS */}
      <BottomButtons
        disabled={interactionDisabled || !locationReady}
        onUndo={undoLast}
        onLike={() => handleSwipe("LIKE")}
        onMessage={onMessagePress}
      />

      {/* NAVIGATION BAR */}
      <BottomNavBar navigation={navigation} active="swipe" />

      {/* MATCH MODAL */}
      <MatchModal
        visible={matchOpen}
        mePhoto={matchPhotos.me}
        themPhoto={matchPhotos.them}
        onClose={() => setMatchOpen(false)}
        onMessage={() => {
          setMatchOpen(false);
          navigation.navigate("Messages");
        }}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },

  // Swipe deck area (subtract space for BottomButtons)
  deckWrapper: { flex: 1, marginBottom: 120 },

  // Shared empty/error UI
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  actionBtn: {
    marginTop: 20,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionText: { color: "#222", fontSize: 18, fontWeight: "600" },

  emptyTitle: { fontSize: 24, fontWeight: "bold", color: "white" },
  emptySubtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },
});
