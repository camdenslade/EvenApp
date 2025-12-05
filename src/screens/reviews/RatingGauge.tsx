// src/screens/reviews/RatingGauge.tsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RatingGaugeProps {
  average: number; // 0–10
  count: number;
  best: number;
}

export function RatingGauge({ average, count, best }: RatingGaugeProps) {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const targetProgress = Math.min(Math.max(average / 10, 0), 1);

  const [progress, setProgress] = useState(0);

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

  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={140} height={140} style={{ marginBottom: 10 }}>
        <Circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#444"
          strokeWidth={strokeWidth}
          fill="none"
        />

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

      <Text style={styles.avg}>{average.toFixed(1)}</Text>
      <Text style={styles.label}>Average Rating</Text>

      <Text style={styles.sub}>
        {count} Review{count !== 1 ? "s" : ""} • Best: {best}
      </Text>
    </View>
  );
}

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
