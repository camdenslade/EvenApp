// backend/src/swipe/swipe.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities --------------------------------------------------------------
import { Swipe } from '../database/entities/swipe.entity';

// Services --------------------------------------------------------------
import { SwipeService } from './swipe.service';

// Controllers -----------------------------------------------------------
import { SwipeController } from './swipe.controller';

// Modules ---------------------------------------------------------------
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    TypeOrmModule.forFeature([Swipe]),
    UsersModule,
    ProfilesModule,
    MatchesModule,
  ],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [SwipeService],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [SwipeController],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [SwipeService],
})
export class SwipeModule {}
