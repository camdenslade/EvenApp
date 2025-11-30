// app/screens/SwipeScreen.tsx

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import useSwipeQueue from "../hooks/useSwipeQueue";
import { useNavigation } from "@react-navigation/native";

export default function SwipeScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { state, currentProfile, handleSwipe } = useSwipeQueue();

  const disabled = state.status !== "IDLE";

  let body: React.ReactElement;

  if (state.status === "LOADING") {
    body = <Text style={styles.status}>Loading…</Text>;
  } else if (state.status === "ERROR") {
    body = (
      <View>
        <Text style={styles.error}>Error: {state.errorMessage}</Text>
      </View>
    );
  } else if (state.status === "MATCH_FOUND") {
    body = (
      <View style={styles.matchBox}>
        <Text style={styles.matchTitle}>
          You matched with {state.newMatch.otherUser.name}!
        </Text>
      </View>
    );
  } else if (!currentProfile) {
    body = (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>No Profiles</Text>
        <Text style={styles.emptySubtitle}>Check back soon.</Text>
      </View>
    );
  } else {
    body = (
      <View style={styles.card}>
        <Image
          source={{ uri: currentProfile.profileImageUrl }}
          style={styles.photo}
        />
        <Text style={styles.name}>
          {currentProfile.name}, {currentProfile.age}
        </Text>
        <Text style={styles.location}>
          {currentProfile.age}
        </Text>
        <Text style={styles.bio}>{currentProfile.bio}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>

      {body}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.skip]}
          disabled={disabled}
          onPress={() => handleSwipe("SKIP")}
        >
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.like]}
          disabled={disabled}
          onPress={() => handleSwipe("LIKE")}
        >
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.super]}
          disabled={disabled}
          onPress={() => handleSwipe("SUPER_LIKE")}
        >
          <Text style={styles.buttonText}>Super Like</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stateText}>State: {state.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "black", flex: 1 },
  photo: { width: "100%", height: 300, borderRadius: 12 },
  card: {
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 14,
  },
  name: { color: "white", fontSize: 20, marginTop: 12 },
  location: { color: "#bbb" },
  bio: { color: "#ccc", marginTop: 8 },
  status: { color: "white" },
  error: { color: "red" },
  matchBox: { padding: 20 },
  matchTitle: { color: "#4cd137", fontSize: 20 },
  emptyBox: { padding: 40, alignItems: "center" },
  emptyTitle: { color: "white", fontSize: 22 },
  emptySubtitle: { color: "#aaa", marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-around", marginTop: 30 },
  button: {
    padding: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  skip: { backgroundColor: "#f39c12" },
  like: { backgroundColor: "#3498db" },
  super: { backgroundColor: "#9b59b6" },
  buttonText: { color: "white" },
  stateText: { color: "#888", marginTop: 20 },
  profileButton: { alignSelf: "flex-end", marginBottom: 12 },
  profileButtonText: { color: "#3498db", fontSize: 16 },
});