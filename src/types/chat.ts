// src/types/chat.ts

export interface MatchUser {
  id: string;
  name: string;
  profileImageUrl: string;
}

export interface MatchThread {
  threadId: string;
  user: MatchUser;
  lastMessage: string | null;
  lastTimestamp: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string | null;
  imageUrl: string | null;
  timestamp: number;
}
