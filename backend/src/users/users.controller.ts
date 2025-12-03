import { Controller, Get } from '@nestjs/common';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';
import { UsersService } from './users.service';

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
    const dbUser = await this.usersService.ensureUserExists(
      user.uid,
      user.email,
      user.phone,
    );

    return dbUser;
  }
}
