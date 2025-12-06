// src/screens/login/LoginScreen.tsx
// ============================================================================
// LoginScreen
// Purpose:
//   Entry point for authentication. Provides two modes:
//
//   (1) Default view
//       • Create Account (via Phone provider)
//       • Sign In (expands 3rd-party auth options)
//       • Search Nearby (guest browsing)
//
//   (2) Sign-in options view (expanded)
//       • Google sign-in
//       • Phone sign-in
//       • Back button
//
// Behavior:
//   - Does NOT verify authentication state (AuthLoadingScreen handles that)
//   - Routes to PhoneAuth with a provider parameter
//   - Routes to SearchScreen for optional guest mode
//
// Navigation:
//   navigation.navigate("PhoneAuth", { provider })
//   navigation.navigate("Search")
//
// Dependencies:
//   - Ionicons for icons
//   - useNavigation hook
// ============================================================================

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ----------------------------------------------------------------------------
// ASSETS
// ----------------------------------------------------------------------------
const APP_LOGO = require("../../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png");

// ============================================================================
// COMPONENT: SocialButton
// Reusable button for third-party providers (Google, Phone)
//
// Props:
//   • iconName  → Ionicons glyph
//   • title     → provider label
//   • onPress   → callback
//   • iconColor
//   • backgroundColor
//   • textColor
// ============================================================================
const SocialButton = ({
  iconName,
  title,
  onPress,
  iconColor,
  backgroundColor,
  textColor,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  iconColor: string;
  backgroundColor: string;
  textColor: string;
}) => (
  <TouchableOpacity
    style={[styles.socialButton, { backgroundColor }]}
    onPress={onPress}
  >
    <Ionicons name={iconName} size={24} color={iconColor} style={styles.socialIcon} />
    <Text style={[styles.socialText, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

// ============================================================================
// COMPONENT: PrimaryActionButton
// Main CTA buttons for create account / sign in / search
//
// Variants:
//   • defaultButton   → white background
//   • invertedButton  → transparent black/white outline
// ============================================================================
const PrimaryActionButton = ({
  title,
  onPress,
  inverted = false,
}: {
  title: string;
  onPress: () => void;
  inverted?: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      inverted ? styles.invertedButton : styles.defaultButton,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.primaryButtonText,
        inverted ? styles.invertedButtonText : styles.defaultButtonText,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// ============================================================================
// SCREEN: LoginScreen
// State Machine:
//
//   showOptions = false  → default landing
//   showOptions = true   → expanded sign-in options
//
// Routes:
//   - PhoneAuth(provider)
//   - Search (guest mode)
//
// This screen is purely UI and routing. No auth logic is executed here.
// ============================================================================
export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [showOptions, setShowOptions] = useState(false);

  // ---------------------------------------------------------------------------
  // Handler: Redirect to PhoneAuth with the selected provider
  // ---------------------------------------------------------------------------
  const handleSocialLogin = (provider: "Phone" | "Google") => {
    navigation.navigate("PhoneAuth", { provider });
  };

  // ============================================================================
  // VIEW MODE 2: SIGN-IN OPTIONS
  // Appears when user taps "Sign In"
  // ============================================================================
  if (showOptions) {
    return (
      <View style={styles.container}>
        {/* Logo + App Title */}
        <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.logoText}>Even Dating</Text>

        {/* Terms + Privacy */}
        <View style={styles.policyTextWrapper}>
          <Text style={styles.policyText}>
            By tapping 'Sign in', you agree to our Terms. Learn how we process your
            data in our Privacy Policy and Cookies Policy.
          </Text>
        </View>

        {/* Google Auth */}
        <SocialButton
          iconName="logo-google"
          title="Sign in with Google"
          onPress={() => handleSocialLogin("Google")}
          iconColor="black"
          backgroundColor="white"
          textColor="black"
        />

        {/* Phone Auth */}
        <SocialButton
          iconName="call"
          title="Sign in with Phone Number"
          onPress={() => handleSocialLogin("Phone")}
          iconColor="black"
          backgroundColor="white"
          textColor="black"
        />

        {/* Guest Search */}
        <PrimaryActionButton
          title="Search Nearby"
          onPress={() => navigation.navigate("Search")}
        />

        {/* Troubleshooting */}
        <TouchableOpacity style={styles.troubleButton}>
          <Text style={styles.troubleText}>Trouble signing in?</Text>
        </TouchableOpacity>

        {/* Back to default view */}
        <TouchableOpacity
          onPress={() => setShowOptions(false)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================================
  // VIEW MODE 1: DEFAULT LANDING
  // ============================================================================
  return (
    <View style={styles.container}>
      <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logoText}>Even Dating</Text>

      {/* Legal Notice */}
      <View style={styles.policyTextWrapper}>
        <Text style={styles.policyText}>
          By tapping 'Create account' or 'Sign in', you agree to our Terms. Learn how
          we process your data in our Privacy Policy and Cookies Policy.
        </Text>
      </View>

      {/* Create Account → PhoneAuth */}
      <PrimaryActionButton
        title="Create Account"
        onPress={() => handleSocialLogin("Phone")}
      />

      {/* Expand sign-in options */}
      <PrimaryActionButton
        title="Sign In"
        onPress={() => setShowOptions(true)}
        inverted
      />

      {/* Guest search */}
      <PrimaryActionButton
        title="Search Nearby"
        onPress={() => navigation.navigate("Search")}
        inverted
      />

      {/* Troubleshooting */}
      <TouchableOpacity style={styles.troubleButton}>
        <Text style={styles.troubleText}>Trouble signing in?</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222222",
    padding: 30,
    justifyContent: "flex-end",
    paddingBottom: 60,
  },

  logoImage: {
    width: 250,
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: 100,
    alignSelf: "center",
  },

  logoText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: 200,
    alignSelf: "center",
  },

  policyTextWrapper: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },

  policyText: {
    color: "#AAAAAA",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },

  primaryButton: {
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },

  defaultButton: {
    backgroundColor: "white",
  },
  invertedButton: {
    backgroundColor: "transparent",
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultButtonText: {
    color: "black",
  },
  invertedButtonText: {
    color: "white",
  },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    fontWeight: "600",
  },

  troubleButton: {
    marginTop: 15,
  },
  troubleText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
