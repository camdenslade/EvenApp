// src/services/authStorage.ts
// ============================================================================
// AUTH STORAGE — Secure Expo Token Handling
// ============================================================================
//
// PURPOSE:
//   Stores and retrieves the Firebase ID token using Expo SecureStore.
//   This token is used by the backend (Bearer <token>) to authenticate requests.
//
// WHY SECURESTORE?
//   • Encrypted at rest on iOS/Android
//   • Automatically scoped to the device
//   • Prevents accidental exposure vs AsyncStorage
//
// STORED VALUES:
//   - "idToken"   → Firebase-issued JWT (short-lived but refreshed automatically)
//
// LIFECYCLE:
//   saveIdToken(token)   → called after successful login
//   getIdToken()         → used by API service if needed (fallback)
//   clearTokens()        → used for logout + account deletion
//
// NOTE:
//   The API service prefers auth.currentUser.getIdToken(true) for freshness.
//   SecureStore acts as a fallback during app launches.
//
// ============================================================================

import * as SecureStore from "expo-secure-store";

// -----------------------------------------------------------------------------
// saveIdToken()
// -----------------------------------------------------------------------------
// Stores the provided Firebase ID token securely.
// Called after login, onboarding, or token refresh.
//
export async function saveIdToken(token: string) {
  await SecureStore.setItemAsync("idToken", token);
}

// -----------------------------------------------------------------------------
// getIdToken()
// -----------------------------------------------------------------------------
// Retrieves the stored token. May return null if user logged out or storage empty.
// API service prefers Firebase for fresh tokens, but this is used during startup.
//
export async function getIdToken() {
  return await SecureStore.getItemAsync("idToken");
}

// -----------------------------------------------------------------------------
// clearTokens()
// -----------------------------------------------------------------------------
// Deletes all locally stored authentication tokens.
// Used when:
//   - User signs out
//   - User deletes account
//   - AuthLoadingScreen resets app state
//
export async function clearTokens() {
  await SecureStore.deleteItemAsync("idToken");
}
