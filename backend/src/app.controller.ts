import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FirestoreService } from './firebase/firestore.service';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly firestore: FirestoreService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const uid = req.user.uid;
    const data = await this.firestore.collection('users').doc(uid).get();
    return data.exists ? data.data() : null;
  }
}
