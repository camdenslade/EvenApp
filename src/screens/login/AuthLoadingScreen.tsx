// src/screens/login/AuthLoadingScreen.tsx
// ============================================================================
// AuthLoadingScreen
// Purpose:
//   Entry gate for the entire app. Determines where the user should go at
//   startup based on:
//
//     • Firebase authentication state
//     • Profile completion status from backend
//
// Behavior:
//   1. Wait for Firebase auth (onAuthStateChanged)
//   2. If no user → Login screen
//   3. If logged in → GET /profiles/status
//   4. If status = "missing" → Onboarding flow
//   5. If status = "complete" → SwipeScreen (main app)
//
// This screen never persists; it immediately redirects.
//
// Navigation:
//   navigation.reset({ routes: [{ name: 'Login' }] })
//   navigation.reset({ routes: [{ name: 'Onboarding' }] })
//   navigation.reset({ routes: [{ name: 'Swipe' }] })
// ============================================================================

import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../services/firebase";
import { apiGet } from "../../services/apiService";

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();
  const [checking, setChecking] = useState(true);

  // --------------------------------------------------------------------------
  // AUTH LISTENER
  // --------------------------------------------------------------------------
  //
  // onAuthStateChanged(auth, callback)
  //
  // Fires:
  //   • Immediately on mount with the current user (null or signed-in)
  //   • Again whenever user logs in/out
  //
  // After deciding the destination screen, navigation.reset() is used to wipe
  // history and prevent the user from navigating "back" to the loading screen.
  //
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // --------------------------------------------------------------
      // Case 1: No user authenticated → send to Login
      // --------------------------------------------------------------
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        setChecking(false);
        return;
      }

      // --------------------------------------------------------------
      // Case 2: User exists → determine profile completion status
      // Endpoint: GET /profiles/status
      // Expected response: { status: "missing" | "complete" }
      // --------------------------------------------------------------
      const status = await apiGet<{ status: "missing" | "complete" }>(
        "/profiles/status"
      );

      if (!status || status.status !== "complete") {
        // Profile is incomplete → onboarding required
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
      } else {
        // Profile complete → go to main swipe deck
        navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
      }

      setChecking(false);
    });

    return unsub;
  }, []);

  // --------------------------------------------------------------------------
  // LOADING VIEW
  // --------------------------------------------------------------------------
  //
  // This screen is visible only briefly. Displays a centered spinner on a
  // dark background while authentication + profile status are determined.
  //
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
