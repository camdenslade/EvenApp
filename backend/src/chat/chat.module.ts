import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Match } from '../database/entities/match.entity';
import { Profile } from '../database/entities/profile.entity';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

import { MatchesModule } from '../matches/matches.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread, Message, Match, Profile]),
    MatchesModule,
    UsersModule,
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
