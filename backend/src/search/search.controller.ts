// backend/src/search/search.controller.ts

import { Controller, Get, Query } from '@nestjs/common';

// Decorators ------------------------------------------------------------
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';

// Services --------------------------------------------------------------
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ====================================================================
  // # SEARCH BY NAME
  // ====================================================================
  /**
   * GET /search/name
   *
   * Searches profiles by first name and filters by distance from the
   * authenticated user. Default radius = 25 miles.
   */
  @Get('name')
  async searchByName(
    @FirebaseUser() user: { uid: string },
    @Query('name') name: string,
    @Query('radius') radius?: string,
  ) {
    const miles = radius ? Number(radius) : 25;
    return this.searchService.searchByName(user.uid, name, miles);
  }
}
