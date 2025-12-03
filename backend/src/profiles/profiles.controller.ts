import { Controller, Get, Post, Body, Query } from '@nestjs/common';
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
  async upload(@Query('fileType') fileType: string) {
    return this.profiles.createUploadUrl(fileType);
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
    if (body.interestedInSex !== undefined) {
      if (
        body.interestedInSex === 'male' ||
        body.interestedInSex === 'female' ||
        body.interestedInSex === 'everyone'
      ) {
        body.sexPreference = body.interestedInSex;
      }

      delete body.interestedInSex;
    }

    return this.profiles.updateProfile(user.uid, body);
  }
}
