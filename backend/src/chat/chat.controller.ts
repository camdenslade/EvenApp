import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // GET /chat/threads
  @Get('threads')
  async getThreads(@FirebaseUser() user: { uid: string }) {
    return this.chat.getUserThreads(user.uid);
  }

  // GET /chat/messages/:threadId
  @Get('messages/:threadId')
  async getMessages(
    @FirebaseUser() user: { uid: string },
    @Param('threadId') threadId: string,
  ) {
    const allowed = await this.chat.userCanAccessThread(user.uid, threadId);
    if (!allowed) throw new ForbiddenException();

    return this.chat.getMessages(threadId);
  }

  // POST /chat/messages/:threadId
  @Post('messages/:threadId')
  async sendMessage(
    @FirebaseUser() user: { uid: string },
    @Param('threadId') threadId: string,
    @Body('content') content: string,
  ) {
    const allowed = await this.chat.userCanAccessThread(user.uid, threadId);
    if (!allowed) throw new ForbiddenException();

    return this.chat.sendMessage(threadId, user.uid, content);
  }
}
