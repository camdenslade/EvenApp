// src/components/BottomNavBar.tsx
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from "react-native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type TabName = "Swipe" | "Matches" | "Messages" | "Profile";

interface Props {
  navigation: BottomTabNavigationProp<any>;
  active: "swipe" | "matches" | "messages" | "profile";
}

export function BottomNavBar({ navigation, active }: Props) {
  return (
    <View style={styles.nav}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Swipe")}
        style={styles.btn}
      >
        <Image
          source={require("../../assets/images/Even-App-Logos/TransparentBG/EE-SolidWhite.png")}
          style={[
            styles.iconImg,
            active === "swipe" && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Matches")}
        style={styles.btn}
      >
        <Image
          source={require("../../assets/icons/match.png")}
          style={[
            styles.iconImg,
            active === "matches" && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Messages")}
        style={styles.btn}
      >
        <Image
          source={require("../../assets/icons/message.png")}
          style={[
            styles.iconImg,
            active === "messages" && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={styles.btn}
      >
        <Image
          source={require("../../assets/icons/profile.png")}
          style={[
            styles.iconImg,
            active === "profile" && styles.activeImg,
          ]}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },

  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
  },

  iconImg: {
    width: 32,
    height: 32,
    tintColor: "#777",
  },
  activeImg: {
    tintColor: "white",
  },

  iconText: {
    fontSize: 28,
    color: "#777",
  },
  activeText: {
    color: "white",
  },
});
