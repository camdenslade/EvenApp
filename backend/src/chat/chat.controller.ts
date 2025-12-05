import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

class SendMessageDto {
  content!: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('threads')
  async getThreads(@FirebaseUser() user: { uid: string }) {
    return this.chat.getUserThreads(user.uid);
  }

  @Get('messages/:threadId')
  async getMessages(
    @FirebaseUser() user: { uid: string },
    @Param('threadId') threadId: string,
  ) {
    const allowed = await this.chat.userCanAccessThread(user.uid, threadId);
    if (!allowed) throw new ForbiddenException('Access denied');

    return this.chat.getMessages(threadId);
  }

  @Post('messages/:threadId')
  async sendMessage(
    @FirebaseUser() user: { uid: string },
    @Param('threadId') threadId: string,
    @Body() body: SendMessageDto,
  ) {
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new BadRequestException('Message content is required');
    }

    const allowed = await this.chat.userCanAccessThread(user.uid, threadId);
    if (!allowed) throw new ForbiddenException('Access denied');

    return this.chat.sendMessage(threadId, user.uid, content.trim());
  }
}
