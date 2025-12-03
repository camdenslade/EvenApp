// src/screens/messages/MessagesScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { BottomNavBar } from "../../components/BottomNavBar";
import { useChatThreads } from "../../hooks/useChatThreads";
import type { MatchThread } from "../../types/chat";

export default function MessagesScreen({ navigation }: any) {
  const { threads, loading } = useChatThreads();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>

      <ScrollView style={{ flex: 1 }}>
        {!loading && threads.length === 0 && (
          <Text style={styles.placeholder}>No messages yet.</Text>
        )}

        {threads.map((t: MatchThread) => (
          <TouchableOpacity
            key={t.threadId}
            style={styles.row}
            onPress={() =>
              navigation.navigate("Chat", {
                threadId: t.threadId,
                targetId: t.user.id,
              })
            }
          >
            <Text style={styles.user}>{t.user.name}</Text>

            <Text style={styles.preview} numberOfLines={1}>
              {t.lastMessage || "Say hi 👋"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavBar navigation={navigation} active="messages" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222222", padding: 20 },

  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },

  placeholder: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },

  row: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#111",
    borderRadius: 10,
  },

  user: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  preview: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
});
