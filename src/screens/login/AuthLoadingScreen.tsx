// src/screens/login/AuthLoadingScreen.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { apiGet } from "../../services/apiService";

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        setChecking(false);
        return;
      }

      const status = await apiGet<{ status: "missing" | "complete" }>("/profiles/status");

      if (!status || status.status !== "complete") {
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
      }

      setChecking(false);
    });

    return unsub;
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#222",
      }}
    >
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
