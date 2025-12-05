// src/screen/messages/ChatScreen.tsx
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
  const { threadId, targetId } = route.params;

  const { messages, sendMessage } = useChatThread(threadId);

  const [uid, setUid] = useState<string | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  // JOIN THREAD ROOM
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinThread", { threadId });

    return () => {
      socket.emit("leaveThread", { threadId });
    };
  }, [threadId]);

  const writeReview = () => {
    navigation.navigate("ReviewWrite", { targetId });
  };

  const send = () => {
    if (!text.trim()) return;

    sendMessage(text.trim());
    setText("");
  };

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

  return (
    <View style={styles.container}>
      {targetId && (
        <TouchableOpacity style={styles.reviewButton} onPress={writeReview}>
          <Text style={styles.reviewButtonText}>Review</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={messages}
        keyExtractor={(m) => m.uid}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 50 }}
      />

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
