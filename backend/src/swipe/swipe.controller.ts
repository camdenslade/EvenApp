// backend/src/swipe/swipe.controller.ts

import { Controller, Post, Body } from '@nestjs/common';

// Services --------------------------------------------------------------
import { SwipeService } from './swipe.service';

// DTOs ------------------------------------------------------------------
import { SwipeDto } from './dto/swipe.dto';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

@Controller('swipe')
export class SwipeController {
  constructor(private readonly swipe: SwipeService) {}

  // ====================================================================
  // # SWIPE USER
  // ====================================================================
  /**
   * POST /swipe
   *
   * Performs a swipe (like/dislike) from the authenticated user.
   * Handles:
   *  - Swipe creation
   *  - Duplicate prevention
   *  - Reciprocal swipe match
   */
  @Post()
  async swipeUser(
    @FirebaseUser() user: { uid: string },
    @Body() dto: SwipeDto,
  ) {
    return this.swipe.swipe(user.uid, dto);
  }
}
