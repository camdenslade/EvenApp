// app/types/state.ts
import  { UserProfile, Match } from "./user";

// Define Our Idle State
export interface IdleState {
    status: 'IDLE',
    currentProfile: UserProfile | null,
}

// Define Our Loading State
export interface LoadingState {
    status: 'LOADING',
    targetProfileId: string,
}

// Define Our Error State
export interface ErrorState {
    status: 'ERROR',
    errorMessage: string,
    targetProfileId: string,
}

// Define Our Match Found State
export interface MatchFoundState {
    status: 'MATCH_FOUND',
    newMatch: Match,
    targetProfileId: string,
}

// Export Final Swipe State Type
export type SwipeState = IdleState | LoadingState | ErrorState | MatchFoundState;