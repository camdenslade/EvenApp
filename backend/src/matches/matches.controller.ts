import { Controller, Get, Post, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // GET /matches/me
  @Get('me')
  async getMyMatches(@FirebaseUser() user: { uid: string }) {
    return this.matchesService.getMatches(user.uid);
  }

  // POST /matches
  // Body: { "targetId": "<uid>" }
  @Post()
  async createMatch(
    @FirebaseUser() user: { uid: string },
    @Body('targetId') targetId: string,
  ) {
    return this.matchesService.createMatch(user.uid, targetId);
  }
}
