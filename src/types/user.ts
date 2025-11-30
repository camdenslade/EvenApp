// app/types/user.ts

// Basic User Profile Structure
export interface UserProfile {
    readonly id: string,
    name: string,
    age: number,
    bio?: string,
    interests: string[],
    profileImageUrl: string,
    location: {
        city: string,
        distanceMiles: number,
    }
}

// Our Three Possible Swipe Actions
export type SwipeAction = 'LIKE' | 'SKIP' | 'SUPER_LIKE';

// Basic Message Structure
export interface Message {
    readonly id: string,
    senderId: string,
    content: string,
    timestamp: Date,
}

// Basic Match Structure
export interface Match {
    readonly id: string,
    matchedAt: Date,
    otherUser: Pick<UserProfile, 'id' | 'name' | 'profileImageUrl'>,
}
