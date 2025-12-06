// backend/src/app.controller.ts

import { Controller, Get } from '@nestjs/common';

// Services --------------------------------------------------------------
import { ProfilesService } from './profiles/profiles.service';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from './auth/firebase/firebase-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly profilesService: ProfilesService) {}

  // ====================================================================
  // # GET AUTHENTICATED USER PROFILE
  // ====================================================================
  /**
   * GET /me
   *
   * Returns the authenticated user's profile.
   * Requires FirebaseAuthGuard globally applied.
   */
  @Get('me')
  async me(
    @FirebaseUser()
    user: {
      uid: string;
      email: string | null;
      phone: string | null;
    },
  ) {
    return this.profilesService.getProfile(user.uid);
  }
}
