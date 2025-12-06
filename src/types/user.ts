// src/types/user.ts
// ============================================================================
// USER + MATCHING DOMAIN TYPES
// ============================================================================
//
// Purpose:
//   Centralized type definitions used by:
//     • Swipe engine
//     • Profiles API
//     • Reviews + matches
//     • Messaging system
//
// These types describe all user-facing data the frontend expects from the
// backend. Everything here is used throughout the app: onboarding, swipe deck,
// chat, profile screens, and search.
//
// ============================================================================

// ----------------------------------------------------------------------------
// # Sex + SexPreference
// ----------------------------------------------------------------------------
// Sex:
//   Biological sex used in onboarding.
//
// SexPreference:
//   Controls which users appear in the swipe queue.
// ----------------------------------------------------------------------------
export type Sex = "male" | "female";

export type SexPreference = "male" | "female" | "everyone";

// ----------------------------------------------------------------------------
// # UserLocation
// ----------------------------------------------------------------------------
// Represents a GPS coordinate (lat/lon).
// Used by:
//   • Location hook
//   • Distance filters
//   • "Search nearby" feature
// ----------------------------------------------------------------------------
export interface UserLocation {
  latitude: number;
  longitude: number;
}

// ----------------------------------------------------------------------------
// # DatingPreference
// ----------------------------------------------------------------------------
// User's relationship goals.
// Dynamic restrictions:
//   - Some values are filtered out depending on age during onboarding.
// ----------------------------------------------------------------------------
export type DatingPreference =
  | "hookups"
  | "situationship"
  | "short_term_relationship"
  | "short_term_open"
  | "long_term_open"
  | "long_term_relationship";

// ----------------------------------------------------------------------------
// # UserProfile
// ----------------------------------------------------------------------------
// Master profile object returned from:
//   • GET /profiles/me
//   • GET /profiles/:id
//   • Swipe queue endpoints
//
// Key Notes:
//   • birthday is ISO YYYY-MM-DD
//   • age is precomputed server-side
//   • photos[] contains raw image URLs
//   • profileImageUrl is the primary display image (usually photos[0])
//   • paused hides user from discovery
// ----------------------------------------------------------------------------
export interface UserProfile {
  id: string;

  name: string;
  birthday: string; // ISO format
  age: number;      // computed on backend

  bio: string;

  sex: Sex;
  sexPreference: SexPreference;

  interests: string[];

  photos: string[];
  profileImageUrl: string;

  latitude: number;
  longitude: number;

  datingPreference: DatingPreference;

  paused: boolean;
}

// ----------------------------------------------------------------------------
// # SwipeAction
// ----------------------------------------------------------------------------
// What the user can do when swiping:
//
// LIKE → may create match
// SKIP → silently move to next profile
// ----------------------------------------------------------------------------
export type SwipeAction = "LIKE" | "SKIP";

// ----------------------------------------------------------------------------
// # Message
// ----------------------------------------------------------------------------
// Structure of a single message inside a thread.
// Used by:
//   • ChatScreen
//   • useChatThread hook
// ----------------------------------------------------------------------------
export interface Message {
  id: string;
  senderId: string;

  text: string;
  imageUrl: string | null;

  createdAt: string; // ISO timestamp
}

// ----------------------------------------------------------------------------
// # Match
// ----------------------------------------------------------------------------
// Returned from match API:
//   • GET /matches
//   • Created after LIKE results in a match
//
// otherUser contains minimal profile data for rendering match cards.
// ----------------------------------------------------------------------------
export interface Match {
  id: string;
  createdAt: string;

  otherUser: {
    id: string;
    name: string;
    profileImageUrl: string;
  };
}
