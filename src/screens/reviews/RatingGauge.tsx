// src/screens/reviews/RatingGauge.tsx
// ============================================================================
// RatingGauge
// Purpose:
//   Visual circular gauge component showing a user's average rating.
//   Used in profile screens and review summaries.
//
// Props:
//   • average: number    → User’s average rating (0–10 scale)
//   • count: number      → Number of total reviews
//   • best: number       → Highest rating ever received
//
// Behavior:
//   • Converts average rating → 0–1 progress ratio
//   • Animates gauge fill from 0 → target progress over 900ms
//   • Displays:
//       - A grey background ring
//       - A white animated progress ring
//       - Center numeric rating
//       - Text metadata below (count + best)
//
// Rendering:
//   Uses react-native-svg <Circle> with strokeDasharray + strokeDashoffset
//   to simulate circular progress animation.
// ============================================================================

import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RatingGaugeProps {
  average: number; // Expected 0–10
  count: number;   // Number of reviews
  best: number;    // Highest rating
}

export function RatingGauge({ average, count, best }: RatingGaugeProps) {
  // --------------------------------------------------------------------------
  // GAUGE CONFIGURATION
  // --------------------------------------------------------------------------
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  // Normalize average (0–10) → progress (0–1)
  const targetProgress = Math.min(Math.max(average / 10, 0), 1);

  // Internal animated progress value
  const [progress, setProgress] = useState(0);

  // --------------------------------------------------------------------------
  // ANIMATION EFFECT
  // --------------------------------------------------------------------------
  //
  // Animates the gauge from 0 → targetProgress over 900ms.
  // Runs whenever average changes.
  //
  useEffect(() => {
    let current = 0;
    const duration = 900;
    const steps = 60;
    const increment = targetProgress / steps;
    const interval = duration / steps;

    const id = setInterval(() => {
      current += increment;

      if (current >= targetProgress) {
        current = targetProgress;
        clearInterval(id);
      }

      setProgress(current);
    }, interval);

    return () => clearInterval(id);
  }, [targetProgress]);

  // Stroke offset determines how much of the ring is visible
  const dashOffset = circumference * (1 - progress);

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Circular rating gauge */}
      <Svg width={140} height={140} style={{ marginBottom: 10 }}>
        {/* Background ring */}
        <Circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#444"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress ring */}
        <Circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#fff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </Svg>

      {/* Center numeric rating */}
      <Text style={styles.avg}>{average.toFixed(1)}</Text>

      {/* Labels */}
      <Text style={styles.label}>Average Rating</Text>

      <Text style={styles.sub}>
        {count} Review{count !== 1 ? "s" : ""} • Best: {best}
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },

  avg: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    position: "absolute",
    top: 45,
  },

  label: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 14,
  },

  sub: {
    color: "#888",
    marginTop: 4,
    fontSize: 13,
  },
});
