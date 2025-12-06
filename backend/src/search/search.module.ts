// backend/src/search/search.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers -----------------------------------------------------------
import { SearchController } from './search.controller';

// Services --------------------------------------------------------------
import { SearchService } from './search.service';

// Entities --------------------------------------------------------------
import { Profile } from '../database/entities/profile.entity';
import { User } from '../database/entities/user.entity';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [TypeOrmModule.forFeature([Profile, User])],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [SearchController],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [SearchService],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [SearchService],
})
export class SearchModule {}
