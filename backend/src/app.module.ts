import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SwipeModule } from './swipe/swipe.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './database/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './search/search.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    SwipeModule,
    MatchesModule,
    ChatModule,
    SearchModule,
    ReviewsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
