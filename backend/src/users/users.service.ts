// backend/src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

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
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(Swipe)
    private readonly swipesRepo: Repository<Swipe>,

    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,

    @InjectRepository(Thread)
    private readonly threadsRepo: Repository<Thread>,

    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,

    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,

    @InjectRepository(ReviewStrike)
    private readonly reviewStrikesRepo: Repository<ReviewStrike>,

    @InjectRepository(ReviewWeekWindow)
    private readonly reviewWeekWindowRepo: Repository<ReviewWeekWindow>,

    @InjectRepository(ReviewEmergency)
    private readonly reviewEmergencyRepo: Repository<ReviewEmergency>,

    @InjectRepository(SafetyIdentity)
    private readonly safetyRepo: Repository<SafetyIdentity>,

    private readonly s3: S3Service,
  ) {}

  // ====================================================================
  // # USER CREATION + SYNC
  // ====================================================================

  /**
   * Ensures a User row exists for a Firebase UID.
   * Syncs phone/email on every login or signup.
   */
  async ensureUserExists(
    uid: string,
    email: string | null,
    phone: string | null,
  ): Promise<User> {
    let user = await this.usersRepo.findOne({ where: { uid } });

    if (!user) {
      user = this.usersRepo.create({
        uid,
        email,
        phone,
        reviewTimeoutExpiresAt: null,
      });
      return this.usersRepo.save(user);
    }

    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;

    return this.usersRepo.save(user);
  }

  /**
   * Fetch user by UID.
   */
  async getByUid(uid: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { uid } });
  }

  // ====================================================================
  // # LOCATION UPDATES
  // ====================================================================

  /**
   * Updates a user's geographic location.
   */
  async updateLocation(uid: string, lat: number, lng: number) {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    user.latitude = lat;
    user.longitude = lng;
    user.lastLocationUpdate = new Date();

    await this.usersRepo.save(user);

    return {
      success: true,
      latitude: user.latitude,
      longitude: user.longitude,
      lastLocationUpdate: user.lastLocationUpdate,
    };
  }

  // ====================================================================
  // # REVIEW TIMEOUT SYSTEM
  // ====================================================================

  /**
   * Applies a temporary review timeout.
   */
  async setReviewTimeout(uid: string, durationMs: number): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    user.reviewTimeoutExpiresAt = new Date(Date.now() + durationMs);
    await this.usersRepo.save(user);
  }

  /**
   * Clears a review timeout.
   */
  async clearReviewTimeout(uid: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    user.reviewTimeoutExpiresAt = null;
    await this.usersRepo.save(user);
  }

  /**
   * Fetch review timeout expiration.
   */
  async getReviewTimeout(uid: string): Promise<Date | null> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    return user.reviewTimeoutExpiresAt ?? null;
  }

  /**
   * Check if user is currently timed out from reviewing.
   */
  async isUserTimedOut(uid: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    const expires = user.reviewTimeoutExpiresAt;
    if (!expires) return false;

    return expires.getTime() > Date.now();
  }

  // ====================================================================
  // # FULL ACCOUNT DELETION (WITH SAFETY IDENTITY)
  // ====================================================================

  /**
   * Deletes a user + all related data.
   * Persists SafetyIdentity metadata before deletion.
   */
  async deleteUser(uid: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) return;

    // ------------------------------------------------------------------
    // #1 — SAFETY IDENTITY PERSISTENCE
    // ------------------------------------------------------------------
    if (user.phone) {
      const emergencyUsed = await this.reviewEmergencyRepo.exist({
        where: [{ reviewer: { uid } }, { target: { uid } }],
      });

      const strikeCount = await this.reviewStrikesRepo.count({
        where: { user: { uid } },
      });

      await this.safetyRepo.save({
        phone: user.phone,
        emergencyUsed,
        strikes: strikeCount,
        lastReviewTimeout: user.reviewTimeoutExpiresAt ?? null,
      });
    }

    // ------------------------------------------------------------------
    // #2 — DELETE PROFILE + S3 PHOTOS
    // ------------------------------------------------------------------
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (profile) {
      if (profile.photos?.length) {
        await Promise.all(
          profile.photos.map(async (key) => {
            if (!key) return;
            try {
              await this.s3.deleteObject(key);
            } catch {
              /* ignore S3 delete errors */
            }
          }),
        );
      }

      await this.profilesRepo.delete({ userUid: uid });
    }

    // ------------------------------------------------------------------
    // #3 — DELETE REVIEW SYSTEM DATA
    // ------------------------------------------------------------------
    await this.reviewsRepo.delete({ reviewerUid: uid });
    await this.reviewsRepo.delete({ targetUid: uid });
    await this.reviewStrikesRepo.delete({ user: { uid } });
    await this.reviewWeekWindowRepo.delete({ user: { uid } });
    await this.reviewEmergencyRepo.delete({ reviewer: { uid } });
    await this.reviewEmergencyRepo.delete({ target: { uid } });

    // ------------------------------------------------------------------
    // #4 — DELETE MATCH → THREAD → MESSAGE GRAPH
    // ------------------------------------------------------------------
    const matches = await this.matchesRepo.find({
      where: [{ userAUid: uid }, { userBUid: uid }],
    });

    const matchIds = matches.map((m) => m.id);

    if (matchIds.length > 0) {
      await this.messagesRepo.delete({ thread: { matchId: In(matchIds) } });
      await this.threadsRepo.delete({ matchId: In(matchIds) });
      await this.matchesRepo.delete({ id: In(matchIds) });
    }

    // ------------------------------------------------------------------
    // #5 — DELETE SWIPES
    // ------------------------------------------------------------------
    await this.swipesRepo.delete({ swiperUid: uid });
    await this.swipesRepo.delete({ targetUid: uid });

    // ------------------------------------------------------------------
    // #6 — DELETE USER
    // ------------------------------------------------------------------
    await this.usersRepo.delete({ uid });
  }
}
