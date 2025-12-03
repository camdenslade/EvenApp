import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { useRef } from "react";

interface Props {
  disabled: boolean;
  onUndo: () => void;
  onLike: () => void;
  onMessage: () => void;
}

export function BottomButtons({ disabled, onUndo, onLike, onMessage }: Props) {
  const opacity = disabled ? 0.35 : 1;

  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.current.start();
  };

  const stopPulse = () => {
    if (pulseAnim.current) {
      pulseAnim.current.stop();
      pulseAnim.current = null;
    }
    scale.setValue(1);
  };

  const handlePressIn = () => {
    if (disabled) return;

    startPulse();

    holdTimeout.current = setTimeout(() => {
      onLike();
      stopPulse();
    }, 550);
  };

  const handlePressOut = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    stopPulse();
  };

  return (
    <View style={styles.wrap}>

      <TouchableOpacity onPress={onUndo} disabled={disabled} style={styles.btn}>
        <Image
          source={require("../../assets/icons/undo.png")}
          style={[styles.icon, { opacity }]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        disabled={disabled}
        style={styles.btn}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.Image
          source={require("../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png")}
          style={[
            styles.logoIcon,
            { opacity, transform: [{ scale }] },
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onMessage} disabled={disabled} style={styles.btn}>
        <Image
          source={require("../../assets/icons/message.png")}
          style={[styles.icon, { opacity }]}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  btn: {
    padding: 10,
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  logoIcon: {
    width: 85,
    height: 85,
    resizeMode: "contain",
  },
});
