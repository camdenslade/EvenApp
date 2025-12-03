// src/components/SliderCaptcha.tsx
import { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated } from "react-native";

interface Props {
  onVerified: () => void;
}

export function SliderCaptcha({ onVerified }: Props) {
  const SLIDER_WIDTH = 260;
  const HANDLE_SIZE = 40;
  const MAX_X = SLIDER_WIDTH - HANDLE_SIZE - 10;

  const animatedX = useRef(new Animated.Value(0)).current;
  const [verified, setVerified] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !verified,

      onPanResponderMove: (_evt, gesture) => {
        if (verified) return;

        const clamped = Math.min(Math.max(gesture.dx, 0), MAX_X);
        animatedX.setValue(clamped);
      },

      onPanResponderRelease: (_evt, gesture) => {
        if (verified) return;

        const passed = gesture.dx >= MAX_X * 0.95;

        if (passed) {
          setVerified(true);

          Animated.timing(animatedX, {
            toValue: MAX_X,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onVerified();
          });
        } else {
          Animated.spring(animatedX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
          <Text style={styles.handleText}>{verified ? "✓" : "→"}</Text>
        </Animated.View>
      </View>

      <Text style={styles.label}>{verified ? "Verified" : "Slide to verify"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    alignItems: "center",
  },

  track: {
    width: 260,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  handle: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  handleVerified: {
    backgroundColor: "#4CAF50",
  },

  handleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },

  label: {
    marginTop: 10,
    color: "white",
    fontSize: 14,
  },
});
