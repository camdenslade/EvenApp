// src/screens/profile/SearchScreen.tsx
// ============================================================================
// SearchScreen
//
// PURPOSE:
//   Allows users to manually search for other users by FIRST NAME.
//   Shows results with:
//     • name, age, distance
//     • photo
//     • bio preview
//     • rating summary (RatingGauge)
//
// API FLOW:
//   1. User types a name (firstName)
//   2. GET /search/name?firstName=X&radius=25 → list of profiles
//   3. For each result, GET /reviews/summary/{userId}
//   4. Results displayed in scrollable list
//
// BEHAVIOR:
//   • Displays loading indicator during full search
//   • Handles empty field validation
//   • Handles backend failures gracefully
//   • Navigates to UserProfileView on card press
//
// NOTES:
//   • RatingGauge loads per-user review summary
//   • Distance shown in miles (fixed 1 decimal place)
// ============================================================================

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

// Result object returned from `/search/name`
interface SearchResult {
  id: string;
  firstName: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  distanceMiles: number;
}

// Rating summary per user
interface RatingSummary {
  average: number | null;
  count: number;
}

export default function SearchScreen({ navigation }: any) {
  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  const [query, setQuery] = useState(""); // Name input
  const [loading, setLoading] = useState(false); // Search in progress
  const [results, setResults] = useState<SearchResult[]>([]); // Found profiles
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({}); // UserId → RatingSummary
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // handleSearch()
  //
  // Executes the full search process:
  //   1. Validate input
  //   2. GET name search results
  //   3. For each result → GET rating summary
  //   4. Store everything in state
  // ============================================================================
  async function handleSearch() {
    setError(null);
    setLoading(true);
    setResults([]);
    setRatings({});

    // ---- Validate ----
    if (!query.trim()) {
      setError("Enter a first name.");
      setLoading(false);
      return;
    }

    // ---- Search Request ----
    const data = await apiGet<SearchResult[]>(
      `/search/name?firstName=${encodeURIComponent(query.trim())}&radius=25`
    );

    if (!data) {
      setError("Search failed.");
      setLoading(false);
      return;
    }

    setResults(data);

    // ---- Load Rating Summaries for each user ----
    const summaries: Record<string, RatingSummary> = {};

    // NOTE:
    //   This is sequential. You *can* optimize by batching or parallelizing later.
    for (const r of data) {
      const summary = await apiGet<RatingSummary>(`/reviews/summary/${r.id}`);
      summaries[r.id] = summary || { average: null, count: 0 };
    }

    setRatings(summaries);
    setLoading(false);
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={styles.container}>
      {/* Back Navigation */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Search by Name</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      {/* Execute Search */}
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      )}

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Search Results List */}
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
              {/* Profile Photo */}
              <Image
                source={{ uri: r.photoUrl ?? undefined }}
                style={styles.avatar}
              />

              {/* User Info */}
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

              {/* Rating Gauge */}
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

        {/* No Results */}
        {results.length === 0 && !loading && !error && (
          <Text style={styles.noResults}>No results yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
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

  // Result Card
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
