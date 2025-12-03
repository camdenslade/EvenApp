import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Match } from '../database/entities/match.entity';
import { Thread } from '../database/entities/thread.entity';
import { Profile } from '../database/entities/profile.entity';

import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';

import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Thread, Profile]),
    UsersModule,
    ProfilesModule,
  ],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
