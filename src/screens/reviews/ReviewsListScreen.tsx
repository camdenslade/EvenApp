// src/screens/reviews/ReviewsListScreen.tsx
// ============================================================================
// ReviewsListScreen
// Purpose:
//   Displays all reviews *received by the logged-in user*.
//
// Backend Endpoint:
//   GET /reviews/me
//
// Returned structure (ReviewItem):
//   [
//     {
//       id: string,
//       reviewerUid: string,
//       reviewerName?: string,
//       rating: number,
//       comment: string,
//       createdAt: string
//     }
//   ]
//
// Navigation:
//   Tapping a review → navigate("ReviewDetail", { reviewId })
//
// UI States:
//   • Loading spinner
//   • Empty state: "You have no reviews yet"
//   • Scrollable list of review cards
//
// Notes:
//   - Uses RatingGauge to render a circular score.
//   - Reviewer name falls back to UID if name missing.
//   - Comment preview is truncated to 2 lines.
// ============================================================================

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { apiGet } from "../../services/apiService";
import { RatingGauge } from "./RatingGauge";

// Shape of one review returned by backend
interface ReviewItem {
  id: string;
  reviewerUid: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName?: string | null;
}

// Color palette for screen styling
const COLORS = {
  bg: "#222222",
  surface: "#1c1c1c",
  textPrimary: "white",
  textSecondary: "#aaa",
  textMuted: "#666",
  white: "white",
};

export default function ReviewsListScreen({ navigation }: any) {
  // --------------------------------------------------------------------------
  // STATE: fetch status + list of reviews
  // --------------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  // --------------------------------------------------------------------------
  // EFFECT: Load all reviews for logged-in user
  //
  // - Calls GET /reviews/me
  // - Populates list, then turns off loading
  // --------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<ReviewItem[]>("/reviews/me");
        if (Array.isArray(data)) setReviews(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Navigate to detail page
  const openDetail = (id: string) => {
    navigation.navigate("ReviewDetail", { reviewId: id });
  };

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <View style={styles.container}>

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Reviews</Text>
      </View>

      {/* ------------------------------
          State: Loading
      ------------------------------ */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : 
      
      /* ------------------------------
          State: No Reviews
      ------------------------------ */
      reviews.length === 0 ? (
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>You have no reviews yet.</Text>
        </View>
      ) : 
      
      /* ------------------------------
          State: List of Reviews
      ------------------------------ */
      (
        <ScrollView contentContainerStyle={styles.scrollWrap}>
          {reviews.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.reviewCard}
              onPress={() => openDetail(r.id)}
            >
              {/* Rating circle */}
              <View style={styles.ratingWrapper}>
                <RatingGauge 
                  average={r.rating}
                  count={1}
                  best={10}
                />
              </View>

              {/* Right column: reviewer + comment */}
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewer}>
                  {r.reviewerName ?? r.reviewerUid}
                </Text>

                {r.comment ? (
                  <Text style={styles.comment} numberOfLines={2}>
                    {r.comment}
                  </Text>
                ) : (
                  <Text style={styles.commentMuted}>
                    No written comment provided.
                  </Text>
                )}

                <Text style={styles.date}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header layout
  header: {
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backArrow: { color: "white", fontSize: 32, fontWeight: "600" },

  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
  },

  // Empty + loading wrappers
  centerWrap: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 250,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },

  scrollWrap: {
    padding: 20,
    paddingBottom: 120,
  },

  // Review card layout
  reviewCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  ratingWrapper: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  reviewer: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  comment: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },

  commentMuted: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
  },

  date: {
    color: COLORS.textMuted,
    marginTop: 10,
    fontSize: 12,
  },
});
