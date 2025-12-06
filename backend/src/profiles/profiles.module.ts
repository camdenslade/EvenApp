// backend/src/profiles/profiles.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services --------------------------------------------------------------
import { ProfilesService } from './profiles.service';

// Controllers -----------------------------------------------------------
import { ProfilesController } from './profiles.controller';

// Entities --------------------------------------------------------------
import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';

// Modules ---------------------------------------------------------------
import { UsersModule } from '../users/users.module';
import { S3Module } from '../s3/s3.module';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [TypeOrmModule.forFeature([Profile, Swipe]), UsersModule, S3Module],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [ProfilesService],

  // ====================================================================
  // # CONTROLLERS
  // ====================================================================
  controllers: [ProfilesController],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [ProfilesService],
})
export class ProfilesModule {}
