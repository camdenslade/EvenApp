import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, TokenResponse } from './auth.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

interface FirebaseUserPayload {
  uid: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: FirebaseUserPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('login')
  login(@Req() req: RequestWithUser): Promise<TokenResponse> {
    return this.authService.createTokens(req.user);
  }
}
