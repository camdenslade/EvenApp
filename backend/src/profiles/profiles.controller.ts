import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import type { SetupProfileData } from './types/setup-profile';
import type { UpdateProfileData } from './types/update-profile';
import { S3Service } from '../s3/s3.service';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('queue')
  getQueue(@Req() req: AuthenticatedRequest) {
    return this.profilesService.getQueue(req.user.uid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('setup')
  setup(@Req() req: AuthenticatedRequest, @Body() body: SetupProfileData) {
    return this.profilesService.setupProfile(req.user.uid, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  update(@Req() req: AuthenticatedRequest, @Body() body: UpdateProfileData) {
    return this.profilesService.updateProfile(req.user.uid, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-url')
  getUploadUrl(@Req() req: AuthenticatedRequest) {
    const key = `users/${req.user.uid}/${Date.now()}.jpg`;
    return this.s3Service.createUploadUrl(key);
  }
}
