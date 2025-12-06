// backend/src/chat/chat.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

// Services --------------------------------------------------------------
import { ChatService } from './chat.service';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

// DTOs ------------------------------------------------------------------
class SendMessageDto {
  content!: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // ====================================================================
  // # GET USER THREADS
  // ====================================================================
  /**
   * GET /chat/threads
   *
   * Returns all chat threads associated with the authenticated user.
   */
  @Get('threads')
  async getThreads(@FirebaseUser() user: { uid: string }) {
    return this.chat.getUserThreads(user.uid);
  }

  // ====================================================================
  // # GET MESSAGES IN A THREAD
  // ====================================================================
  /**
   * GET /chat/messages/:threadId
   *
   * Returns all messages in a thread,
   * only if the authenticated user is allowed to access it.
   */
  @Get('messages/:threadId')
  async getMessages(
    @FirebaseUser() user: { uid: string },
    @Param('threadId') threadId: string,
  ) {
    const allowed = await this.chat.userCanAccessThread(user.uid, threadId);
    if (!allowed) throw new ForbiddenException('Access denied');

    return this.chat.getMessages(threadId);
  }

  // ====================================================================
  // # SEND MESSAGE
  // ====================================================================
  /**
   * POST /chat/messages/:threadId
   *
   * Sends a text message into a thread.
   *
   * Validation:
   *  - content must exist and be non-empty
   *  - user must be authorized to access thread
   */
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
