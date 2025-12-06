// src/services/apiServicer.ts
// ============================================================================
// API SERVICE — apiRequest(), apiGet(), apiPost(), apiPatch(), apiDelete()
// ============================================================================
//
// PURPOSE:
//   Centralized HTTP client for all backend communication. Handles:
//     • Attaching Firebase ID token to each request
//     • JSON encoding for POST/PATCH
//     • Graceful null-returning when responses fail
//     • Automatic detection of profile-incomplete state (403)
//     • Base URL management for local development
//
// AUTHENTICATION:
//   Firebase Auth is the source of truth. Each request includes:
//       Authorization: Bearer <idToken>
//   Tokens are refreshed on each call using getIdToken(true).
//
// ERROR BEHAVIOR:
//   • Network errors → return null
//   • Non-OK responses → return null (except 403)
//   • 403 "Profile setup required" → throw Error → caught by screens
//   • 204 → return null (no content)
//
// TYPING:
//   All helpers are generic: apiGet<T>(), apiPost<T>(), etc.
//
// ============================================================================

import { auth } from "../services/firebase";

// -----------------------------------------------------------------------------
// BASE URL (Local Development)
// -----------------------------------------------------------------------------
const LOCAL_IP = "192.168.0.88";
const BASE_URL = `http://${LOCAL_IP}:3000/api`;

// -----------------------------------------------------------------------------
// # getFirebaseToken()
// -----------------------------------------------------------------------------
// Retrieves a fresh Firebase ID token for authenticated requests.
// Returns null if user is not logged in.
//
async function getFirebaseToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true);
}

// -----------------------------------------------------------------------------
// # apiRequest()
// -----------------------------------------------------------------------------
//
// Generic HTTP wrapper used by all verb helpers.
// Arguments:
//   endpoint: string → "/profiles/me"
//   options: RequestInit → method, body, headers
//
// Steps:
//   1. Fetch Firebase ID token
//   2. Construct headers (JSON only for POST/PATCH)
//   3. Fetch backend
//   4. Handle special status codes
//   5. Parse JSON or return null
//
// Returns:
//   T | null
//
// -----------------------------------------------------------------------------
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    // Attach ID token if logged in
    const idToken = await getFirebaseToken();

    // Only POST/PATCH/PUT expect JSON bodies
    const isJson =
      options.method &&
      options.method !== "GET" &&
      options.method !== "DELETE";

    const headers: Record<string, string> = {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string>),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Backend may intentionally return nothing
    if (res.status === 204) return null;

    // Backend uses 403 to indicate onboarding required
    if (res.status === 403) throw new Error("Profile setup required");

    // Any other failure → silent null
    if (!res.ok) {
      console.warn("API error:", res.status, endpoint);
      return null;
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch (err) {
    console.error("apiRequest error:", err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// # apiGet()
// -----------------------------------------------------------------------------
// Simple GET request wrapper.
//
export function apiGet<T>(endpoint: string) {
  return apiRequest<T>(endpoint, { method: "GET" });
}

// -----------------------------------------------------------------------------
// # apiPost()
// -----------------------------------------------------------------------------
// JSON POST request wrapper.
//
export function apiPost<T>(endpoint: string, data: any) {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// -----------------------------------------------------------------------------
// # apiPatch()
// -----------------------------------------------------------------------------
// JSON PATCH request wrapper.
//
export function apiPatch<T>(endpoint: string, data: any) {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// -----------------------------------------------------------------------------
// # apiDelete()
// -----------------------------------------------------------------------------
// Simple DELETE request wrapper.
//
export function apiDelete<T>(endpoint: string) {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}
