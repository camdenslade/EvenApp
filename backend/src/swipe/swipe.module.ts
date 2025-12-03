import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Swipe } from '../database/entities/swipe.entity';
import { SwipeService } from './swipe.service';
import { SwipeController } from './swipe.controller';

import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Swipe]),
    UsersModule,
    ProfilesModule,
    MatchesModule,
  ],
  providers: [SwipeService],
  controllers: [SwipeController],
  exports: [SwipeService],
})
export class SwipeModule {}
