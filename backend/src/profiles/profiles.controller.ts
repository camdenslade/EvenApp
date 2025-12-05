import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';
import { SetupProfileDto } from './dto/setup-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('status')
  async status(@FirebaseUser() user: { uid: string }) {
    return this.profiles.checkStatus(user.uid);
  }

  @Get('upload-url')
  async upload() {
    return this.profiles.createUploadUrl();
  }

  @Post('setup')
  async setup(
    @FirebaseUser() user: { uid: string },
    @Body() dto: SetupProfileDto,
  ) {
    return this.profiles.setup(user.uid, dto);
  }

  @Get('queue')
  async queue(@FirebaseUser() user: { uid: string }) {
    return this.profiles.getSwipeQueue(user.uid);
  }

  @Get('me')
  async me(@FirebaseUser() user: { uid: string }) {
    return this.profiles.getProfile(user.uid);
  }

  @Post('update')
  async update(
    @FirebaseUser() user: { uid: string },
    @Body() body: UpdateProfileDto,
  ) {
    if (
      body.sexPreference &&
      !['male', 'female', 'everyone'].includes(body.sexPreference)
    ) {
      delete body.sexPreference;
    }

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
}
