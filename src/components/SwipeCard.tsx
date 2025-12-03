import { View, Text, Image, StyleSheet, Animated } from "react-native";
import type { UserProfile } from "../types/user";
import { getDatingPreferenceLabel } from "../utils/datingPreference";

interface Props {
  profile: UserProfile;
  likeOpacity?: Animated.AnimatedInterpolation<string | number>;
  nopeOpacity?: Animated.AnimatedInterpolation<string | number>;
}

export function SwipeCard({ profile, likeOpacity, nopeOpacity }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: profile.profileImageUrl }} style={styles.photo} />

      {likeOpacity && (
        <Animated.View
          style={[styles.badge, styles.like, { opacity: likeOpacity }]}
        >
          <Text style={styles.badgeText}>LIKE</Text>
        </Animated.View>
      )}

      {nopeOpacity && (
        <Animated.View
          style={[styles.badge, styles.nope, { opacity: nopeOpacity }]}
        >
          <Text style={styles.badgeText}>NOPE</Text>
        </Animated.View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>
          {profile.name.split(" ")[0]}, {profile.age}
        </Text>

        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        ) : null}

        {profile.datingPreference && (
          <View style={styles.prefPill}>
            <Text style={styles.prefText}>
              {getDatingPreferenceLabel(profile.datingPreference, profile.age)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  photo: {
    width: "100%",
    height: "75%",
  },

  info: {
    padding: 16,
  },

  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },

  bio: {
    color: "#ccc",
    marginTop: 8,
  },

  prefPill: {
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  prefText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },

  badge: {
    position: "absolute",
    top: 40,
    padding: 10,
    borderWidth: 3,
    borderRadius: 8,
  },

  like: { left: 20, borderColor: "#4CAF50" },
  nope: { right: 20, borderColor: "#F44336" },

  badgeText: {
    fontSize: 30,
    fontWeight: "800",
    color: "white",
  },
});
