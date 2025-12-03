// src/screens/login/AuthLoadingScreen.tsx
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../services/firebase";
import { apiGet } from "../../services/apiService";

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;

      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const status = await apiGet<{ profileComplete: boolean }>("/profiles/status");

      if (!status || !status.profileComplete) {
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        return;
      }

      navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
    }

    load();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#222" }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}

