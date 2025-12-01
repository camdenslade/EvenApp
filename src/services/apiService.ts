// app/services/apiService.ts
import { Platform } from "react-native";
import { getAccessToken } from "./authStorage";

const BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000/api"
    : "http://localhost:3000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 403) {
      throw new Error('Profile setup incomplete!');
    }

    if (res.status === 204) return null;
    if (!res.ok) {
      console.error(`API error ${res.status}: ${endpoint}`);
      return null;
    }

    const data = (await res.json()) as T;
    return data;
  } catch (error) {
    console.error("apiRequest error:", error);
    throw error;
  }
}

export function apiGet<T>(endpoint: string) {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export function apiPost<T>(endpoint: string, data: any) {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
