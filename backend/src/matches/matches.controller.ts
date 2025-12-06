// backend/src/matches/matches.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';

// Services --------------------------------------------------------------
import { MatchesService } from './matches.service';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // ====================================================================
  // # GET USER MATCHES
  // ====================================================================
  /**
   * GET /matches/me
   *
   * Returns all matches for the authenticated user.
   */
  @Get('me')
  async getMyMatches(@FirebaseUser() user: { uid: string }) {
    return this.matchesService.getMatches(user.uid);
  }

  // ====================================================================
  // # GET UNMESSAGED MATCHES
  // ====================================================================
  /**
   * GET /matches/unmessaged
   *
   * Returns matches where the user has not yet sent a message.
   * Useful for "Say hello" reminders.
   */
  @Get('unmessaged')
  async getUnmessaged(@FirebaseUser() user: { uid: string }) {
    return this.matchesService.getUnmessagedMatches(user.uid);
  }

  // ====================================================================
  // # CREATE MATCH
  // ====================================================================
  /**
   * POST /matches
   *
   * Manually creates a match between the logged-in user and a target user.
   * Usually triggered when two likes occur simultaneously or for testing.
   */
  @Post()
  async createMatch(
    @FirebaseUser() user: { uid: string },
    @Body('targetId') targetId: string,
  ) {
    return this.matchesService.createMatch(user.uid, targetId);
  }
}
