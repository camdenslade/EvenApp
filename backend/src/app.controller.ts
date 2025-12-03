import { Controller, Get } from '@nestjs/common';
import { ProfilesService } from './profiles/profiles.service';
import { FirebaseUser } from './auth/firebase/firebase-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly profilesService: ProfilesService) {}

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
