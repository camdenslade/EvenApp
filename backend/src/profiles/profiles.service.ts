// backend/src/profiles/profiles.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities --------------------------------------------------------------
import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';

// Services --------------------------------------------------------------
import { UsersService } from '../users/users.service';
import { S3Service } from '../s3/s3.service';

// DTOs ------------------------------------------------------------------
import { SetupProfileDto } from './dto/setup-profile.dto';

// ====================================================================
// # PROFILE RESPONSE INTERFACE
// ====================================================================
//
// Extends the Profile entity with computed fields for API responses.
//

export interface ProfileResponse extends Profile {
  profileImageUrl: string | null;
  age: number;
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,

    private readonly usersService: UsersService,
    private readonly s3: S3Service,
  ) {}

  // ====================================================================
  // # PRIVATE HELPERS
  // ====================================================================

  /**
   * Calculates age based on birthday (YYYY-MM-DD).
   */
  private calculateAge(birthday: string): number {
    const b = new Date(birthday);
    const diff = Date.now() - b.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  /**
   * Maps a Profile entity into a ProfileResponse with computed fields.
   */
  private toResponse(profile: Profile): ProfileResponse {
    return {
      ...profile,
      profileImageUrl: profile.photos?.[0] ?? null,
      age: this.calculateAge(profile.birthday),
    };
  }

  // ====================================================================
  // # FETCH PROFILE
  // ====================================================================

  async getProfile(uid: string): Promise<ProfileResponse | null> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    return profile ? this.toResponse(profile) : null;
  }

  /**
   * Returns profile status used by onboarding.
   */
  async checkStatus(uid: string): Promise<{ status: 'missing' | 'complete' }> {
    const exists = await this.getProfile(uid);
    return { status: exists ? 'complete' : 'missing' };
  }

  // ====================================================================
  // # PHOTO UPLOAD URL
  // ====================================================================

  /**
   * Creates an S3 pre-signed upload URL.
   */
  async createUploadUrl() {
    return this.s3.createUploadUrl();
  }

  // ====================================================================
  // # PROFILE SETUP
  // ====================================================================

  /**
   * Creates or updates the user's profile based on onboarding data.
   */
  async setup(uid: string, dto: SetupProfileDto): Promise<ProfileResponse> {
    await this.usersService.ensureUserExists(uid, null, null);

    let profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) {
      profile = this.profilesRepo.create({
        userUid: uid,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  // ====================================================================
  // # PROFILE UPDATE
  // ====================================================================

  async updateProfile(
    uid: string,
    data: Partial<Profile>,
  ): Promise<ProfileResponse> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    Object.assign(profile, data);

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  // ====================================================================
  // # SWIPE QUEUE GENERATION
  // ====================================================================

  /**
   * Returns up to 20 profiles eligible for swiping.
   * Excludes:
   *  - self
   *  - already swiped users
   *  - incompatible sex preference matches
   */
  async getSwipeQueue(uid: string): Promise<ProfileResponse[]> {
    const me = await this.getProfile(uid);
    if (!me) return [];

    // All users we have already swiped
    const swiped = await this.swipeRepo.find({
      where: { swiperUid: uid },
    });

    const swipedIds = new Set(swiped.map((s) => s.targetUid));
    swipedIds.add(uid); // exclude self

    const qb = this.profilesRepo
      .createQueryBuilder('p')
      .where('p.userUid NOT IN (:...ids)', { ids: Array.from(swipedIds) });

    // Filter by gender preference
    if (me.sexPreference !== 'everyone') {
      qb.andWhere('p.sex = :pref', { pref: me.sexPreference });
    }

    qb.andWhere('p.sexPreference IN (:...accepted)', {
      accepted: ['everyone', me.sex],
    });

    const results = await qb.orderBy('RANDOM()').limit(20).getMany();

    return results.map((p) => this.toResponse(p));
  }

  // ====================================================================
  // # DELETE PROFILE
  // ====================================================================

  /**
   * Deletes profile, photos, and attempts to delete the user.
   */
  async deleteProfile(uid: string): Promise<void> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    // Delete S3 photos
    if (profile.photos?.length) {
      await Promise.all(
        profile.photos.map(async (key) => {
          if (!key) return;
          try {
            await this.s3.deleteObject(key);
          } catch {
            /* ignore S3 errors */
          }
        }),
      );
    }

    // Delete profile row
    await this.profilesRepo.delete({ userUid: uid });

    // Attempt to delete user as well
    try {
      await this.usersService.deleteUser(uid);
    } catch {
      /* ignore user deletion errors */
    }
  }

  // ====================================================================
  // # PHOTO MANAGEMENT
  // ====================================================================

  async updatePhotos(uid: string, photos: string[]): Promise<ProfileResponse> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    profile.photos = photos;

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  async deletePhotoByIndex(
    uid: string,
    index: number,
  ): Promise<ProfileResponse> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    if (!profile.photos || index < 0 || index >= profile.photos.length) {
      throw new NotFoundException('Photo does not exist');
    }

    const key = profile.photos[index];

    // Delete photo from S3
    if (key) {
      try {
        await this.s3.deleteObject(key);
      } catch {
        /* ignore S3 errors */
      }
    }

    // Remove from array
    profile.photos.splice(index, 1);

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  // ====================================================================
  // # PUBLIC PROFILE (READ-ONLY)
  // ====================================================================

  async getPublicProfile(uid: string): Promise<ProfileResponse> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return this.toResponse(profile);
  }

  // ====================================================================
  // # PAUSE / UNPAUSE PROFILE
  // ====================================================================

  async pauseProfile(uid: string) {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    profile.paused = true;

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  async unpauseProfile(uid: string) {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    profile.paused = false;

    const saved = await this.profilesRepo.save(profile);
    return this.toResponse(saved);
  }

  // ====================================================================
  // # LOCATION DELEGATION
  // ====================================================================

  /**
   * Pass-through to UsersService for updating geo-coordinates.
   */
  async updateLocation(uid: string, lat: number, lng: number) {
    await this.usersService.updateLocation(uid, lat, lng);
    return { success: true };
  }
}
