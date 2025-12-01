import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import type { SetupProfileData } from './types/setup-profile';
import type { UpdateProfileData } from './types/update-profile';
import { S3Service } from '../s3/s3.service';
import { ProfileGuard } from '../guards/profile.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Req() req: AuthenticatedRequest) {
    return this.profilesService.checkProfileCompletion(req.user.uid);
  }

  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Get('queue')
  getQueue(@Req() req: AuthenticatedRequest) {
    return this.profilesService.getQueue(req.user.uid);
  }

  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Post('setup')
  setup(@Req() req: AuthenticatedRequest, @Body() body: SetupProfileData) {
    return this.profilesService.setupProfile(req.user.uid, body);
  }

  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Post('update')
  update(@Req() req: AuthenticatedRequest, @Body() body: UpdateProfileData) {
    return this.profilesService.updateProfile(req.user.uid, body);
  }

  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Post('upload-url')
  getUploadUrl(@Req() req: AuthenticatedRequest) {
    const key = `users/${req.user.uid}/${Date.now()}.jpg`;
    return this.s3Service.createUploadUrl(key);
  }
}
