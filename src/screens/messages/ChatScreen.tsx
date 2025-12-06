// src/screens/messages/ChatScreen.tsx
// ============================================================================
// ChatScreen
// Purpose:
//   • Display and send messages within a specific chat thread
//   • Automatically receive real-time messages via WebSocket ("newMessage")
//   • Allow user to send messages via useChatThread()
//   • Offer a "Review" button to write a review of the chat partner
//
// Route Params:
//   threadId: string       → Which conversation to load
//   targetId: string       → UID of chat partner (used for review creation)
//
// Hooks used:
//   • useChatThread(threadId) → loads + streams messages, provides sendMessage()
//   • Firebase auth → identify current user
//   • socket.io → join and leave rooms for live updates
//
// UI Structure:
//   • Optional Review button (top-right)
//   • FlatList showing messages (auto-updating)
//   • Message input bar with Send button
// ============================================================================

import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useChatThread } from "../../hooks/useChatThread";
import { getSocket } from "../../services/socket";
import { auth } from "../../services/firebase";

export default function ChatScreen({ route, navigation }: any) {
  // Route parameters passed from MatchesScreen or MessagesScreen
  const { threadId, targetId } = route.params;

  // --------------------------------------------------------------------------
  // useChatThread → Provides:
  //   • messages[]      → All messages for this thread (auto-updates)
  //   • sendMessage()   → Push a message through websocket + backend
  // --------------------------------------------------------------------------
  const { messages, sendMessage } = useChatThread(threadId);

  // Authenticated user's UID (needed to style bubbles correctly)
  const [uid, setUid] = useState<string | null>(null);

  // Local input text for message typing
  const [text, setText] = useState("");

  // --------------------------------------------------------------------------
  // EFFECT: Retrieve Firebase UID on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  // --------------------------------------------------------------------------
  // EFFECT: Join WebSocket thread room on mount, leave on unmount
  //
  //   socket.emit("joinThread", { threadId })
  //   socket.emit("leaveThread", { threadId })
  //
  // useChatThread ALSO joins internally, but this ensures redundancy and
  // helps scenarios where screens remount quickly.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinThread", { threadId });

    return () => {
      socket.emit("leaveThread", { threadId });
    };
  }, [threadId]);

  // --------------------------------------------------------------------------
  // Navigate to Review screen
  // --------------------------------------------------------------------------
  const writeReview = () => {
    navigation.navigate("ReviewWrite", { targetId });
  };

  // --------------------------------------------------------------------------
  // SEND MESSAGE HANDLER
  //
  // - Prevent empty messages
  // - Send via useChatThread()
  // - Clear input
  // --------------------------------------------------------------------------
  const send = () => {
    if (!text.trim()) return;

    sendMessage(text.trim());
    setText("");
  };

  // --------------------------------------------------------------------------
  // RENDER A MESSAGE BUBBLE
  //
  //   item.senderId === uid → bubble on right (purple)
  //   else                  → bubble on left (gray)
  //
  // Backend shape may return senderId or sender.id; handle both.
  // --------------------------------------------------------------------------
  const renderMessage = ({ item }: any) => {
    const isMine =
      item.senderId === uid ||
      item.sender?.id === uid;

    return (
      <View
        style={[
          styles.messageBubble,
          {
            alignSelf: isMine ? "flex-end" : "flex-start",
            backgroundColor: isMine ? "#6a0dad" : "#E5E5EA",
          },
        ]}
      >
        <Text style={{ color: isMine ? "white" : "black" }}>
          {item.content ?? "[no content]"}
        </Text>
      </View>
    );
  };

  // --------------------------------------------------------------------------
  // MAIN UI
  // --------------------------------------------------------------------------
  return (
    <View style={styles.container}>

      {/* REVIEW BUTTON (only if targetId was passed into the route) */}
      {targetId && (
        <TouchableOpacity style={styles.reviewButton} onPress={writeReview}>
          <Text style={styles.reviewButtonText}>Review</Text>
        </TouchableOpacity>
      )}

      {/* MESSAGE LIST */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.uid}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 50 }}
      />

      {/* MESSAGE INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <Text style={{ color: "black", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222", padding: 20 },

  reviewButton: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 10,
  },
  reviewButtonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },

  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    color: "black",
  },

  sendBtn: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
