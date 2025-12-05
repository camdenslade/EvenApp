// src/screens/profile/UserProfileViewScreen.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { apiGet, apiPost } from "../../services/apiService";
import { RatingGauge } from "../reviews/RatingGauge";


interface ProfileView {
  uid: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
}

interface ReviewSummary {
  average: number | null;
  count: number;
}

const { width } = Dimensions.get("window");

export default function UserProfileViewScreen({ route, navigation }: any) {
  const { userId } = route.params;

  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await apiGet<ProfileView>(`/profiles/${userId}`);
        const r = await apiGet<ReviewSummary>(`/reviews/summary/${userId}`);

        if (p) setProfile(p);
        if (r) setSummary(r);
      } catch (err) {
        console.error("Failed to load profile view:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const startChat = async () => {
    const data = await apiPost<{ threadId: string }>("/chat/start", {
      targetId: userId,
    });

    if (data?.threadId) {
      navigation.navigate("Chat", {
        threadId: data.threadId,
        targetId: userId,
      });
    }
  };

  const writeReview = () => {
    navigation.navigate("ReviewWrite", { targetId: userId });
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width, height: width * 1.2 }}
      >
        {profile.photos.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={styles.photo} />
        ))}
      </ScrollView>

      <Text style={styles.name}>
        {profile.name}, {profile.age}
      </Text>

      {summary && summary.count > 0 ? (
        <RatingGauge 
            average={summary.average ?? 0} 
            count={summary.count} 
            best={10} 
        />
        ) : (
        <Text style={styles.noReviews}>No reviews yet</Text>
        )}



      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.bio}>{profile.bio || "No bio provided."}</Text>

      {profile.interests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsWrap}>
            {profile.interests.map((int, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{int}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button} onPress={startChat}>
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAlt} onPress={writeReview}>
          <Text style={styles.buttonAltText}>Leave Review</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },

  photo: {
    width: width,
    height: width * 1.2,
    resizeMode: "cover",
  },

  name: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  rating: {
    paddingHorizontal: 20,
    color: "#ccc",
    marginTop: 4,
    fontSize: 16,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    paddingHorizontal: 20,
  },

  bio: {
    color: "#ccc",
    paddingHorizontal: 20,
    marginTop: 6,
    fontSize: 16,
    lineHeight: 22,
  },

  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  interestTag: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },

  interestText: {
    color: "white",
    fontSize: 14,
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
  },

  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },

  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonAlt: {
    backgroundColor: "#444",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    flex: 1,
  },

  buttonAltText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  noReviews: {
    color: "#ccc",
    paddingHorizontal: 20,
    marginTop: 10,
    fontSize: 16,
    textAlign: "left",
    },
});
