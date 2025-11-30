import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';

@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('matches')
  async getMatches(@Req() req: AuthenticatedRequest) {
    const currentUserId = req.user.uid;
    return this.matchesService.getMatches(currentUserId);
  }
}
