// app/types/state.ts
import { UserProfile } from "./user";

export interface IdleState {
  status: "IDLE";
  currentProfile: UserProfile | null;
}

export interface LoadingState {
  status: "LOADING";
  targetProfileId: string;
}

export interface ErrorState {
  status: "ERROR";
  errorMessage: string;
  targetProfileId: string;
}

export interface MatchFoundState {
  status: "MATCH_FOUND";
  matchId: string;
  targetProfile: UserProfile;
  mePhoto?: string | null;
  themPhoto?: string | null;
}

export interface MessageSentState {
  status: "MESSAGE_SENT";
  matchId: string;
  threadId: string;
  targetProfile: UserProfile;
}

export type SwipeState =
  | IdleState
  | LoadingState
  | ErrorState
  | MatchFoundState
  | MessageSentState;
