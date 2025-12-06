// src/screens/reviews/ReviewDetailScreen.tsx
// ============================================================================
// ReviewDetailScreen
// Purpose:
//   Displays a single review in full detail, including:
//     • Reviewer name + photo
//     • Rating visualized via RatingGauge
//     • Written comment
//     • Date posted
//     • Optional "Report" action (UI only for now)
//
// Endpoint:
//   GET /reviews/:reviewId
//
// Returned structure shape:
//   {
//     id: string,
//     rating: number (0–10),
//     comment: string,
//     createdAt: number (UNIX timestamp),
//     reviewer: { uid, name, photoUrl }
//   }
//
// Navigation:
//   Expects route.params.reviewId
//
// Notes:
//   - Shows spinner while loading.
//   - Displays placeholder avatar if missing.
//   - Wraps content in ScrollView for long comments.
// ============================================================================

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { apiGet } from "../../services/apiService";
import { RatingGauge } from "./RatingGauge";

// Type describing one full review
interface ReviewDetail {
  id: string;
  rating: number; // Numerical score (0–10)
  comment: string;
  createdAt: number;
  reviewer: {
    uid: string;
    name: string;
    photoUrl: string | null;
  };
}

export default function ReviewDetailScreen({ route, navigation }: any) {
  const { reviewId } = route.params;

  // --------------------------------------------------------------------------
  // STATE: stores fetched review or null before load
  // --------------------------------------------------------------------------
  const [review, setReview] = useState<ReviewDetail | null>(null);

  // Loading state for fetch
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // EFFECT: Fetch review detail on mount
  //
  // - Calls GET /reviews/:reviewId
  // - Sets review state
  // - Stops loading indicator
  //
  // Errors logged silently.
  // --------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<ReviewDetail>(`/reviews/${reviewId}`);
        if (data) setReview(data);
      } catch (err) {
        console.error("Failed to load review detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reviewId]);

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (loading || !review) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Format date for display
  const formatted = new Date(review.createdAt).toLocaleDateString();

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* --------------------------------------------------------------
          Reviewer Information block
        -------------------------------------------------------------- */}
      <View style={styles.reviewerRow}>
        <Image
          source={{
            uri: review.reviewer.photoUrl || "https://via.placeholder.com/80",
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
          <Text style={styles.date}>{formatted}</Text>
        </View>
      </View>

      {/* --------------------------------------------------------------
          Rating visualization
        -------------------------------------------------------------- */}
      <RatingGauge 
        average={review.rating}
        count={1}
        best={10}
      />

      {/* --------------------------------------------------------------
          Text comment
        -------------------------------------------------------------- */}
      <Text style={styles.sectionTitle}>Review</Text>
      <Text style={styles.comment}>{review.comment}</Text>

      {/* --------------------------------------------------------------
          Report button (UI only)
        -------------------------------------------------------------- */}
      <TouchableOpacity style={styles.reportBtn}>
        <Text style={styles.reportText}>Report Review</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },

  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
  },

  reviewerName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  date: {
    color: "#bbb",
    marginTop: 4,
    fontSize: 14,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 20,
  },

  comment: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },

  reportBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },

  reportText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
  },
});
