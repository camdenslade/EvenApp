// src/screens/matches/MatchesScreen.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { BottomNavBar } from "../../components/BottomNavBar";
import { apiGet } from "../../services/apiService";

interface MatchRow {
  threadId: string;
  otherUser: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
  matchedAt: number;
}

export default function MatchesScreen({ navigation }: any) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await apiGet<MatchRow[]>("/matches/me");
        if (data) setMatches(data);
      } catch (error) {
        console.error("Failed to load matches:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches</Text>

      <ScrollView style={{ flex: 1 }}>
        {!loading && matches.length === 0 && (
          <Text style={styles.placeholder}>You don't have any matches yet.</Text>
        )}

        {matches.map((m) => (
          <TouchableOpacity
            key={m.threadId}
            style={styles.row}
            onPress={() =>
              navigation.navigate("Chat", {
                threadId: m.threadId,
                targetId: m.otherUser.id,
              })
            }
          >
            <Image
              source={{
                uri:
                  m.otherUser.profileImageUrl ||
                  "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />

            <View style={styles.textCol}>
              <Text style={styles.name}>{m.otherUser.name}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                Tap to start chatting
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavBar navigation={navigation} active="matches" />
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
    color: "#aaa",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  textCol: { flex: 1 },
  name: { color: "white", fontSize: 18, fontWeight: "600" },
  lastMsg: { color: "#aaa", marginTop: 4, fontSize: 14 },
});
