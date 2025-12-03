import { Message } from '../database/entities/message.entity';

export const mapMessage = (msg: Message, uid: string) => ({
  id: msg.id,
  text: msg.text,
  imageUrl: msg.imageUrl || null,
  senderId: msg.sender.id,
  isMine: msg.sender.id === uid,
  createdAt: msg.createdAt,
});
