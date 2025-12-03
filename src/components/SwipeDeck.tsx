// src/components/SwipeDeck.tsx
import { useRef, memo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
} from "react-native";
import type { UserProfile } from "../types/user";

interface Props {
  profiles: UserProfile[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function SwipeDeck({ profiles, onSwipeLeft, onSwipeRight }: Props) {
  const topCard = profiles[0] ?? null;
  const nextCard = profiles[1] ?? null;

  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-20deg", "0deg", "20deg"],
    extrapolate: "clamp",
  });

  const animatedCardStyle = {
    transform: [...pan.getTranslateTransform(), { rotate }],
  };

  const swipeOff = (toRight: boolean, dy: number) => {
    Animated.timing(pan, {
      toValue: { x: toRight ? 500 : -500, y: dy },
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      toRight ? onSwipeRight() : onSwipeLeft();
    });
  };

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,

      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: g.dy });
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx > 120) return swipeOff(true, g.dy);
        if (g.dx < -120) return swipeOff(false, g.dy);

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!topCard) return null;

  return (
    <View style={styles.container}>
      {/* Next card preview */}
      {nextCard && (
        <View style={styles.nextCard}>
          <Image
            source={{ uri: nextCard.profileImageUrl }}
            style={styles.image}
          />
          <View style={styles.infoBox}>
            <Text style={styles.name}>
              {nextCard.name}, {nextCard.age}
            </Text>
            {nextCard.bio ? <Text style={styles.bio}>{nextCard.bio}</Text> : null}
          </View>
        </View>
      )}

      <Animated.View
        style={[styles.card, animatedCardStyle]}
        {...responder.panHandlers}
      >
        <Image source={{ uri: topCard.profileImageUrl }} style={styles.image} />

        <View style={styles.infoBox}>
          <Text style={styles.name}>
            {topCard.name}, {topCard.age}
          </Text>

          {topCard.bio ? <Text style={styles.bio}>{topCard.bio}</Text> : null}

          {topCard.interests?.length > 0 && (
            <View style={styles.interestsRow}>
              {topCard.interests.slice(0, 3).map((i) => (
                <View key={i} style={styles.interestChip}>
                  <Text style={styles.interestText}>{i}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

export default memo(SwipeDeck);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  nextCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#222",
    transform: [{ scale: 0.95 }],
  },

  image: {
    width: "100%",
    height: "70%",
  },

  infoBox: {
    padding: 20,
  },

  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },

  bio: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 6,
  },

  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  interestChip: {
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  interestText: {
    color: "white",
    fontSize: 13,
  },
});
