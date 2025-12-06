// src/components/BottomButtons.tsx

// React Native ---------------------------------------------------------
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { useRef } from 'react';

// ====================================================================
// # PROPS
// ====================================================================

interface Props {
  /** Disable all buttons and animations */
  disabled: boolean;

  /** Undo button action */
  onUndo: () => void;

  /** Like action — also triggered by long-press pulse */
  onLike: () => void;

  /** Open message flow */
  onMessage: () => void;
}

// ====================================================================
// # BOTTOM BUTTONS COMPONENT
// ====================================================================
//
// Renders three main buttons for the swipe interface:
//
//  - Undo button
//  - Center "Like" button with long-press pulse animation
//  - Message button
//
// Behavior:
//
//  - If disabled, all interactions are blocked and opacity is reduced
//  - Long-press center button:
//        * Begins pulse animation
//        * After 550ms triggers onLike()
//        * Press release early cancels action
//

export function BottomButtons({ disabled, onUndo, onLike, onMessage }: Props) {
  // Lower global opacity when disabled
  const opacity = disabled ? 0.35 : 1;

  // Timeout reference for long-press detection
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  // Animation state
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  // ====================================================================
  // # ANIMATION LOGIC
  // ====================================================================

  /** Start pulsing animation for long-press */
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
      ]),
    );

    pulseAnim.current.start();
  };

  /** Stop pulse animation and reset scaling */
  const stopPulse = () => {
    if (pulseAnim.current) {
      pulseAnim.current.stop();
      pulseAnim.current = null;
    }
    scale.setValue(1);
  };

  /** When user presses down on center button */
  const handlePressIn = () => {
    if (disabled) return;

    startPulse();

    // Like action triggers after holding for 550ms
    holdTimeout.current = setTimeout(() => {
      onLike();
      stopPulse();
    }, 550);
  };

  /** When user releases the press */
  const handlePressOut = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    stopPulse();
  };

  // ====================================================================
  // # RENDER
  // ====================================================================

  return (
    <View style={styles.wrap}>

      {/* Undo Button -------------------------------------------------- */}
      <TouchableOpacity onPress={onUndo} disabled={disabled} style={styles.btn}>
        <Image
          source={require('../../assets/icons/undo.png')}
          style={[styles.icon, { opacity }]}
        />
      </TouchableOpacity>

      {/* Center Like Button (Long Press + Pulse) ---------------------- */}
      <TouchableOpacity
        disabled={disabled}
        style={styles.centerBtn}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.Image
          source={require('../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png')}
          style={[
            styles.logoIcon,
            { opacity, transform: [{ scale }] },
          ]}
        />
      </TouchableOpacity>

      {/* Message Button ---------------------------------------------- */}
      <TouchableOpacity onPress={onMessage} disabled={disabled} style={styles.btn}>
        <Image
          source={require('../../assets/icons/message.png')}
          style={[styles.icon, { opacity }]}
        />
      </TouchableOpacity>

    </View>
  );
}

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  btn: {
    backgroundColor: 'black',
    padding: 13,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerBtn: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  logoIcon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
});
