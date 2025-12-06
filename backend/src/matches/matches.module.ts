// backend/src/matches/matches.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities --------------------------------------------------------------
import { Match } from '../database/entities/match.entity';
import { Thread } from '../database/entities/thread.entity';
import { Profile } from '../database/entities/profile.entity';

// Services --------------------------------------------------------------
import { MatchesService } from './matches.service';

// Controllers -----------------------------------------------------------
import { MatchesController } from './matches.controller';

// Modules ---------------------------------------------------------------
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    TypeOrmModule.forFeature([Match, Thread, Profile]),
    UsersModule,
    ProfilesModule,
  ],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [MatchesService],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [MatchesController],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [MatchesService],
})
export class MatchesModule {}
