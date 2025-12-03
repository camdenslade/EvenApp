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
import { apiGet, apiPost } from "../../services/apiService";
import { BottomNavBar } from "../../components/BottomNavBar";
import { clearTokens } from "../../services/authStorage";

interface UserProfileData {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  profileImageUrl: string;
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

const DATING_PREF_LABELS: Record<UserProfileData["datingPreference"], string> = {
  hookups: "Hookups Only",
  situationship: "Situationship",
  short_term_relationship: "Short-term Relationship",
  short_term_open: "Short-term, open to long",
  long_term_open: "Long-term, open to short",
  long_term_relationship: "Long-term Relationship",
};

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UserProfileData>("/me");
        if (data) setProfile(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  async function handleDelete() {
    await apiPost("/auth/delete", {});
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <Text style={styles.error}>Could not load profile. Please try again.</Text>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>
          {profile.name}, {profile.age}
        </Text>

        <Text style={styles.bio}>{profile.bio}</Text>

        <Text style={styles.label}>Sex: {profile.sex}</Text>

        <Text style={styles.label}>
          Interested in: {profile.sexPreference}
        </Text>

        <Text style={styles.label}>
          Dating preference: {DATING_PREF_LABELS[profile.datingPreference]}
        </Text>

        <Image
          source={{ uri: profile.profileImageUrl }}
          style={styles.photo}
        />

        {profile.photos.map((url) => (
          <Image key={url} source={{ uri: url }} style={styles.photo} />
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#222222" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },

  loadingText: { color: "white", marginTop: 10, fontSize: 16 },

  error: { color: "red", marginTop: 50, textAlign: "center" },

  header: { fontSize: 32, fontWeight: "600", color: "white" },

  bio: { color: "white", marginVertical: 10, fontSize: 16, lineHeight: 22 },

  label: { color: "white", fontSize: 16, marginBottom: 8 },

  photo: {
    width: "100%",
    height: 330,
    borderRadius: 12,
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: "#6a0dad",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  primaryText: { color: "white", textAlign: "center", fontSize: 18 },

  secondaryButton: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
  },
  secondaryText: { color: "white", textAlign: "center", fontSize: 18 },

  deleteButton: {
    backgroundColor: "#550000",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 140,
  },
  deleteText: {
    color: "#ff6666",
    textAlign: "center",
    fontSize: 18,
  },
});
