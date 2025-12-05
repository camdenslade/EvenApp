import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';

import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UsersService } from './users.service';

class UpdateLocationDto {
  latitude: number;
  longitude: number;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Post('update-location')
  @UseGuards(FirebaseAuthGuard)
  async updateLocation(
    @Req() req: { user: { uid: string } },
    @Body() body: UpdateLocationDto,
  ) {
    return this.usersService.updateLocation(
      req.user.uid,
      body.latitude,
      body.longitude,
    );
  }
}
