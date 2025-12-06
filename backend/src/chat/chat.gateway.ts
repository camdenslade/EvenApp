// backend/src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';

// Services --------------------------------------------------------------
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

// Socket Typing ---------------------------------------------------------
interface AuthedSocket extends Socket {
  data: {
    uid: string;
  };
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  // ====================================================================
  // # CONNECTION
  // ====================================================================
  /**
   * Validates Firebase token and attaches uid to socket.
   */
  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const tokenRaw = client.handshake.auth?.token as unknown;

      if (typeof tokenRaw !== 'string' || !tokenRaw) {
        client.disconnect();
        return;
      }

      const decoded = await admin.auth().verifyIdToken(tokenRaw);

      client.data = {
        uid: decoded.uid,
      };
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(): void {
    // optional: track presence or last online timestamp
  }

  // ====================================================================
  // # JOIN THREAD
  // ====================================================================
  /**
   * joinThread
   *
   * Allows a user to join a chat room representing a Thread.
   */
  @SubscribeMessage('joinThread')
  async joinThread(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { threadId: string },
  ): Promise<{ joined?: string; error?: string }> {
    const uid = client.data.uid;

    const allowed = await this.chatService.userCanAccessThread(
      uid,
      data.threadId,
    );

    if (!allowed) return { error: 'Access denied' };

    await client.join(data.threadId);
    return { joined: data.threadId };
  }

  // ====================================================================
  // # SEND MESSAGE
  // ====================================================================
  /**
   * sendMessage
   *
   * Validates access, saves the message, and broadcasts it to the thread.
   */
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { threadId: string; content: string },
  ) {
    const uid = client.data.uid;

    const allowed = await this.chatService.userCanAccessThread(
      uid,
      data.threadId,
    );

    if (!allowed) return { error: 'Access denied' };

    const message = await this.chatService.sendMessage(
      data.threadId,
      uid,
      data.content,
    );

    this.server.to(data.threadId).emit('newMessage', message);

    return message;
  }
}
