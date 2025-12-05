// src/screens/login/LoginScreen.tsx
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

const APP_LOGO = require("../../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png");

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

export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [showOptions, setShowOptions] = useState(false);

  const handleSocialLogin = (provider: "Phone" | "Google") => {
    navigation.navigate("PhoneAuth", { provider });
  };

  if (showOptions) {
    return (
      <View style={styles.container}>
        <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.logoText}>Even Dating</Text>

        <View style={styles.policyTextWrapper}>
          <Text style={styles.policyText}>
            By tapping 'Sign in', you agree to our Terms. Learn how we process your
            data in our Privacy Policy and Cookies Policy.
          </Text>
        </View>

        <SocialButton
          iconName="logo-google"
          title="Sign in with Google"
          onPress={() => handleSocialLogin("Google")}
          iconColor="black"
          backgroundColor="white"
          textColor="black"
        />

        <SocialButton
          iconName="call"
          title="Sign in with Phone Number"
          onPress={() => handleSocialLogin("Phone")}
          iconColor="black"
          backgroundColor="white"
          textColor="black"
        />

        <PrimaryActionButton
          title="Search Nearby"
          onPress={() => navigation.navigate("Search")}
        />

        <TouchableOpacity style={styles.troubleButton}>
          <Text style={styles.troubleText}>Trouble signing in?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowOptions(false)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logoText}>Even Dating</Text>

      <View style={styles.policyTextWrapper}>
        <Text style={styles.policyText}>
          By tapping 'Create account' or 'Sign in', you agree to our Terms. Learn how
          we process your data in our Privacy Policy and Cookies Policy.
        </Text>
      </View>

      <PrimaryActionButton
        title="Create Account"
        onPress={() => handleSocialLogin("Phone")}
      />

      <PrimaryActionButton
        title="Sign In"
        onPress={() => setShowOptions(true)}
        inverted
      />

      <PrimaryActionButton
        title="Search Nearby"
        onPress={() => navigation.navigate("Search")}
        inverted
      />

      <TouchableOpacity style={styles.troubleButton}>
        <Text style={styles.troubleText}>Trouble signing in?</Text>
      </TouchableOpacity>
    </View>
  );

}

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
  logoText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    alignSelf: "center",
    top: 200,
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
