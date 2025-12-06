// src/screens/messages/MessagesScreen.tsx
// ============================================================================
// MessagesScreen
//
// Purpose:
//   • Display all *active message threads* (threads where at least one message
//     has been sent between the match partners).
//   • Navigate into a specific ChatScreen when tapped.
//   • Show loading state and empty state.
//
// Data Source:
//   • useChatThreads() → fetches threads from /chat/threads
//       Returns:
//         threads[]: Array<MatchThread>
//         loading: boolean
//   • Each MatchThread item includes:
//         threadId: string
//         user: { uid, name, profileImageUrl }
//         lastMessage: string | null
//         lastTimestamp: number
//
// UI:
//   • Header: "Messages"
//   • FlatList of message threads
//   • Tap row → navigate to ChatScreen(threadId, targetId)
//   • BottomNavBar for navigation
// ============================================================================

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { BottomNavBar } from "../../components/BottomNavBar";
import { useChatThreads } from "../../hooks/useChatThreads";
import type { MatchThread } from "../../types/chat";

export default function MessagesScreen({ navigation }: any) {
  // ----------------------------------------------------------------------------
  // Load user’s active message threads.
  //
  // useChatThreads():
  //   • Fetches list from backend
  //   • Subscribes to socket "threadUpdated" events
  //   • Sorts by lastTimestamp (most recent first)
  // ----------------------------------------------------------------------------
  const { threads, loading } = useChatThreads();

  // ----------------------------------------------------------------------------
  // Renders each thread row:
  //   • other.name         → partner's name
  //   • item.lastMessage   → preview (or fallback)
  //   • Tap → open ChatScreen(threadId, targetId)
  // ----------------------------------------------------------------------------
  const renderItem = ({ item }: { item: MatchThread }) => {
    const other = item.user; // partner profile summary
    const last = item.lastMessage || "Say hi 👋"; // fallback preview

    return (
      <TouchableOpacity
        key={item.threadId}
        style={styles.row}
        onPress={() =>
          navigation.navigate("Chat", {
            threadId: item.threadId,
            targetId: other.uid, // UID of conversation partner
          })
        }
      >
        <Text style={styles.user}>{other.name}</Text>

        <Text style={styles.preview} numberOfLines={1}>
          {last}
        </Text>
      </TouchableOpacity>
    );
  };

  // ----------------------------------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>

      {/* LOADING STATE */}
      {loading && (
        <Text style={styles.placeholder}>Loading...</Text>
      )}

      {/* EMPTY STATE */}
      {!loading && threads.length === 0 && (
        <Text style={styles.placeholder}>No messages yet.</Text>
      )}

      {/* THREAD LIST */}
      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item) => item.threadId}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} active="messages" />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222222", padding: 20 },

  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 50,
  },

  placeholder: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },

  row: {
    marginBottom: 14,
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 12,
  },

  user: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  preview: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
  },
});
