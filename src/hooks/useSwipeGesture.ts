// src/hooks/useSwipeGesture.ts

// React / Animation ---------------------------------------------------
import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

// =====================================================================
// # TYPES
// =====================================================================

interface Params {
  /** Called when the card successfully swipes fully left or right */
  onSwipe: (direction: 'LEFT' | 'RIGHT') => void;
}

// =====================================================================
// # useSwipeGesture
// =====================================================================
//
// Provides:
//   • Horizontal pan control for a card
//   • Rotate + translate animations
//   • Snap-back when released without enough velocity/distance
//   • Off-screen animation when swipe threshold is passed
//
// Used By:
//   • SwipeDeck
//   • Any Tinder-style card gesture system
//
// Thresholds:
//   RIGHT swipe = dx > 120
//   LEFT  swipe = dx < -120
//

export function useSwipeGesture({ onSwipe }: Params) {
  // -------------------------------------------------------------------
  // # ANIMATED VALUES
  // -------------------------------------------------------------------
  const translateX = useRef(new Animated.Value(0)).current;

  // Rotate card slightly based on horizontal drag
  const rotate = translateX.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  // Style returned to the card
  const animatedStyle = {
    transform: [{ translateX }, { rotate }],
  };

  // -------------------------------------------------------------------
  // # RESET CARD TO ORIGINAL POSITION
  // -------------------------------------------------------------------
  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // -------------------------------------------------------------------
  // # SWIPE CARD OFF SCREEN
  // -------------------------------------------------------------------
  const swipeOffScreen = (direction: 'LEFT' | 'RIGHT') => {
    Animated.timing(translateX, {
      toValue: direction === 'LEFT' ? -500 : 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0); // prepare for next card
      onSwipe(direction);
    });
  };

  // -------------------------------------------------------------------
  // # PAN RESPONDER
  // -------------------------------------------------------------------
  const panResponder = useRef(
    PanResponder.create({
      // Allow responder to take control immediately
      onStartShouldSetPanResponder: () => true,

      // Track horizontal motion
      onPanResponderMove: (_evt, gesture) => {
        translateX.setValue(gesture.dx);
      },

      // Detect swipe distance on release
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx > 120) {
          swipeOffScreen('RIGHT');
          return;
        }

        if (gesture.dx < -120) {
          swipeOffScreen('LEFT');
          return;
        }

        // Not far enough — snap back
        resetPosition();
      },
    }),
  ).current;

  // -------------------------------------------------------------------
  // # PUBLIC API
  // -------------------------------------------------------------------
  return {
    /** Attach to card's top-level Animated.View */
    panHandlers: panResponder.panHandlers,

    /** Apply this style to animate movement + rotation */
    animatedStyle,
  };
}
