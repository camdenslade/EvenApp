// backend/src/users/users.controller.ts

import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';

import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UsersService } from './users.service';
import { IsNumber } from 'class-validator';

/**
 * DTO for updating user geolocation.
 */
class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ====================================================================
  // # GET CURRENT USER
  // ====================================================================

  /**
   * GET /users/me
   *
   * Ensures the user exists in the database and returns their record.
   * Syncs email/phone with Firebase authentication data.
   */
  @Get('me')
  async getMe(
    @FirebaseUser()
    user: {
      uid: string;
      email: string | null;
      phone: string | null;
    },
  ) {
    return this.usersService.ensureUserExists(user.uid, user.email, user.phone);
  }

  // ====================================================================
  // # UPDATE LOCATION
  // ====================================================================

  /**
   * POST /users/update-location
   *
   * Updates the authenticated user's location and timestamps the change.
   */
  @Post('update-location')
  async updateLocation(
    @FirebaseUser()
    user: { uid: string },
    @Body() body: UpdateLocationDto,
  ) {
    return this.usersService.updateLocation(
      user.uid,
      body.latitude,
      body.longitude,
    );
  }

  // ====================================================================
  // # DELETE ACCOUNT
  // ====================================================================

  /**
   * DELETE /users/me
   *
   * Permanently deletes the authenticated user's full account and all
   * associated data:
   *
   * - Profile + photos (S3)
   * - Messages, threads, matches
   * - Swipes
   * - Reviews (written/received)
   * - Review strikes & weekly windows
   * - Emergency review records
   *
   * Additionally persists SafetyIdentity metadata (phone, strikes,
   * emergencyUsed) to prevent abuse resets and ban evasion.
   */
  @Delete('me')
  async deleteMe(
    @FirebaseUser()
    user: {
      uid: string;
    },
  ) {
    await this.usersService.deleteUser(user.uid);
    return { success: true };
  }
}
