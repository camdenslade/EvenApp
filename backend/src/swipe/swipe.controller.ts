import { Controller, Post, Body } from '@nestjs/common';
import { SwipeService } from './swipe.service';
import { SwipeDto } from './dto/swipe.dto';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

@Controller('swipe')
export class SwipeController {
  constructor(private readonly swipe: SwipeService) {}

  @Post()
  async swipeUser(
    @FirebaseUser() user: { uid: string },
    @Body() dto: SwipeDto,
  ) {
    return this.swipe.swipe(user.uid, dto);
  }
}
