// src/components/SliderCaptcha.tsx

import { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';

// ====================================================================
// # PROPS
// ====================================================================

interface Props {
  /** Called once user successfully slides to the end */
  onVerified: () => void;
}

// ====================================================================
// # SLIDER CAPTCHA COMPONENT
// ====================================================================
//
// A security slider requiring the user to drag a handle to the far right
// before continuing. Used to prevent accidental taps or bot-like behavior.
//
// Behavior:
//   - User drags handle horizontally along a track
//   - If handle reaches 95% of the required distance → verification success
//   - On success:
//        • Handle snaps to end
//        • "✓" checkmark appears
//        • "Verified" label is shown
//        • onVerified() is triggered
//   - On failure:
//        • Handle springs back to start
//
// Component is disabled after verification.
//
// Animation uses Animated.Value + PanResponder.
//

export function SliderCaptcha({ onVerified }: Props) {
  // UI constants -------------------------------------------------------
  const SLIDER_WIDTH = 260;
  const HANDLE_SIZE = 40;
  const MAX_X = SLIDER_WIDTH - HANDLE_SIZE - 10;

  // Animation value for horizontal slide
  const animatedX = useRef(new Animated.Value(0)).current;

  // Has the slider been successfully verified?
  const [verified, setVerified] = useState(false);

  // ====================================================================
  // # PAN RESPONDER (DRAG CONTROL)
  // ====================================================================
  const panResponder = useRef(
    PanResponder.create({
      // Only allow sliding if not yet verified
      onMoveShouldSetPanResponder: () => !verified,

      onPanResponderMove: (_evt, gesture) => {
        if (verified) return;

        // Clamp dx between 0 and MAX_X
        const clamped = Math.min(Math.max(gesture.dx, 0), MAX_X);
        animatedX.setValue(clamped);
      },

      onPanResponderRelease: (_evt, gesture) => {
        if (verified) return;

        const passed = gesture.dx >= MAX_X * 0.95;

        if (passed) {
          // User successfully verified
          setVerified(true);

          Animated.timing(animatedX, {
            toValue: MAX_X,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onVerified();
          });
        } else {
          // Slide failed → spring back to start
          Animated.spring(animatedX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // ====================================================================
  // # RENDER
  // ====================================================================

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.handle,
            verified && styles.handleVerified,
            { transform: [{ translateX: animatedX }] },
          ]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.handleText}>{verified ? '✓' : '→'}</Text>
        </Animated.View>
      </View>

      <Text style={styles.label}>
        {verified ? 'Verified' : 'Slide to verify'}
      </Text>
    </View>
  );
}

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    alignItems: 'center',
  },

  track: {
    width: 260,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  handle: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  handleVerified: {
    backgroundColor: '#4CAF50',
  },

  handleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },

  label: {
    marginTop: 10,
    color: 'white',
    fontSize: 14,
  },
});
