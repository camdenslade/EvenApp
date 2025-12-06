// backend/src/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities --------------------------------------------------------------
import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Match } from '../database/entities/match.entity';
import { Profile } from '../database/entities/profile.entity';

// Services --------------------------------------------------------------
import { ChatService } from './chat.service';

// Controllers -----------------------------------------------------------
import { ChatController } from './chat.controller';

// Gateways --------------------------------------------------------------
import { ChatGateway } from './chat.gateway';

// Modules ---------------------------------------------------------------
import { MatchesModule } from '../matches/matches.module';
import { UsersModule } from '../users/users.module';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    TypeOrmModule.forFeature([Thread, Message, Match, Profile]),
    MatchesModule,
    UsersModule,
  ],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [ChatService, ChatGateway],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [ChatController],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [ChatService],
})
export class ChatModule {}
