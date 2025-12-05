// src/screens/profile/SearchScreen.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

import { apiGet } from "../../services/apiService";
import { RatingGauge } from "../reviews/RatingGauge";

interface SearchResult {
  id: string;
  firstName: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  distanceMiles: number;
}

interface RatingSummary {
  average: number | null;
  count: number;
}

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setError(null);
    setLoading(true);
    setResults([]);
    setRatings({});

    if (!query.trim()) {
      setError("Enter a first name.");
      setLoading(false);
      return;
    }

    const data = await apiGet<SearchResult[]>(
      `/search/name?firstName=${encodeURIComponent(query.trim())}&radius=25`
    );

    if (!data) {
      setError("Search failed.");
      setLoading(false);
      return;
    }

    setResults(data);

    const summaries: Record<string, RatingSummary> = {};
    for (const r of data) {
      const summary = await apiGet<RatingSummary>(`/reviews/summary/${r.id}`);
      summaries[r.id] = summary || { average: null, count: 0 };
    }

    setRatings(summaries);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Search by Name</Text>

      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={styles.results}>
        {results.map((r) => {
          const rating = ratings[r.id];

          return (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("UserProfileView", {
                  userId: r.id,
                })
              }
            >
              <Image
                source={{ uri: r.photoUrl ?? undefined }}
                style={styles.avatar}
              />

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {r.firstName}, {r.age}
                </Text>

                <Text style={styles.cardDistance}>
                  {r.distanceMiles.toFixed(1)} miles away
                </Text>

                <Text numberOfLines={2} style={styles.cardBio}>
                  {r.bio}
                </Text>
              </View>

              <View style={styles.gaugeWrap}>
                {rating ? (
                  <RatingGauge
                    average={rating.average ?? 0}
                    count={rating.count}
                    best={10}
                  />
                ) : (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {results.length === 0 && !loading && !error && (
          <Text style={styles.noResults}>No results yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222", padding: 20 },

  backButton: { position: "absolute", top: 45, left: 20, zIndex: 10 },
  backArrow: { color: "white", fontSize: 32, fontWeight: "600" },

  header: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 80,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },

  searchBtn: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  searchText: { color: "#222", fontSize: 18, fontWeight: "600" },

  loadingWrap: { marginTop: 20, alignItems: "center" },
  loadingText: { color: "white", marginTop: 10 },

  error: { color: "#ff5555", marginBottom: 10, textAlign: "center" },

  results: { marginTop: 10 },

  card: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: { width: 70, height: 70, borderRadius: 10, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { color: "white", fontSize: 18, fontWeight: "700" },
  cardDistance: { color: "#aaa", marginTop: 2 },
  cardBio: { color: "#ccc", marginTop: 4, fontSize: 14 },

  gaugeWrap: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  noResults: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
