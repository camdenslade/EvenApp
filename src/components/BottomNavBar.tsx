// src/components/BottomNavBar.tsx

// React Native ---------------------------------------------------------
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';

// Navigation Types ------------------------------------------------------
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ====================================================================
// # TYPES
// ====================================================================

type TabName = 'Swipe' | 'Matches' | 'Messages' | 'Profile';

interface Props {
  /** Navigation object from React Navigation bottom tabs */
  navigation: BottomTabNavigationProp<any>;

  /** Which tab is currently active */
  active: 'swipe' | 'matches' | 'messages' | 'profile';
}

// ====================================================================
// # BOTTOM NAV BAR COMPONENT
// ====================================================================
//
// Renders a fixed bottom navigation bar with four icons:
//
//   - Swipe
//   - Matches
//   - Messages
//   - Profile
//
// Behavior:
//   • Icons are tinted white when active, gray otherwise
//   • Tapping a button triggers navigation.navigate(<tab>)
//   • Bar is fixed at bottom of screen
//

export function BottomNavBar({ navigation, active }: Props) {
  return (
    <View style={styles.nav}>

      {/* -------------------------------------------------------------- */}
      {/* SWIPE TAB                                                     */}
      {/* -------------------------------------------------------------- */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Swipe')}
        style={styles.btn}
      >
        <Image
          source={require('../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png')}
          style={[
            styles.iconImg,
            active === 'swipe' && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      {/* -------------------------------------------------------------- */}
      {/* MATCHES TAB                                                   */}
      {/* -------------------------------------------------------------- */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Matches')}
        style={styles.btn}
      >
        <Image
          source={require('../../assets/icons/match.png')}
          style={[
            styles.iconImg,
            active === 'matches' && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      {/* -------------------------------------------------------------- */}
      {/* MESSAGES TAB                                                  */}
      {/* -------------------------------------------------------------- */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Messages')}
        style={styles.btn}
      >
        <Image
          source={require('../../assets/icons/message.png')}
          style={[
            styles.iconImg,
            active === 'messages' && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      {/* -------------------------------------------------------------- */}
      {/* PROFILE TAB                                                   */}
      {/* -------------------------------------------------------------- */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={styles.btn}
      >
        <Image
          source={require('../../assets/icons/profile.png')}
          style={[
            styles.iconImg,
            active === 'profile' && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

    </View>
  );
}

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',

    paddingVertical: 16,
    paddingBottom: 20,

    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
  },

  iconImg: {
    width: 32,
    height: 32,
    tintColor: '#777',
  },

  activeImg: {
    tintColor: 'white',
  },

  iconText: {
    fontSize: 28,
    color: '#777',
  },

  activeText: {
    color: 'white',
  },
});
