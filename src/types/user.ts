// app/types/user.ts
export type Sex = "male" | "female";
export type SexPreference = "male" | "female" | "everyone";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export type DatingPreference =
  | "hookups"
  | "situationship"
  | "short_term_relationship"
  | "short_term_open"
  | "long_term_open"
  | "long_term_relationship";

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  sex: Sex;
  sexPreference: SexPreference;
  interests: string[];
  photos: string[];
  profileImageUrl: string;
  latitude: number;
  longitude: number;
  datingPreference: DatingPreference;
}

export type SwipeAction = "LIKE" | "SKIP";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface Match {
  id: string;
  createdAt: string;
  otherUser: {
    id: string;
    name: string;
    profileImageUrl: string;
  };
}
