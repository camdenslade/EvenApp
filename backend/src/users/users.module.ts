// backend/src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// Entities --------------------------------------------------------------
import { User } from '../database/entities/user.entity';
import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';
import { Match } from '../database/entities/match.entity';
import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Review } from '../database/entities/review.entity';
import { ReviewStrike } from '../database/entities/review-strike.entity';
import { ReviewWeekWindow } from '../database/entities/review-week-window.entity';
import { ReviewEmergency } from '../database/entities/review-emergency.entity';
import { SafetyIdentity } from '../database/entities/safety-identity.entity';

// S3 -------------------------------------------------------------------
import { S3Module } from '../s3/s3.module';

/**
 * UsersModule
 *
 * Encapsulates:
 *  - User identity lifecycle
 *  - Location updates
 *  - Review timeout enforcement
 *  - Full account deletion (user → profile → swipes → matches → messages)
 *  - SafetyIdentity persistence (anti-abuse / anti-ban-evasion layer)
 *
 * Exports UsersService for use by:
 *  - ProfilesModule
 *  - MatchesModule
 *  - ReviewsModule
 *  - Messaging system
 *  - Swipe / Queue system
 */
@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Swipe,
      Match,
      Thread,
      Message,
      Review,
      ReviewStrike,
      ReviewWeekWindow,
      ReviewEmergency,
      SafetyIdentity,
    ]),

    S3Module,
  ],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [UsersController],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [UsersService],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [UsersService],
})
export class UsersModule {}
