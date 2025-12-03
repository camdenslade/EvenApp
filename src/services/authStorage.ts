import * as SecureStore from "expo-secure-store";

export async function saveIdToken(token: string) {
  await SecureStore.setItemAsync("idToken", token);
}

export async function getIdToken() {
  return await SecureStore.getItemAsync("idToken");
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("idToken");
}
