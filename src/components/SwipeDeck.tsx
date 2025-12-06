// src/components/SwipeDeck.tsx

// React / RN -----------------------------------------------------------
import { useRef, memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';

// Types ---------------------------------------------------------------
import type { UserProfile } from '../types/user';

// ====================================================================
// # PROPS
// ====================================================================

interface Props {
  /** Array of profiles in queue. profiles[0] = top card */
  profiles: UserProfile[];

  /** Triggered when card is swiped left (pass) */
  onSwipeLeft: () => void;

  /** Triggered when card is swiped right (like) */
  onSwipeRight: () => void;
}

// ====================================================================
// # SWIPE DECK
// ====================================================================
//
// This is the interactive Tinder-style deck.
//
// Core Behavior:
//   - profiles[0] = active (top) card
//   - profiles[1] = "next" preview card (scaled down)
//   - Card moves with drag gesture via pan.x and pan.y
//   - If movement passes threshold:
//       dx > +120 → right swipe (LIKE)
//       dx < -120 → left swipe (PASS)
//   - When released without threshold, spring back to center
//
// Rotation:
//   - rotate = interpolate(pan.x)
//   - PanResponder controls updates to pan.x/pan.y
//
// swipeOff():
//   Animates card off screen left/right then resets position
//
// NOTE:
//   This component does NOT decide match logic. It only calls the
//   provided callbacks, keeping UI and business logic cleanly separated.
//

function SwipeDeck({ profiles, onSwipeLeft, onSwipeRight }: Props) {
  // Top profile and next preview
  const topCard = profiles[0] ?? null;
  const nextCard = profiles[1] ?? null;

  // Animated position of the top card
  const pan = useRef(new Animated.ValueXY()).current;

  // Rotation angle based on horizontal drag
  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const animatedCardStyle = {
    transform: [...pan.getTranslateTransform(), { rotate }],
  };

  // ------------------------------------------------------------
  // Swipe the card off screen
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Gesture Handler
  // ------------------------------------------------------------
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,

      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: g.dy });
      },

      onPanResponderRelease: (_, g) => {
        const { dx, dy } = g;

        if (dx > 120) return swipeOff(true, dy);
        if (dx < -120) return swipeOff(false, dy);

        // Return to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!topCard) return null;

  // ====================================================================
  // # UI
  // ====================================================================

  return (
    <View style={styles.container}>
      {/* Next Card (background preview) */}
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

      {/* Interactive Top Card */}
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

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },

  nextCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#222',
    transform: [{ scale: 0.95 }],
  },

  image: {
    width: '100%',
    height: '70%',
  },

  infoBox: {
    padding: 20,
  },

  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },

  bio: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 6,
  },

  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  interestChip: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  interestText: {
    color: 'white',
    fontSize: 13,
  },
});
