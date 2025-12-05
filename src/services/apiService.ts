import { auth } from "../services/firebase";

const LOCAL_IP = "192.168.0.88";
const BASE_URL = `http://${LOCAL_IP}:3000/api`;

async function getFirebaseToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const idToken = await getFirebaseToken();

    const isJson = options.method && options.method !== "GET";

    const headers: Record<string, string> = {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string>),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 403) throw new Error("Profile setup required");
    if (res.status === 204) return null;
    if (!res.ok) return null;

    return (await res.json()) as T;
  } catch (error) {
    console.error("apiRequest error:", error);
    return null;
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
