// src/types/chat.ts
// ============================================================================
// CHAT TYPE DEFINITIONS
// ============================================================================
//
// Purpose:
//   Strong TypeScript models for all chat-related data flowing between the UI
//   and backend. These interfaces are used by:
//     • useChatThreads()   → listing threads
//     • useChatThread()    → loading messages + sending messages
//     • MessagesScreen     → navigation into ChatScreen
//     • ChatScreen         → rendering bubbles + sender alignment
//
// -----------------------------------------------------------------------------
// # MatchUser
// -----------------------------------------------------------------------------
// Represents the *other user* in a match or chat thread.
// Returned from endpoints like:
//   GET /matches/unmessaged
//   GET /chat/threads
//
// Fields:
//   uid               → Their Firebase UID
//   name              → Display name
//   profileImageUrl   → Profile picture URL (null-safe on backend)
// -----------------------------------------------------------------------------

export interface MatchUser {
  uid: string;
  name: string;
  profileImageUrl: string;
}

// -----------------------------------------------------------------------------
// # MatchThread
// -----------------------------------------------------------------------------
// Represents a chat thread entry used on the Messages list.
// Returned from:
//   GET /chat/threads
//
// Fields:
//   threadId        → Unique thread identifier
//   user            → The other participant (MatchUser)
//   lastMessage     → Most recent message text (null if none)
//   lastTimestamp   → UNIX timestamp for sorting threads
// -----------------------------------------------------------------------------

export interface MatchThread {
  threadId: string;
  user: MatchUser;
  lastMessage: string | null;
  lastTimestamp: number;
}

// -----------------------------------------------------------------------------
// # ChatMessage
// -----------------------------------------------------------------------------
// Represents a single message inside a thread.
// Returned from:
//   GET /chat/threads/:id/messages
// Emitted from socket events:
//   "message"
//   "sendMessage"
//
// Fields:
//   uid          → Unique message identifier
//   threadId     → Which chat thread this message belongs to
//   senderId     → Firebase UID of sender
//   text         → Message body (null if image message)
//   imageUrl     → Optional image attachment
//   timestamp    → UNIX timestamp used for ordering
//
// ChatScreen aligns messages by checking:
//   item.senderId === currentUserUid
// -----------------------------------------------------------------------------

export interface ChatMessage {
  uid: string;
  threadId: string;
  senderId: string;
  text: string | null;
  imageUrl: string | null;
  timestamp: number;
}
