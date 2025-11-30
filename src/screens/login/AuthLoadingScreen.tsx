import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAccessToken, getRefreshToken, saveTokens } from "../../services/authStorage";
import { apiPost } from "../../services/apiService";

export default function AuthLoadingScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function check() {
      try {
        const access = await getAccessToken();
        if (access) {
          navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
          return;
        }

        const refresh = await getRefreshToken();
        if (refresh) {
          const tokens = await apiPost<{ access: string; refresh: string }>(
            "/auth/refresh",
            { refreshToken: refresh }
          );

          if (tokens) {
            await saveTokens(tokens.access, tokens.refresh);
            navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
            return;
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        Alert.alert("Error", "Could not complete authentication check.");
      }
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }

    check();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}