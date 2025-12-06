// app/types/state.ts
// ============================================================================
// SWIPE STATE MACHINE TYPES
// ============================================================================
//
// Purpose:
//   Defines all possible states used by the swipe engine (useSwipeQueue).
//   These states control UI behavior, loading indicators, match modals,
//   error fallbacks, and swipe restrictions.
//
// Where Used:
//   • useSwipeQueue() hook → updates & returns the current state
//   • SwipeScreen          → disables input when not IDLE
//   • MatchModal           → opened when state = MATCH_FOUND
//
// General Concept:
//   The swipe deck operates as a finite-state machine (FSM).
//   At any moment, exactly one state below is active.
//
// ----------------------------------------------------------------------------
// # IdleState
// ----------------------------------------------------------------------------
// Meaning:
//   Normal UI operation — user can swipe, undo, or interact.
//
// Fields:
//   status          → constant "IDLE"
//   currentProfile  → the topmost profile in the queue (or null)
// ----------------------------------------------------------------------------

import { UserProfile } from "./user";

export interface IdleState {
  status: "IDLE";
  currentProfile: UserProfile | null;
}

// ----------------------------------------------------------------------------
// # LoadingState
// ----------------------------------------------------------------------------
// Meaning:
//   A swipe was initiated and backend evaluation is in progress.
//   UI should disable input.
//
// Fields:
//   status          → constant "LOADING"
//   targetProfileId → the profile being evaluated (LIKE / SKIP)
// ----------------------------------------------------------------------------

export interface LoadingState {
  status: "LOADING";
  targetProfileId: string;
}

// ----------------------------------------------------------------------------
// # ErrorState
// ----------------------------------------------------------------------------
// Meaning:
//   Backend interaction failed (network, validation, etc.).
//   UI may show a toast, alert, or fallback message.
//
// Fields:
//   status          → "ERROR"
//   errorMessage    → user-friendly explanation
//   targetProfileId → swipe that triggered the error
// ----------------------------------------------------------------------------

export interface ErrorState {
  status: "ERROR";
  errorMessage: string;
  targetProfileId: string;
}

// ----------------------------------------------------------------------------
// # MatchFoundState
// ----------------------------------------------------------------------------
// Meaning:
//   User swiped LIKE and backend returned a match.
//   SwipeScreen should open the MatchModal automatically.
//
// Fields:
//   status         → "MATCH_FOUND"
//   matchId        → ID of created match (backend)
//   targetProfile  → profile that matched
//   mePhoto        → current user’s first photo
//   themPhoto      → matched user’s first photo
// ----------------------------------------------------------------------------

export interface MatchFoundState {
  status: "MATCH_FOUND";
  matchId: string;
  targetProfile: UserProfile;
  mePhoto?: string | null;
  themPhoto?: string | null;
}

// ----------------------------------------------------------------------------
// # MessageSentState
// ----------------------------------------------------------------------------
// Meaning:
//   After auto-messaging (paid features / future implementation),
//   backend confirms a message was sent.
//
// Fields:
//   status         → "MESSAGE_SENT"
//   matchId        → match reference
//   threadId       → chat thread created
//   targetProfile  → who message was sent to
// ----------------------------------------------------------------------------

export interface MessageSentState {
  status: "MESSAGE_SENT";
  matchId: string;
  threadId: string;
  targetProfile: UserProfile;
}

// ----------------------------------------------------------------------------
// # SwipeState (Union)
// ----------------------------------------------------------------------------
// Meaning:
//   Union of ALL possible swipe states.
//   Use this wherever the swipe machine state is stored or returned.
//
// Example:
//   const [state, setState] = useState<SwipeState>({ status: "IDLE", ... });
//
// ----------------------------------------------------------------------------

export type SwipeState =
  | IdleState
  | LoadingState
  | ErrorState
  | MatchFoundState
  | MessageSentState;
