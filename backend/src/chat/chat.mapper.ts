// backend/src/chat/chat.mapper.ts

// Entities --------------------------------------------------------------
import { Message } from '../database/entities/message.entity';

// ====================================================================
// # MESSAGE MAPPER
// ====================================================================
//
// Maps a Message entity into a standardized response object for clients.
// Adds `isMine` for frontend chat UX.
//

export const mapMessage = (msg: Message, uid: string) => ({
  id: msg.id,
  text: msg.text,
  imageUrl: msg.imageUrl || null,
  senderId: msg.sender.id,
  isMine: msg.sender.id === uid,
  createdAt: msg.createdAt,
});
