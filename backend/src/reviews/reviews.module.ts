// backend/src/reviews/reviews.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities --------------------------------------------------------------
import { Review } from '../database/entities/review.entity';
import { ReviewStrike } from '../database/entities/review-strike.entity';
import { ReviewWeekWindow } from '../database/entities/review-week-window.entity';
import { ReviewEmergency } from '../database/entities/review-emergency.entity';

// Modules ---------------------------------------------------------------
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';

// Services --------------------------------------------------------------
import { ReviewsService } from './reviews.service';

// Controllers -----------------------------------------------------------
import { ReviewsController } from './reviews.controller';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewStrike,
      ReviewWeekWindow,
      ReviewEmergency,
    ]),
    UsersModule,
    ChatModule,
  ],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [ReviewsController],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [ReviewsService],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [ReviewsService],
})
export class ReviewsModule {}
