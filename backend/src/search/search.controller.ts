import { Controller, Get, Query } from '@nestjs/common';
import { FirebaseUser } from '../auth/firebase/firebase-user.decorator';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

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
