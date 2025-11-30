import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";

interface UserProfileData {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  sex: "male" | "female";
  interestedInSex: "male" | "female" | "everyone";
}

export default function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UserProfileData>("/me");
        if (data) {
          setProfile(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {profile.name}, {profile.age}
      </Text>

      <Text style={styles.bio}>{profile.bio}</Text>

      <Text style={styles.label}>Sex: {profile.sex}</Text>

      <Text style={styles.label}>
        Interested in: {profile.interestedInSex}
      </Text>

      {profile.photos.map((url) => (
        <Image
          key={url}
          source={{ uri: url }}
          style={styles.photo}
        />
      ))}

      <TouchableOpacity
        onPress={() => navigation.navigate("EditProfile")}
        style={styles.editButton}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "black", flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" },
  loadingText: { color: "white", marginTop: 10, fontSize: 16 },
  error: { color: "red", marginTop: 50, textAlign: "center" },
  header: { fontSize: 32, fontWeight: "600", color: "white" },
  bio: { color: "white", marginVertical: 10 },
  label: { color: "white", fontSize: 16, marginBottom: 8 },
  photo: {
    width: "100%",
    height: 330,
    borderRadius: 12,
    marginBottom: 14,
  },
  editButton: {
    backgroundColor: "#6a0dad",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  editText: { color: "white", textAlign: "center", fontSize: 18 },
});