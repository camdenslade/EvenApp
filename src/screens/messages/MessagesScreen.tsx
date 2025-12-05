// src/screens/messages/MessagesScreen.tsx
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
  const { threads, loading } = useChatThreads();

  const renderItem = ({ item }: { item: MatchThread }) => {
    const other = item.user; // correct field
    const last = item.lastMessage || "Say hi 👋";

    return (
      <TouchableOpacity
        key={item.threadId}
        style={styles.row}
        onPress={() =>
          navigation.navigate("Chat", {
            threadId: item.threadId,
            targetId: other.uid, // EXACT field from your type
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>

      {loading && (
        <Text style={styles.placeholder}>Loading...</Text>
      )}

      {!loading && threads.length === 0 && (
        <Text style={styles.placeholder}>No messages yet.</Text>
      )}

      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item) => item.threadId}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

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
