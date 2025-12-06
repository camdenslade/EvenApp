// backend/src/swipe/swipe.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities --------------------------------------------------------------
import { Swipe } from '../database/entities/swipe.entity';

// DTOs ------------------------------------------------------------------
import { SwipeDto } from './dto/swipe.dto';

// Services ---------------------------------------------------------------
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class SwipeService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,

    private readonly users: UsersService,
    private readonly profiles: ProfilesService,
  ) {}

  // ====================================================================
  // # PERFORM SWIPE ACTION (PASS ONLY)
  // ====================================================================
  /**
   * Handles a swipe action.
   *
   * IMPORTANT CHANGE:
   *  Swiping is **pass-only**.
   *  Likes are now performed through a separate button action.
   *
   * Flow:
   *  1. Ensure swiper user exists
   *  2. Validate target user + profile exist
   *  3. Prevent duplicate swipes
   *  4. Record swipe as "pass"
   *
   * Returns:
   *  - swipe object
   *  - matchCreated: always false
   */
  async swipe(swiperUid: string, dto: SwipeDto) {
    const { targetUid } = dto;

    // Ensure user exists
    await this.users.ensureUserExists(swiperUid, null, null);

    // Validate target user
    const targetUser = await this.users.getByUid(targetUid);
    if (!targetUser) return { error: 'target user does not exist' };

    // Validate target profile
    const targetProfile = await this.profiles.getProfile(targetUid);
    if (!targetProfile) return { error: 'target user has no profile' };

    // Check for existing swipe
    const existing = await this.swipeRepo.findOne({
      where: { swiperUid, targetUid },
    });

    if (existing) return { swipe: existing, matchCreated: false };

    // Always record "pass"
    const swipe = this.swipeRepo.create({
      swiperUid,
      targetUid,
      direction: 'pass',
    });

    await this.swipeRepo.save(swipe);

    return { swipe, matchCreated: false };
  }
}
