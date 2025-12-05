// src/screens/matches/MatchesScreen.tsx
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

interface UnmessagedMatch {
  threadId: string;
  user: {
    uid: string;
    name: string;
    photoUrl: string | null;
  };
  matchedAt: number;
}

export default function MatchesScreen({ navigation }: any) {
  const [matches, setMatches] = useState<UnmessagedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UnmessagedMatch[]>("/matches/unmessaged");
        if (Array.isArray(data)) setMatches(data);
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches</Text>

      {loading && (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      )}

      {!loading && matches.length === 0 && (
        <Text style={styles.placeholder}>
          You don't have any new matches yet.
        </Text>
      )}

      <ScrollView style={{ flex: 1 }}>
        {matches.map((m) => (
          <TouchableOpacity
            key={m.threadId}
            style={styles.row}
            onPress={() =>
              navigation.navigate("Chat", {
                threadId: m.threadId,
                targetId: m.user.uid,
              })
            }
          >
            <Image
              source={{
                uri: m.user.photoUrl || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />

            <View style={styles.textCol}>
              <Text style={styles.name}>{m.user.name}</Text>
              <Text style={styles.sub}>Tap to start chatting</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavBar navigation={navigation} active="matches" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222", padding: 20 },

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

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
  },

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
