import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { MatchesService } from '../matches/matches.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly matchesService: MatchesService,
  ) {}

  @SubscribeMessage('joinThread')
  joinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    void client.join(data.threadId);
    return { joined: data.threadId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      threadId: string;
      senderUid: string;
      content: string;
    },
  ) {
    const message = await this.chatService.sendMessage(
      data.threadId,
      data.senderUid,
      data.content,
    );

    void this.server.to(data.threadId).emit('newMessage', message);

    return message;
  }
}
