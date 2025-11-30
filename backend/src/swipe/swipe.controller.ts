import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SwipeService } from './swipe.service';
import { Request } from 'express';

interface UserPayload {
  uid: string;
  sub?: string;
}

interface RequestWithUser extends Request {
  user: UserPayload;
}

interface SwipeBody {
  targetId: string;
  action: 'LIKE' | 'SKIP' | 'SUPER_LIKE';
}

@Controller('swipe')
export class SwipeController {
  constructor(private swipeService: SwipeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  swipe(@Req() req: RequestWithUser, @Body() body: SwipeBody): Promise<any> {
    const userId = req.user.uid || req.user.sub;
    if (typeof userId !== 'string')
      throw new UnauthorizedException('User ID Missing From Token Payload.');
    return this.swipeService.handleSwipe(userId, body.targetId, body.action);
  }
}
