// src/hooks/useSwipeGesture.ts
import { useRef } from "react";
import { Animated, PanResponder } from "react-native";

interface Params {
  onSwipe: (direction: "LEFT" | "RIGHT") => void;
}

export function useSwipeGesture({ onSwipe }: Params) {
  const translateX = useRef(new Animated.Value(0)).current;

  const rotate = translateX.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ["-20deg", "0deg", "20deg"],
    extrapolate: "clamp",
  });

  const animatedStyle = {
    transform: [{ translateX }, { rotate }],
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const swipeOffScreen = (direction: "LEFT" | "RIGHT") => {
    Animated.timing(translateX, {
      toValue: direction === "LEFT" ? -500 : 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      onSwipe(direction);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipeOffScreen("RIGHT");
          return;
        }

        if (gesture.dx < -120) {
          swipeOffScreen("LEFT");
          return;
        }

        resetPosition();
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    animatedStyle,
  };
}
