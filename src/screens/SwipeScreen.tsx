// src/screens/SwipeScreen.tsx
import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

import { useSwipeQueue } from "../hooks/useSwipeQueue";
import SwipeDeck from "../components/SwipeDeck";
import { BottomButtons } from "../components/BottomButtons";
import { BottomNavBar } from "../components/BottomNavBar";
import { MatchModal } from "../components/MatchModal";
import { useLocation } from "../hooks/useLocation";

export default function SwipeScreen({ navigation }: any) {
  const {
    profiles,
    state,
    currentProfile,
    handleSwipe,
    undoLast,
    shuffle,
  } = useSwipeQueue();

  const { requireLocation } = useLocation();

  const interactionDisabled = state.status !== "IDLE";

  const [matchOpen, setMatchOpen] = useState(false);
  const [matchPhotos, setMatchPhotos] = useState({ me: "", them: "" });

  const [locationReady, setLocationReady] = useState(false);

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

  useEffect(() => {
    if (state.status === "MATCH_FOUND") {
      setMatchPhotos({
        me: state.mePhoto ?? "",
        them: state.themPhoto ?? "",
      });
      setMatchOpen(true);
    }
  }, [state]);

  const onSwipeLeft = useCallback(() => handleSwipe("SKIP"), [handleSwipe]);
  const onSwipeRight = useCallback(() => handleSwipe("SKIP"), [handleSwipe]);
  const onMessagePress = useCallback(() => {
    console.log("TODO: Paid message flow");
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.deckWrapper}>
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
        ) : currentProfile ? (
          <SwipeDeck
            profiles={profiles}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
          />
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

      <BottomButtons
        disabled={interactionDisabled || !locationReady}
        onUndo={undoLast}
        onLike={() => handleSwipe("LIKE")}
        onMessage={onMessagePress}
      />

      <BottomNavBar navigation={navigation} active="swipe" />

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  deckWrapper: { flex: 1, marginBottom: 120 },

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
