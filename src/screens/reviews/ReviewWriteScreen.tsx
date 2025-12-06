// src/screens/reviews/ReviewWriteScreen.tsx
// ============================================================================
// ReviewWriteScreen
// Purpose:
//   Allows a user to write and submit a review about another user.
//
// Backend Endpoint:
//   POST /reviews
//
// Payload structure:
//   {
//     reviewerUid: string,
//     targetUid: string,
//     rating: number (1–10),
//     comment: string,
//     type: "normal" | "emergency" | "report"
//   }
//
// Navigation:
//   On success → navigation.goBack()
//
// UI Features:
//   • Select rating (1–10)
//   • Enter comment
//   • Choose review type (Normal, Emergency, Report)
//   • Validates input before sending
//   • Displays error alerts when invalid
//
// Notes:
//   - reviewerUid comes directly from Firebase auth
//   - Comment must be at least 2 characters
//   - Rating must be selected
// ============================================================================

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

import { getAuth } from "firebase/auth";
import { apiPost } from "../../services/apiService";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";

// Type for review category
type ReviewType = "normal" | "emergency" | "report";

// Navigation + route types
type ReviewWriteNavigationProp =
  NativeStackNavigationProp<RootStackParamList, "ReviewWrite">;

type ReviewWriteRouteProp =
  RouteProp<RootStackParamList, "ReviewWrite">;

// API response type
interface ReviewResponse {
  id?: string;
  error?: string;
}

interface Props {
  navigation: ReviewWriteNavigationProp;
  route: ReviewWriteRouteProp;
}

export default function ReviewWriteScreen({ navigation, route }: Props) {
  // Target UID: the person being reviewed
  const { targetId } = route.params;

  // Firebase auth user
  const auth = getAuth();
  const reviewerUid = auth.currentUser?.uid ?? null;

  // --------------------------------------------------------------------------
  // FORM STATE
  // --------------------------------------------------------------------------
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [type, setType] = useState<ReviewType>("normal");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------------------------------
  // SUBMIT HANDLER
  //
  // Validates the form before sending:
  //   • Must be logged in
  //   • Must choose rating
  //   • Comment must be at least 2 characters
  //
  // Sends POST /reviews if valid.
  // --------------------------------------------------------------------------
  const submit = async () => {
    // Must be logged in
    if (!reviewerUid) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    // Rating must be selected
    if (!rating) {
      Alert.alert("Error", "Please select a rating.");
      return;
    }

    // Validate comment
    if (comment.trim().length < 2) {
      Alert.alert("Error", "Comment must be at least 2 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        reviewerUid,
        targetUid: targetId,
        rating,
        comment,
        type,
      };

      const res = await apiPost<ReviewResponse>("/reviews", payload);

      // No response
      if (!res) {
        Alert.alert("Error", "No response from server.");
        return;
      }

      // Backend returned explicit error
      if (res.error) {
        Alert.alert("Error", res.error);
        return;
      }

      // Success
      Alert.alert("Success", "Your review has been submitted.");
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Title */}
      <Text style={styles.title}>Write a Review</Text>

      {/* RATING SECTION */}
      <Text style={styles.label}>Select Rating</Text>
      <View style={styles.ratingRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.ratingCircle,
              rating === num && styles.ratingCircleActive,
            ]}
            onPress={() => setRating(num)}
          >
            <Text
              style={[
                styles.ratingText,
                rating === num && { color: "#000" },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* COMMENT INPUT */}
      <Text style={styles.label}>Your Comment</Text>
      <TextInput
        style={styles.textBox}
        placeholder="Write your experience…"
        placeholderTextColor="#777"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      {/* REVIEW TYPE */}
      <Text style={styles.label}>Review Type</Text>
      <View style={styles.typeRow}>
        {(["normal", "emergency", "report"] as ReviewType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeButton,
              type === t && styles.typeButtonActive,
            ]}
            onPress={() => setType(t)}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === t && styles.typeButtonTextActive,
              ]}
            >
              {t === "normal"
                ? "Normal"
                : t === "emergency"
                ? "Emergency"
                : "Report"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.5 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Submitting…" : "Submit Review"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const COLORS = {
  bg: "#222",
  surface: "#1a1a1a",
  white: "#fff",
  muted: "#777",
  primary: "#fff",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },

  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  label: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },

  // Rating row: grid of circles 1–10
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  ratingCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },

  ratingCircleActive: {
    backgroundColor: COLORS.white,
  },

  ratingText: {
    color: COLORS.white,
    fontWeight: "600",
  },

  textBox: {
    backgroundColor: COLORS.surface,
    color: COLORS.white,
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: "top",
  },

  // Review type buttons
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  typeButtonActive: {
    backgroundColor: COLORS.white,
  },

  typeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },

  typeButtonTextActive: {
    color: "#000",
  },

  submitButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 40,
  },

  submitText: {
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
