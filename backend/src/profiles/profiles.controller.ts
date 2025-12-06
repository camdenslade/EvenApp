// backend/src/profiles/profiles.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

// Services --------------------------------------------------------------
import { ProfilesService } from './profiles.service';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

// DTOs ------------------------------------------------------------------
import { SetupProfileDto } from './dto/setup-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  // ====================================================================
  // # PROFILE STATUS
  // ====================================================================
  /**
   * GET /profiles/status
   *
   * Returns whether the current user has a completed profile.
   */
  @Get('status')
  async status(@FirebaseUser() user: { uid: string }) {
    return this.profiles.checkStatus(user.uid);
  }

  // ====================================================================
  // # UPLOAD URL
  // ====================================================================
  /**
   * GET /profiles/upload-url
   *
   * Returns an S3 pre-signed URL for uploading photos.
   */
  @Get('upload-url')
  async upload() {
    return this.profiles.createUploadUrl();
  }

  // ====================================================================
  // # PROFILE SETUP
  // ====================================================================
  /**
   * POST /profiles/setup
   *
   * Creates or updates the user's onboarding profile.
   */
  @Post('setup')
  async setup(
    @FirebaseUser() user: { uid: string },
    @Body() dto: SetupProfileDto,
  ) {
    return this.profiles.setup(user.uid, dto);
  }

  // ====================================================================
  // # SWIPE QUEUE
  // ====================================================================
  /**
   * GET /profiles/queue
   *
   * Returns a randomized queue of profiles to swipe on.
   */
  @Get('queue')
  async queue(@FirebaseUser() user: { uid: string }) {
    return this.profiles.getSwipeQueue(user.uid);
  }

  // ====================================================================
  // # GET OWN PROFILE
  // ====================================================================
  @Get('me')
  async me(@FirebaseUser() user: { uid: string }) {
    return this.profiles.getProfile(user.uid);
  }

  // ====================================================================
  // # UPDATE OWN PROFILE
  // ====================================================================
  /**
   * PATCH /profiles/me
   *
   * Allows partial updates to the user's profile.
   * Invalid enum values are automatically stripped.
   */
  @Patch('me')
  async updateProfile(
    @FirebaseUser() user: { uid: string },
    @Body() body: UpdateProfileDto,
  ) {
    // Strip invalid sexPreference
    if (
      body.sexPreference &&
      !['male', 'female', 'everyone'].includes(body.sexPreference)
    ) {
      delete body.sexPreference;
    }

    // Strip invalid datingPreference
    if (
      body.datingPreference &&
      ![
        'hookups',
        'situationship',
        'short_term_relationship',
        'short_term_open',
        'long_term_open',
        'long_term_relationship',
      ].includes(body.datingPreference)
    ) {
      delete body.datingPreference;
    }

    return this.profiles.updateProfile(user.uid, body);
  }

  // ====================================================================
  // # DELETE PROFILE
  // ====================================================================
  /**
   * DELETE /profiles/me
   *
   * Deletes:
   * - profile
   * - photos
   * - associated user account (soft fail on errors)
   */
  @Delete('me')
  async deleteMe(@FirebaseUser() user: { uid: string }) {
    return this.profiles.deleteProfile(user.uid);
  }

  // ====================================================================
  // # UPDATE PHOTOS
  // ====================================================================
  @Patch('me/photos')
  async updatePhotos(
    @FirebaseUser() user: { uid: string },
    @Body() body: { photos: string[] },
  ) {
    return this.profiles.updatePhotos(user.uid, body.photos);
  }

  // ====================================================================
  // # DELETE INDIVIDUAL PHOTO
  // ====================================================================
  @Delete('me/photo/:index')
  async deletePhoto(
    @FirebaseUser() user: { uid: string },
    @Param('index') index: string,
  ) {
    return this.profiles.deletePhotoByIndex(user.uid, Number(index));
  }

  // ====================================================================
  // # PUBLIC PROFILE LOOKUP
  // ====================================================================
  @Get(':uid')
  async getPublic(@Param('uid') uid: string) {
    return this.profiles.getPublicProfile(uid);
  }

  // ====================================================================
  // # PAUSE / UNPAUSE PROFILE
  // ====================================================================
  @Patch('me/pause')
  async pause(@FirebaseUser() user: { uid: string }) {
    return this.profiles.pauseProfile(user.uid);
  }

  @Patch('me/unpause')
  async unpause(@FirebaseUser() user: { uid: string }) {
    return this.profiles.unpauseProfile(user.uid);
  }

  // ====================================================================
  // # UPDATE LOCATION (DELEGATED TO USERS SERVICE)
  // ====================================================================
  @Patch('update-location')
  async updateLocation(
    @FirebaseUser() user: { uid: string },
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.profiles.updateLocation(user.uid, lat, lng);
  }
}
