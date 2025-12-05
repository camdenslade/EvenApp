// src/screens/profile/ProfileScreen.tsx
import { useEffect, useState } from "react";
import {
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { apiGet } from "../../services/apiService";
import { BottomNavBar } from "../../components/BottomNavBar";
import { RatingGauge } from "../reviews/RatingGauge";

interface UserProfileData {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  sex: "male" | "female" | "other";
  sexPreference: "male" | "female" | "everyone";
  datingPreference:
    | "hookups"
    | "situationship"
    | "short_term_relationship"
    | "short_term_open"
    | "long_term_open"
    | "long_term_relationship";
}

interface ReviewSummary {
  average: number | null;
  count: number;
  best: number | null;
}


const COLORS = {
  bg: "#222222",
  surface: "#1c1c1c",
  surfaceAlt: "#1a1a1a",
  textPrimary: "white",
  textSecondary: "#aaa",
  textMuted: "#777",
  white: "white",
  black: "black",
  primary: "white",
};

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<"getmore" | "safety" | "reviews">("reviews");

  const [reviewSummary, setReviewSummary] = useState<{
    average: number | null;
    count: number;
    best: number | null;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const summary = await apiGet<ReviewSummary>("/reviews/summary/me");
        if (summary && typeof summary === "object") {
          setReviewSummary({
            average: summary.average ?? null,
            count: summary.count ?? 0,
            best: summary.best ?? null,
          });
        } else {
          setReviewSummary(null);
        }

        const data = await apiGet<UserProfileData>("/profiles/me");
        if (data) setProfile(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.error}>Could not load profile. Try again.</Text>
      </View>
    );
  }

  const mainPhoto = profile.photos[0] ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={styles.scrollWrap}>

        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={styles.gearButton}
          >
            <Image
              source={require("../../../assets/icons/gear.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileWrap}>
          <View style={styles.photoBorder}>
            {mainPhoto ? (
              <Image source={{ uri: mainPhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.missingPhoto}>
                <Text style={{ color: "#777" }}>No Photo</Text>
              </View>
            )}
          </View>

          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileAge}>{profile.age}</Text>
        </View>

        <View style={styles.tabsRow}>
          {["getmore", "safety", "reviews"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t as any)}
              style={[styles.tab, activeTab === t && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t && styles.tabTextActive,
                ]}
              >
                {t === "getmore"
                  ? "Get More"
                  : t === "safety"
                  ? "Safety"
                  : "Reviews"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "reviews" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Ratings</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rating Overview</Text>

              {reviewSummary && reviewSummary.count > 0 ? (
                <RatingGauge
                  average={reviewSummary.average ?? 0}
                  count={reviewSummary.count}
                  best={reviewSummary.best ?? 0}
                />
              ) : (
                <Text style={styles.cardText}>You have no reviews yet.</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("ReviewsList")}
            >
              <Text style={styles.cardTitle}>View All Reviews</Text>
              <Text style={styles.cardText}>
                See all ratings and comments others have left.
              </Text>
            </TouchableOpacity>
          </View>
        )}


        {activeTab === "getmore" && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Odd: Monthly Subscription</Text>
              <Text style={styles.cardText}>
                Gain free searches, messages, and undo's.
              </Text>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryText}>More Info</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.subCard}
              onPress={() => navigation.navigate("Search")}
            >
              <Text style={styles.subCardTitle}>Search</Text>
              <Text style={styles.subCardText}>
                Search for a user by name within your radius.
              </Text>
            </TouchableOpacity>

            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>Messages</Text>
              <Text style={styles.subCardText}>
                Send that first message.
              </Text>
            </View>
          </View>
        )}

        {activeTab === "safety" && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Safety Center</Text>
              <Text style={styles.cardText}>
                Tips & tools to stay safe while dating.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollWrap: {
    paddingTop: 10,
    paddingBottom: 160,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loadingText: { color: COLORS.textPrimary, marginTop: 10 },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  error: { color: COLORS.textPrimary, fontSize: 16 },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    marginBottom: 20,
    alignItems: "center",
    marginTop: 50,
  },
  gearButton: {
    padding: 8,
  },
  icon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
    tintColor: "white",
  },
  profileWrap: { alignItems: "center", marginBottom: 10 },
  photoBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: "hidden",
    position: "relative",
  },
  profilePhoto: { width: "100%", height: "100%" },
  missingPhoto: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
  },
  profileAge: { color: COLORS.textSecondary, fontSize: 18 },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
  },
  tab: { paddingBottom: 6 },
  tabActive: { borderBottomColor: COLORS.white, borderBottomWidth: 3 },
  tabText: { color: COLORS.textMuted, fontSize: 18 },
  tabTextActive: { color: COLORS.white },
  section: { paddingHorizontal: 20, marginTop: 10 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  subCard: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  subCardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subCardText: { color: COLORS.textSecondary },
  primaryButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 30,
  },
  primaryText: {
    color: COLORS.black,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 14,
  },
});
