// src/screens/matches/MatchesScreen.tsx
// ============================================================================
// MatchesScreen
// Purpose:
//   Displays all *new matches* where neither user has sent the first message.
//   Each match links to a chat thread. Shows loading state, empty state,
//   and a scrollable list of match cards.
//
// Backend endpoint:
//   GET /matches/unmessaged
//
// Returned structure:
//   [
//     {
//       threadId: string,
//       user: { uid, name, photoUrl },
//       matchedAt: number
//     }
//   ]
//
// Navigation:
//   On selecting a match → navigate("Chat", { threadId, targetId })
// ============================================================================

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";

import { BottomNavBar } from "../../components/BottomNavBar";
import { apiGet } from "../../services/apiService";

// Shape of a match item returned from /matches/unmessaged
interface UnmessagedMatch {
  threadId: string;
  user: {
    uid: string;
    name: string;
    photoUrl: string | null;
  };
  matchedAt: number; // UNIX timestamp from backend
}

export default function MatchesScreen({ navigation }: any) {
  // --------------------------------------------------------------------------
  // STATE: Array of new matches
  // --------------------------------------------------------------------------
  const [matches, setMatches] = useState<UnmessagedMatch[]>([]);

  // --------------------------------------------------------------------------
  // STATE: Loading indicator for initial fetch
  // --------------------------------------------------------------------------
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // EFFECT: Fetch matches once on mount
  //
  // - Calls GET /matches/unmessaged
  // - Updates matches[] state
  // - Stops loading indicator
  //
  // Errors are logged but not surfaced to UI.
  // --------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UnmessagedMatch[]>("/matches/unmessaged");

        // Defensive: ensure backend returned an array
        if (Array.isArray(data)) setMatches(data);
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Page title */}
      <Text style={styles.header}>Matches</Text>

      {/* Loading indicator */}
      {loading && (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      )}

      {/* Empty state (only shown when not loading) */}
      {!loading && matches.length === 0 && (
        <Text style={styles.placeholder}>
          You don't have any new matches yet.
        </Text>
      )}

      {/* Matches list */}
      <ScrollView style={{ flex: 1 }}>
        {matches.map((m) => (
          <TouchableOpacity
            key={m.threadId}
            style={styles.row}
            // On tap: open chat with correct threadId + partner ID
            onPress={() =>
              navigation.navigate("Chat", {
                threadId: m.threadId,
                targetId: m.user.uid,
              })
            }
          >
            {/* Match partner profile picture */}
            <Image
              source={{
                uri: m.user.photoUrl || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />

            {/* Name and subtitle */}
            <View style={styles.textCol}>
              <Text style={styles.name}>{m.user.name}</Text>
              <Text style={styles.sub}>Tap to start chatting</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} active="matches" />
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    padding: 20,
  },

  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 50,
  },

  placeholder: {
    color: "#aaa",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },

  // One row in the match list
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
  },

  // Match avatar
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },

  textCol: { flex: 1 },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  sub: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 14,
  },
});
