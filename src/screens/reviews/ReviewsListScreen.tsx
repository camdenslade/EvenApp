// src/screens/reviews/ReviewsListScreen.tsx
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

interface ReviewItem {
  id: string;
  reviewerUid: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName?: string | null;
}

const COLORS = {
  bg: "#222222",
  surface: "#1c1c1c",
  textPrimary: "white",
  textSecondary: "#aaa",
  textMuted: "#666",
  white: "white",
};

export default function ReviewsListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

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

  const openDetail = (id: string) => {
    navigation.navigate("ReviewDetail", { reviewId: id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Reviews</Text>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>You have no reviews yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollWrap}>
          {reviews.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.reviewCard}
              onPress={() => openDetail(r.id)}
            >
              <View style={styles.ratingWrapper}>
                <RatingGauge 
                  average={r.rating}
                  count={1}
                  best={10}
                />
              </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

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

  centerWrap: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 250
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },

  scrollWrap: {
    padding: 20,
    paddingBottom: 120,
  },

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
